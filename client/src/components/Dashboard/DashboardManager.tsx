import React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Dashboard, DashboardWidget } from '@shared/schema';
import { Loader2, Plus, Settings, Trash } from 'lucide-react';

// Form schema for creating/editing dashboards
const dashboardFormSchema = z.object({
  name: z.string().min(1, "Dashboard name is required"),
  layout: z.enum(['grid', 'freeform']),
  isDefault: z.boolean().default(false),
});

export default function DashboardManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedDashboard, setSelectedDashboard] = useState<Dashboard | null>(null);

  // Fetch user's dashboards
  const { data: dashboards, isLoading } = useQuery({
    queryKey: ['/api/dashboards'],
    queryFn: async () => {
      const response = await fetch('/api/dashboards');
      if (!response.ok) {
        throw new Error('Failed to fetch dashboards');
      }
      return await response.json() as Dashboard[];
    },
    enabled: !!user,
  });

  // Create dashboard mutation
  const createDashboardMutation = useMutation({
    mutationFn: async (data: z.infer<typeof dashboardFormSchema>) => {
      const dashboardData = {
        ...data,
        widgets: [] // Start with empty widgets array
      };

      const res = await apiRequest('POST', '/api/dashboards', dashboardData);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Dashboard created',
        description: 'Your new dashboard has been created successfully.',
      });
      setIsCreateDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/dashboards'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to create dashboard',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Delete dashboard mutation
  const deleteDashboardMutation = useMutation({
    mutationFn: async (dashboardId: string) => {
      await apiRequest('DELETE', `/api/dashboards/${dashboardId}`);
    },
    onSuccess: () => {
      toast({
        title: 'Dashboard deleted',
        description: 'The dashboard has been deleted successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboards'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to delete dashboard',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Set active dashboard mutation
  const setActiveDashboardMutation = useMutation({
    mutationFn: async (dashboardId: string) => {
      const res = await apiRequest('POST', `/api/dashboards/${dashboardId}/activate`);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Dashboard activated',
        description: 'This dashboard is now your active dashboard.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboards'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to activate dashboard',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Form hooks for creating/editing dashboards
  const form = useForm<z.infer<typeof dashboardFormSchema>>({
    resolver: zodResolver(dashboardFormSchema),
    defaultValues: {
      name: '',
      layout: 'grid',
      isDefault: false,
    },
  });

  const onSubmit = (data: z.infer<typeof dashboardFormSchema>) => {
    createDashboardMutation.mutate(data);
  };

  const handleActivate = (dashboardId: string) => {
    setActiveDashboardMutation.mutate(dashboardId);
  };

  const handleDelete = (dashboardId: string) => {
    if (confirm("Are you sure you want to delete this dashboard? This action cannot be undone.")) {
      deleteDashboardMutation.mutate(dashboardId);
    }
  };

  const handleEdit = (dashboard: Dashboard) => {
    setSelectedDashboard(dashboard);
    // You would implement the edit functionality here
    toast({
      title: 'Edit dashboard',
      description: 'Editing functionality will be implemented in the next phase.',
    });
  };

  const activeDashboardId = user?.preferences?.activeDashboardId;
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight text-primary">Your Dashboards</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Dashboard
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Dashboard</DialogTitle>
              <DialogDescription>
                Create a new dashboard to organize your flight tracking views.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dashboard Name</FormLabel>
                      <FormControl>
                        <Input placeholder="My Dashboard" {...field} />
                      </FormControl>
                      <FormDescription>
                        Give your dashboard a descriptive name.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="layout"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Layout Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a layout type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="grid">Grid</SelectItem>
                          <SelectItem value="freeform">Free-form</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Grid provides organized, equal-sized widgets while Free-form allows custom positioning.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isDefault"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Set as default dashboard</FormLabel>
                        <FormDescription>
                          This dashboard will be shown automatically when you log in.
                        </FormDescription>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" disabled={createDashboardMutation.isPending}>
                    {createDashboardMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Create Dashboard
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {dashboards && dashboards.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {dashboards.map((dashboard) => (
            <Card key={dashboard.id} className={dashboard.id === activeDashboardId ? "border-primary" : ""}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {dashboard.name}
                  {dashboard.isDefault && (
                    <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                      Default
                    </span>
                  )}
                </CardTitle>
                <CardDescription>
                  {dashboard.layout === 'grid' ? 'Grid Layout' : 'Free-form Layout'} • 
                  {dashboard.widgets.length} widget{dashboard.widgets.length !== 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Created: {new Date(dashboard.createdAt).toLocaleDateString()}
                  <br />
                  Last updated: {new Date(dashboard.updatedAt).toLocaleDateString()}
                </p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEdit(dashboard)}
                  >
                    <Settings className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleDelete(dashboard.id)}
                    disabled={dashboards.length === 1 || deleteDashboardMutation.isPending}
                  >
                    <Trash className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
                {dashboard.id !== activeDashboardId && (
                  <Button 
                    size="sm" 
                    onClick={() => handleActivate(dashboard.id)}
                    disabled={setActiveDashboardMutation.isPending}
                  >
                    {setActiveDashboardMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Activate
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 bg-muted/30 rounded-lg p-4">
          <p className="text-lg text-muted-foreground mb-4">
            You don't have any dashboards yet.
          </p>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Dashboard
          </Button>
        </div>
      )}
    </div>
  );
}