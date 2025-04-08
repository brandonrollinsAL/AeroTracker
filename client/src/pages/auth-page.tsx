import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Redirect } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [formError, setFormError] = useState<string | null>(null);

  // If the user is already logged in, redirect to the home page
  if (user) {
    return <Redirect to="/" />;
  }

  // Login form
  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Register form
  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Handle login form submission
  const onLoginSubmit = async (values: LoginValues) => {
    setFormError(null);
    try {
      await loginMutation.mutateAsync(values);
    } catch (error) {
      setFormError("Failed to login. Please check your credentials.");
    }
  };

  // Handle register form submission
  const onRegisterSubmit = async (values: RegisterValues) => {
    setFormError(null);
    try {
      const { confirmPassword, ...userData } = values;
      await registerMutation.mutateAsync(userData);
    } catch (error) {
      setFormError("Failed to register. Username might already be taken.");
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#003a65] via-[#002b4c] to-[#000c25]">
      {/* Hero section */}
      <div className="hidden md:flex w-1/2 flex-col justify-center items-center p-8 text-white">
        <div className="max-w-md">
          <div className="mb-8 flex items-center">
            <span className="material-icons text-[#4995fd] mr-3 text-4xl">flight</span>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#4995fd] to-[#a0d0ec] bg-clip-text text-transparent">
              AeroTracker
            </h1>
          </div>
          <h2 className="text-2xl font-bold mb-6">
            The Ultimate Aviation Experience
          </h2>
          <p className="text-lg mb-4 text-[#a0d0ec]">
            Unlock premium features for advanced flight tracking and route optimization:
          </p>
          <ul className="space-y-3 mb-6">
            <li className="flex items-center">
              <span className="material-icons text-[#4995fd] mr-2">check_circle</span>
              <span>Detailed real-time flight information</span>
            </li>
            <li className="flex items-center">
              <span className="material-icons text-[#4995fd] mr-2">check_circle</span>
              <span>Global weather overlay integration</span>
            </li>
            <li className="flex items-center">
              <span className="material-icons text-[#4995fd] mr-2">check_circle</span>
              <span>Advanced route optimization tools</span>
            </li>
            <li className="flex items-center">
              <span className="material-icons text-[#4995fd] mr-2">check_circle</span>
              <span>Save and track favorite flights</span>
            </li>
            <li className="flex items-center">
              <span className="material-icons text-[#4995fd] mr-2">check_circle</span>
              <span>Historical flight data and analytics</span>
            </li>
          </ul>
          <div className="w-full h-px bg-gradient-to-r from-transparent via-[#4995fd]/40 to-transparent my-8"></div>
          <p className="text-[#a0d0ec]/80 text-sm italic">
            "AeroTracker provides the most comprehensive and intuitive flight tracking experience available today."
          </p>
        </div>
      </div>

      {/* Login/Register form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-black/10 backdrop-blur-sm">
        <div className="w-full max-w-md">
          <Card className="bg-white/5 border-[#4995fd]/20 backdrop-blur-lg text-white">
            <CardHeader className="space-y-2 pb-2">
              <CardTitle className="text-2xl font-bold">
                {activeTab === "login" ? "Welcome Back" : "Create an Account"}
              </CardTitle>
              <CardDescription className="text-white/70">
                {activeTab === "login" 
                  ? "Sign in to access premium features" 
                  : "Join AeroTracker to unlock premium features"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs 
                defaultValue="login" 
                className="w-full" 
                value={activeTab}
                onValueChange={(value) => setActiveTab(value as "login" | "register")}
              >
                <TabsList className="grid w-full grid-cols-2 mb-4 bg-[#002b4c]/50">
                  <TabsTrigger 
                    value="login"
                    className="data-[state=active]:bg-[#4995fd]/20 data-[state=active]:text-white"
                  >
                    Login
                  </TabsTrigger>
                  <TabsTrigger 
                    value="register"
                    className="data-[state=active]:bg-[#4995fd]/20 data-[state=active]:text-white"
                  >
                    Register
                  </TabsTrigger>
                </TabsList>

                {/* Login Form */}
                <TabsContent value="login" className="space-y-4 pt-2">
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter your username" 
                                className="bg-white/10 border-[#4995fd]/30 text-white placeholder:text-white/50" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input 
                                type="password" 
                                placeholder="Enter your password" 
                                className="bg-white/10 border-[#4995fd]/30 text-white placeholder:text-white/50" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {formError && <p className="text-red-500 text-sm">{formError}</p>}
                      <Button 
                        type="submit" 
                        className="w-full bg-[#4995fd] hover:bg-[#4995fd]/80 text-white"
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Logging in...
                          </>
                        ) : (
                          "Sign In"
                        )}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>

                {/* Register Form */}
                <TabsContent value="register" className="space-y-4 pt-2">
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Create a username" 
                                className="bg-white/10 border-[#4995fd]/30 text-white placeholder:text-white/50" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input 
                                type="email" 
                                placeholder="Enter your email" 
                                className="bg-white/10 border-[#4995fd]/30 text-white placeholder:text-white/50" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input 
                                type="password" 
                                placeholder="Create a password" 
                                className="bg-white/10 border-[#4995fd]/30 text-white placeholder:text-white/50" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl>
                              <Input 
                                type="password" 
                                placeholder="Confirm your password" 
                                className="bg-white/10 border-[#4995fd]/30 text-white placeholder:text-white/50" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {formError && <p className="text-red-500 text-sm">{formError}</p>}
                      <Button 
                        type="submit" 
                        className="w-full bg-[#4995fd] hover:bg-[#4995fd]/80 text-white"
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating Account...
                          </>
                        ) : (
                          "Create Account"
                        )}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex justify-center">
              <p className="text-sm text-white/60">
                {activeTab === "login" ? (
                  <>
                    Don't have an account?{" "}
                    <Button 
                      variant="link" 
                      className="p-0 text-[#4995fd] underline hover:text-[#a0d0ec]"
                      onClick={() => setActiveTab("register")}
                    >
                      Register here
                    </Button>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <Button 
                      variant="link" 
                      className="p-0 text-[#4995fd] underline hover:text-[#a0d0ec]"
                      onClick={() => setActiveTab("login")}
                    >
                      Login here
                    </Button>
                  </>
                )}
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}