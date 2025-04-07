import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, PlaneTakeoffIcon, Plane, UserIcon, LockIcon, MailIcon, ExternalLinkIcon } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

const registerSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<string>("login");
  const [isEmailEntered, setIsEmailEntered] = useState<boolean>(false);
  const [, navigate] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();
  const { toast } = useToast();

  // Check if already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Register form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onLoginSubmit = async (data: LoginFormValues) => {
    try {
      loginMutation.mutate(data);
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  };

  const onRegisterSubmit = async (data: RegisterFormValues) => {
    try {
      const { confirmPassword, ...registerData } = data;
      registerMutation.mutate(registerData);
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  };

  // Start loading when email is entered
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value;
    if (email.includes('@') && email.includes('.') && !isEmailEntered) {
      setIsEmailEntered(true);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#f8fcff]">
      {/* Auth Forms */}
      <div className="flex items-center justify-center p-6 lg:p-8">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start mb-3">
              <div className="h-10 w-10 rounded-lg flex items-center justify-center relative overflow-hidden bg-[#4995fd] mr-3">
                <div className="absolute inset-0 bg-gradient-to-br from-[#4995fd] to-[#003a65] opacity-90"></div>
                <PlaneTakeoffIcon className="h-5 w-5 text-white transform rotate-45 relative z-10" />
              </div>
              <h1 className="text-2xl font-bold">
                <span className="bg-gradient-to-r from-[#003a65] to-[#4995fd] bg-clip-text text-transparent">
                  AeroTracker
                </span>
              </h1>
            </div>
            <p className="text-[#003a65]/70">
              Sign in to access real-time flight tracking and aviation data
            </p>
          </div>

          <Tabs 
            defaultValue="login" 
            value={activeTab} 
            onValueChange={setActiveTab} 
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger 
                value="login" 
                className="data-[state=active]:bg-[#4995fd] data-[state=active]:text-white"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger 
                value="register" 
                className="data-[state=active]:bg-[#4995fd] data-[state=active]:text-white"
              >
                Create Account
              </TabsTrigger>
            </TabsList>
          
            <TabsContent value="login">
              <Card className="border-[#4995fd]/10">
                <CardHeader>
                  <CardTitle>Sign In</CardTitle>
                  <CardDescription>
                    Enter your credentials to access your account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                  <MailIcon className="h-4 w-4 text-[#4995fd]" />
                                </span>
                                <Input 
                                  placeholder="your.email@example.com" 
                                  className="pl-10 border-[#4995fd]/20 focus:border-[#4995fd] focus:ring-[#4995fd]/10"
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(e);
                                    handleEmailChange(e);
                                  }}
                                />
                              </div>
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
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                  <LockIcon className="h-4 w-4 text-[#4995fd]" />
                                </span>
                                <Input 
                                  type="password" 
                                  placeholder="••••••••" 
                                  className="pl-10 border-[#4995fd]/20 focus:border-[#4995fd] focus:ring-[#4995fd]/10"
                                  {...field} 
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-[#003a65] to-[#4995fd] hover:from-[#003a65]/90 hover:to-[#4995fd]/90 text-white"
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Signing in...
                          </>
                        ) : (
                          "Sign In"
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex justify-center text-sm text-gray-500">
                  <p>
                    Don't have an account?{" "}
                    <Button variant="link" className="p-0 text-[#4995fd]" onClick={() => setActiveTab("register")}>
                      Create one
                    </Button>
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="register">
              <Card className="border-[#4995fd]/10">
                <CardHeader>
                  <CardTitle>Create Account</CardTitle>
                  <CardDescription>
                    Join AeroTracker to access advanced flight tracking features
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                  <UserIcon className="h-4 w-4 text-[#4995fd]" />
                                </span>
                                <Input 
                                  placeholder="aviationenthusiast" 
                                  className="pl-10 border-[#4995fd]/20 focus:border-[#4995fd] focus:ring-[#4995fd]/10"
                                  {...field} 
                                />
                              </div>
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
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                  <MailIcon className="h-4 w-4 text-[#4995fd]" />
                                </span>
                                <Input 
                                  placeholder="your.email@example.com" 
                                  className="pl-10 border-[#4995fd]/20 focus:border-[#4995fd] focus:ring-[#4995fd]/10"
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(e);
                                    handleEmailChange(e);
                                  }}
                                />
                              </div>
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
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                  <LockIcon className="h-4 w-4 text-[#4995fd]" />
                                </span>
                                <Input 
                                  type="password" 
                                  placeholder="••••••••" 
                                  className="pl-10 border-[#4995fd]/20 focus:border-[#4995fd] focus:ring-[#4995fd]/10"
                                  {...field} 
                                />
                              </div>
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
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                  <LockIcon className="h-4 w-4 text-[#4995fd]" />
                                </span>
                                <Input 
                                  type="password" 
                                  placeholder="••••••••" 
                                  className="pl-10 border-[#4995fd]/20 focus:border-[#4995fd] focus:ring-[#4995fd]/10"
                                  {...field} 
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-[#003a65] to-[#4995fd] hover:from-[#003a65]/90 hover:to-[#4995fd]/90 text-white"
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating account...
                          </>
                        ) : (
                          "Create Account"
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex justify-center text-sm text-gray-500">
                  <p>
                    Already have an account?{" "}
                    <Button variant="link" className="p-0 text-[#4995fd]" onClick={() => setActiveTab("login")}>
                      Sign in
                    </Button>
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Hero Image and Text */}
      <div className="hidden lg:flex flex-col items-center justify-center bg-gradient-to-br from-[#003a65] to-[#001e33] text-white p-8">
        <div className="max-w-md text-center">
          <div className="flex justify-center mb-8">
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-full relative">
              <Plane className="h-12 w-12 text-[#4995fd]" />
              {isEmailEntered && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-full w-full rounded-full border-4 border-t-[#4995fd] border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
                </div>
              )}
            </div>
          </div>
          
          <h1 className="text-3xl font-bold mb-4">
            {isEmailEntered ? "Loading Your Flights..." : "Track Any Flight in Real Time"}
          </h1>
          
          <p className="mb-6 text-[#a0d0ec]/90">
            {isEmailEntered
              ? "We're getting your personalized aviation data ready. Your flight tracking experience is about to take off!"
              : "AeroTracker provides comprehensive aircraft monitoring, advanced data visualization, and intelligent predictive insights for aviation professionals and enthusiasts."}
          </p>
          
          {!isEmailEntered && (
            <div className="space-y-5">
              <div className="flex items-center bg-white/5 p-3 rounded-lg">
                <div className="bg-[#4995fd]/20 rounded-full p-2 mr-3">
                  <Plane className="h-5 w-5 text-[#4995fd]" />
                </div>
                <div className="text-left">
                  <h3 className="font-medium">Real-time Flight Tracking</h3>
                  <p className="text-sm text-[#a0d0ec]/70">Monitor any aircraft with live updates and detailed flight data</p>
                </div>
              </div>
              
              <div className="flex items-center bg-white/5 p-3 rounded-lg">
                <div className="bg-[#4995fd]/20 rounded-full p-2 mr-3">
                  <ExternalLinkIcon className="h-5 w-5 text-[#4995fd]" />
                </div>
                <div className="text-left">
                  <h3 className="font-medium">Advanced Weather Integration</h3>
                  <p className="text-sm text-[#a0d0ec]/70">Get weather conditions along flight routes and at airports</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}