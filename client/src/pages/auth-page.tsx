import React, { useState } from 'react';
import { Redirect } from 'wouter';
import { Helmet } from 'react-helmet';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useAuth } from '../hooks/use-auth';
import { z } from 'zod';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../components/ui/form';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useTheme } from '../hooks/use-theme';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const { isDark: isDarkMode } = useTheme();

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const handleLoginError = (error: any) => {
    loginForm.setError("root", {
      type: "manual",
      message: error.message || "Login failed"
    });
  };

  const handleRegisterError = (error: any) => {
    registerForm.setError("root", {
      type: "manual",
      message: error.message || "Registration failed"
    });
  };

  const onLoginSubmit = (values: LoginFormValues) => {
    loginMutation.mutate({
      email: values.email,
      password: values.password,
    }, {
      onError: handleLoginError,
    });
  };

  const onRegisterSubmit = (values: RegisterFormValues) => {
    registerMutation.mutate({
      username: values.username,
      email: values.email,
      password: values.password,
    }, {
      onError: handleRegisterError,
    });
  };

  // Redirect if user is already logged in
  if (user) {
    return <Redirect to="/" />;
  };

  return (
    <div 
      className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-br from-[#001425] via-[#01253f] to-[#002b4c]' : 'bg-gradient-to-br from-white via-[#e6f2ff] to-[#cce6ff]'}`}
    >
      <Helmet>
        <title>AeroTracker - Authentication</title>
      </Helmet>

      <div className="container mx-auto flex h-screen items-center justify-center px-4">
        <div className="grid w-full max-w-6xl grid-cols-1 gap-8 md:grid-cols-2">
          {/* Auth Form */}
          <div className="flex flex-col justify-center">
            <div className="mb-6 text-center md:text-left">
              <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-[#003a65]'}`}>AeroTracker</h1>
              <p className={`mt-2 ${isDarkMode ? 'text-[#a0d0ec]/80' : 'text-[#003a65]/70'}`}>
                Sign in to access premium features
              </p>
            </div>

            <Card 
              className={`border-[#4995fd]/20 ${
                isDarkMode 
                ? 'bg-[#003a65]/70 backdrop-blur-lg text-white' 
                : 'bg-white/90 backdrop-blur-lg text-[#003a65]'
              }`}
              style={{
                boxShadow: isDarkMode
                  ? '0 10px 25px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(73, 149, 253, 0.1)'
                  : '0 10px 25px rgba(73, 149, 253, 0.15), 0 0 0 1px rgba(73, 149, 253, 0.05)'
              }}
            >
              <CardHeader>
                <Tabs 
                  defaultValue="login" 
                  value={activeTab} 
                  onValueChange={(value) => setActiveTab(value as 'login' | 'register')}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="login">Login</TabsTrigger>
                    <TabsTrigger value="register">Register</TabsTrigger>
                  </TabsList>

                  <TabsContent value="login">
                    <Form {...loginForm}>
                      <form onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
                        <div className="space-y-4">
                          <FormField
                            control={loginForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input type="email" placeholder="user@example.com" {...field} />
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
                                  <Input type="password" placeholder="••••••••" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {loginForm.formState.errors.root && (
                            <div className="text-red-500 text-sm mt-2">
                              {loginForm.formState.errors.root.message}
                            </div>
                          )}

                          <Button 
                            type="submit" 
                            className="w-full"
                            disabled={loginMutation.isPending}
                          >
                            {loginMutation.isPending ? 'Signing In...' : 'Sign In'}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </TabsContent>

                  <TabsContent value="register">
                    <Form {...registerForm}>
                      <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)}>
                        <div className="space-y-3">
                          <FormField
                            control={registerForm.control}
                            name="username"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Username</FormLabel>
                                <FormControl>
                                  <Input placeholder="Username" {...field} />
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
                                  <Input type="email" placeholder="user@example.com" {...field} />
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
                                  <Input type="password" placeholder="••••••••" {...field} />
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
                                  <Input type="password" placeholder="••••••••" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {registerForm.formState.errors.root && (
                            <div className="text-red-500 text-sm mt-2">
                              {registerForm.formState.errors.root.message}
                            </div>
                          )}

                          <Button 
                            type="submit" 
                            className="w-full"
                            disabled={registerMutation.isPending}
                          >
                            {registerMutation.isPending ? 'Creating Account...' : 'Create Account'}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </TabsContent>
                </Tabs>
              </CardHeader>
            </Card>
          </div>

          {/* Hero Section */}
          <div className={`hidden flex-col justify-center px-4 md:flex ${isDarkMode ? 'text-white' : 'text-[#003a65]'}`}>
            <div 
              className="rounded-xl p-8 relative overflow-hidden"
              style={{
                background: isDarkMode 
                  ? 'linear-gradient(135deg, rgba(0, 58, 101, 0.9), rgba(0, 20, 37, 0.8))'
                  : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(204, 230, 255, 0.8))',
                backdropFilter: 'blur(10px)',
                border: isDarkMode 
                  ? '1px solid rgba(73, 149, 253, 0.2)' 
                  : '1px solid rgba(73, 149, 253, 0.1)',
                boxShadow: isDarkMode
                  ? '0 15px 35px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(73, 149, 253, 0.1)'
                  : '0 15px 35px rgba(73, 149, 253, 0.15), 0 0 0 1px rgba(73, 149, 253, 0.05)'
              }}
            >
              <div className="absolute top-0 left-0 w-full h-full opacity-10">
                <div className="absolute top-10 right-10 w-16 h-16 rounded-full bg-[#4995fd]/40"></div>
                <div className="absolute bottom-20 left-10 w-32 h-32 rounded-full bg-[#4995fd]/20"></div>
                <div className="absolute top-40 left-40 w-24 h-24 rounded-full bg-[#a0d0ec]/20"></div>
              </div>
              
              <h2 className="text-3xl font-bold mb-6 relative">Welcome to AeroTracker</h2>
              
              <div className="space-y-6 relative">
                <div>
                  <h3 className="text-xl font-semibold mb-2 flex items-center">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${isDarkMode ? 'bg-[#4995fd]/20' : 'bg-[#4995fd]/10'}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 11l9-6-9-6-9 6 9 6z"></path>
                        <path d="M12 13l8.5 2.5-2.5 1.5 2.5 3-8.5-3-8.5 3 2.5-3-2.5-1.5L12 13z"></path>
                      </svg>
                    </span>
                    Real-time Flight Tracking
                  </h3>
                  <p className={`ml-11 ${isDarkMode ? 'text-[#a0d0ec]/80' : 'text-[#003a65]/70'}`}>
                    Monitor flights in real-time with comprehensive data visualization and detailed aircraft information.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2 flex items-center">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${isDarkMode ? 'bg-[#4995fd]/20' : 'bg-[#4995fd]/10'}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                      </svg>
                    </span>
                    Weather Integration
                  </h3>
                  <p className={`ml-11 ${isDarkMode ? 'text-[#a0d0ec]/80' : 'text-[#003a65]/70'}`}>
                    Access real-time weather data overlays and impact analysis for enhanced flight planning and situational awareness.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2 flex items-center">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${isDarkMode ? 'bg-[#4995fd]/20' : 'bg-[#4995fd]/10'}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="4" y1="21" x2="4" y2="14"></line>
                        <line x1="4" y1="10" x2="4" y2="3"></line>
                        <line x1="12" y1="21" x2="12" y2="12"></line>
                        <line x1="12" y1="8" x2="12" y2="3"></line>
                        <line x1="20" y1="21" x2="20" y2="16"></line>
                        <line x1="20" y1="12" x2="20" y2="3"></line>
                        <line x1="1" y1="14" x2="7" y2="14"></line>
                        <line x1="9" y1="8" x2="15" y2="8"></line>
                        <line x1="17" y1="16" x2="23" y2="16"></line>
                      </svg>
                    </span>
                    Route Optimization
                  </h3>
                  <p className={`ml-11 ${isDarkMode ? 'text-[#a0d0ec]/80' : 'text-[#003a65]/70'}`}>
                    Optimize flight routes based on weather conditions, fuel efficiency, and time considerations for optimal performance.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}