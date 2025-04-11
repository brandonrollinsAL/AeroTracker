import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import jwt from "jsonwebtoken";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
// Import PostgreSQL session store with dynamic import for ES Module compatibility
import { pool } from "./db";
import pgSession from "connect-pg-simple";
import { validationResult, body } from "express-validator";

// Create session store
const PostgresSessionStore = pgSession(session);

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

// JWT Settings
const JWT_SECRET = process.env.JWT_SECRET || 'aero-tracker-jwt-secret-dev';
const JWT_EXPIRES_IN = '24h'; // Token expires in 24 hours

// Function to generate a JWT token
function generateJwtToken(user: SelectUser) {
  const { password, ...userDataForToken } = user;
  return jwt.sign(
    userDataForToken, 
    JWT_SECRET, 
    { 
      expiresIn: JWT_EXPIRES_IN,
      subject: user.id.toString()
    }
  );
}

// JWT Authentication Middleware
function authenticateJWT(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ error: 'Token is invalid or expired' });
      }
      
      // Add the decoded user to request
      req.user = user as Express.User;
      next();
    });
  } else {
    // If no token, continue with session-based auth
    next();
  }
}

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

async function checkUsernameAvailability(username: string) {
  const existingUser = await storage.getUserByUsername(username);
  return existingUser === undefined;
}

async function checkEmailExists(email: string) {
  const existingUser = await storage.getUserByEmail(email);
  return existingUser !== undefined;
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || 'aero-tracker-session-secret-dev',
    resave: false,
    saveUninitialized: false,
    store: new PostgresSessionStore({
      pool,
      tableName: 'user_sessions',
      createTableIfMissing: true,
    }),
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false, { message: "Invalid username or password" });
        } else {
          return done(null, user);
        }
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Enhanced registration with validation and security checks
  app.post("/api/register", [
    body('username')
      .trim()
      .isLength({ min: 3 }).withMessage('Username must be at least 3 characters long')
      .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers, and underscores')
      .escape(),
    body('password')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    body('email')
      .trim()
      .isEmail().withMessage('Invalid email format')
      .normalizeEmail()
  ], async (req, res, next) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const { username, password, email } = req.body;

      const isUsernameAvailable = await checkUsernameAvailability(username);
      if (!isUsernameAvailable) {
        return res.status(400).json({ error: "Username already exists" });
      }

      const isEmailTaken = await checkEmailExists(email);
      if (isEmailTaken) {
        return res.status(400).json({ error: "Email is already registered" });
      }

      const user = await storage.createUser({
        username,
        password: await hashPassword(password),
        email,
        preferences: {
          theme: 'light',
          mapFilters: {
            showFlightPaths: true,
            showWeather: false,
            aircraftTypes: []
          },
          uiSettings: {
            dataRefreshRate: 5,
            animationsEnabled: true
          }
        }
      });

      req.login(user, (err) => {
        if (err) return next(err);
        // Don't send the password hash back to the client
        const { password, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Registration failed due to server error" });
    }
  });

  // Enhanced login with JWT token generation and input validation
  app.post("/api/login", [
    body('username').trim().notEmpty().withMessage('Username is required'),
    body('password').trim().notEmpty().withMessage('Password is required')
  ], (req, res, next) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    passport.authenticate("local", (err: any, user: Express.User | false, info: { message: string } | undefined) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ error: info?.message || "Authentication failed" });
      }
      req.login(user, (err: any) => {
        if (err) return next(err);
        
        // Generate JWT token
        const token = generateJwtToken(user);
        
        // Don't send the password hash back to the client
        const { password, ...userWithoutPassword } = user;
        
        // Send both user data and JWT token
        res.status(200).json({
          user: userWithoutPassword,
          token: token,
          expiresIn: JWT_EXPIRES_IN
        });
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err: any) => {
      if (err) return next(err);
      req.session.destroy((err: any) => {
        if (err) return next(err);
        res.clearCookie("connect.sid");
        res.sendStatus(200);
      });
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    // Don't send the password hash back to the client
    const { password, ...userWithoutPassword } = req.user as Express.User;
    res.json(userWithoutPassword);
  });
}