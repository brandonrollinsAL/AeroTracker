import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    fontFamily: {
      sans: ["Montserrat", "Open Sans", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
      heading: ["Montserrat", "sans-serif"],
      body: ["Open Sans", "sans-serif"],
    },
    extend: {
      fontSize: {
        'heading': '48px',
        'subheading': '20px',
        'body': '16px',
        'label': '14px',
      },
      fontWeight: {
        'heading': '700',
        'subheading': '500',
        'body': '400',
        'label': '500',
      },
      lineHeight: {
        'default': '1.6',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          blue: {
            DEFAULT: "#1E3A8A",
            dark: "#1E3A8A",
            light: "#3B82F6", 
            ultraLight: "#93C5FD",
          }
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
          orange: "#F97316",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
          red: "#EF4444",
        },
        text: {
          primary: "#1E3A8A",
          secondary: "#6B7280",
          light: "#FFFFFF",
        },
        bg: {
          primary: "#FFFFFF",
          secondary: "#F3F4F6",
          dark: "#1E3A8A",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        metallic: "#C0C0C0",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        status: {
          active: "#22C55E",
          landed: "#3B82F6",
          scheduled: "#F97316",
          delayed: "#EF4444",
          cancelled: "#EF4444",
          diverted: "#8B5CF6",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        aviation: {
          altitude: {
            high: "#1E3A8A",
            medium: "#3B82F6",
            low: "#93C5FD"
          },
          weather: {
            clear: "#22C55E",
            clouds: "#94A3B8",
            rain: "#60A5FA",
            storm: "#8B5CF6",
            snow: "#E2E8F0",
            fog: "#CBD5E1"
          },
          airports: {
            international: "#1E3A8A",
            domestic: "#93C5FD",
            regional: "#60A5FA"
          }
        }
      },
      boxShadow: {
        'glowSmall': '0 0 8px rgba(30, 58, 138, 0.3)',
        'glowMedium': '0 0 15px rgba(30, 58, 138, 0.5)',
        'glowLarge': '0 0 25px rgba(30, 58, 138, 0.7)',
        'buttonHover': '0 0 8px rgba(249, 115, 22, 0.5)',
        'cardHover': '0 0 12px rgba(30, 58, 138, 0.2)',
        'flightPath': '0 0 0 2px rgba(30, 58, 138, 0.25), 0 0 10px rgba(30, 58, 138, 0.3)',
        'runwayLight': '0 0 5px rgba(147, 197, 253, 0.7), 0 0 15px rgba(30, 58, 138, 0.5)',
        'cockpitCard': '0 4px 8px rgba(0, 0, 0, 0.1)'
      },
      backdropBlur: {
        'frosted': '12px',
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "bounce": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-in": {
          from: { transform: "translateY(20px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        "scale": {
          from: { transform: "scale(0.9)" },
          to: { transform: "scale(1)" },
        },
        "clouds-floating": {
          "0%": { transform: "translateX(0) translateY(0)" },
          "50%": { transform: "translateX(5px) translateY(-5px)" },
          "100%": { transform: "translateX(0) translateY(0)" }
        },
        "ripple": {
          "0%": { transform: "scale(0)", opacity: "1" },
          "100%": { transform: "scale(4)", opacity: "0" }
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "bounce": "bounce 0.8s ease-in-out",
        "fade-in": "fade-in 0.5s ease-in-out",
        "slide-in": "slide-in 0.3s ease-in-out",
        "scale": "scale 0.3s ease-in-out",
        "clouds": "clouds-floating 10s linear infinite",
        "ripple": "ripple 1s ease-out"
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #1E3A8A, #3B82F6)',
        'gradient-accent': 'linear-gradient(to right, #1E3A8A, #60A5FA)',
        'gradient-light': 'linear-gradient(135deg, #3B82F6, #93C5FD)',
        'gradient-horizon': 'linear-gradient(to bottom, #1E3A8A 0%, #3B82F6 45%, #93C5FD 100%)',
        'gradient-sky': 'linear-gradient(to bottom, #93C5FD, #60A5FA)',
        'gradient-cockpit': 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 35%, #60A5FA 100%)',
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
