import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
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
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Dashboard, DashboardWidget, MapFilter } from '@shared/schema';
import { ArrowLeft, Loader2, Plus, Save, Trash } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

// Widget form schema for creating/editing widgets
const widgetFormSchema = z.object({
  type: z.enum(['map', 'flightList', 'weatherInfo', 'airportInfo', 'flightDetails', 'stats']),
  title: z.string().min(1, "Widget title is required"),
  position: z.object({
    x: z.number(),
    y: z.number(),
    w: z.number().min(1, "Width must be at least 1"),
    h: z.number().min(1, "Height must be at least 1"),
  }),
  settings: z.object({
    filters: z.optional(z.any()),
    airportCode: z.optional(z.string()),
    flightId: z.optional(z.union([z.string(), z.number()])),
    refreshInterval: z.optional(z.number()),
    showCharts: z.optional(z.boolean()),
    dataPoints: z.optional(z.number()),
  }).optional(),
});

interface DashboardEditorProps {
  dashboard: Dashboard;
  onBack: () => void;
  onSave: (dashboard: Dashboard) => void;
}

export default function DashboardEditor({ dashboard, onBack, onSave }: DashboardEditorProps) {
  const { toast } = useToast();
  const [widgets, setWidgets] = useState<DashboardWidget[]>(dashboard.widgets);
  const [isAddWidgetOpen, setIsAddWidgetOpen] = useState(false);
  const [editingWidget, setEditingWidget] = useState<DashboardWidget | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Update dashboard widgets mutation
  const updateDashboardMutation = useMutation({
    mutationFn: async (updatedDashboard: Dashboard) => {
      const res = await apiRequest('PUT', `/api/dashboards/${dashboard.id}`, updatedDashboard);
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Dashboard updated',
        description: 'Your dashboard has been updated successfully.',
      });
      onSave(data);
      setIsSaving(false);
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to update dashboard',
        description: error.message,
        variant: 'destructive',
      });
      setIsSaving(false);
    },
  });

  // Form for adding/editing widgets
  const form = useForm<z.infer<typeof widgetFormSchema>>({
    resolver: zodResolver(widgetFormSchema),
    defaultValues: editingWidget || {
      type: 'map',
      title: '',
      position: { x: 0, y: 0, w: 1, h: 1 },
      settings: {
        refreshInterval: 30,
        showCharts: true,
        dataPoints: 100,
      },
    },
  });

  // Reset form when editing widget changes
  React.useEffect(() => {
    if (editingWidget) {
      form.reset(editingWidget);
    } else {
      form.reset({
        type: 'map',
        title: '',
        position: { x: 0, y: 0, w: 1, h: 1 },
        settings: {
          refreshInterval: 30,
          showCharts: true,
          dataPoints: 100,
        },
      });
    }
  }, [editingWidget, form]);

  const onSubmitWidget = (data: z.infer<typeof widgetFormSchema>) => {
    if (editingWidget) {
      // Update existing widget
      const updatedWidgets = widgets.map(widget => 
        widget.id === editingWidget.id ? { ...data, id: widget.id } : widget
      );
      setWidgets(updatedWidgets);
      toast({
        title: 'Widget updated',
        description: 'The widget has been updated.',
      });
    } else {
      // Add new widget
      const newWidget: DashboardWidget = {
        ...data,
        id: uuidv4(),
      };
      setWidgets([...widgets, newWidget]);
      toast({
        title: 'Widget added',
        description: 'A new widget has been added to your dashboard.',
      });
    }
    
    setIsAddWidgetOpen(false);
    setEditingWidget(null);
  };

  const handleDeleteWidget = (widgetId: string) => {
    if (confirm('Are you sure you want to remove this widget from your dashboard?')) {
      const updatedWidgets = widgets.filter(widget => widget.id !== widgetId);
      setWidgets(updatedWidgets);
      toast({
        title: 'Widget removed',
        description: 'The widget has been removed from your dashboard.',
      });
    }
  };

  const handleEditWidget = (widget: DashboardWidget) => {
    setEditingWidget(widget);
    setIsAddWidgetOpen(true);
  };

  const handleSaveDashboard = () => {
    setIsSaving(true);
    
    const updatedDashboard: Dashboard = {
      ...dashboard,
      widgets,
      updatedAt: new Date().toISOString(),
    };
    
    updateDashboardMutation.mutate(updatedDashboard);
  };

  const getWidgetTypeLabel = (type: DashboardWidget['type']) => {
    switch (type) {
      case 'map': return 'Flight Map';
      case 'flightList': return 'Flight List';
      case 'weatherInfo': return 'Weather Information';
      case 'airportInfo': return 'Airport Information';
      case 'flightDetails': return 'Flight Details';
      case 'stats': return 'Statistics';
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Dashboards
          </Button>
          <h2 className="text-2xl font-bold tracking-tight text-primary ml-4">Editing: {dashboard.name}</h2>
        </div>
        <Button 
          onClick={handleSaveDashboard} 
          disabled={isSaving}
          className="flex items-center gap-2"
        >
          {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
          <Save className="h-4 w-4 mr-1" />
          Save Dashboard
        </Button>
      </div>

      <Tabs defaultValue="widgets" className="w-full">
        <TabsList className="grid w-full md:w-[400px] grid-cols-2">
          <TabsTrigger value="widgets">Widgets</TabsTrigger>
          <TabsTrigger value="layout">Layout</TabsTrigger>
        </TabsList>
        
        <TabsContent value="widgets" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Dashboard Widgets</h3>
            <Dialog open={isAddWidgetOpen} onOpenChange={setIsAddWidgetOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Widget
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>{editingWidget ? 'Edit Widget' : 'Add New Widget'}</DialogTitle>
                  <DialogDescription>
                    {editingWidget 
                      ? 'Modify the widget settings below.' 
                      : 'Configure the new widget to add to your dashboard.'}
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmitWidget)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Widget Title</FormLabel>
                          <FormControl>
                            <Input placeholder="My Widget" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Widget Type</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select widget type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="map">Flight Map</SelectItem>
                              <SelectItem value="flightList">Flight List</SelectItem>
                              <SelectItem value="weatherInfo">Weather Information</SelectItem>
                              <SelectItem value="airportInfo">Airport Information</SelectItem>
                              <SelectItem value="flightDetails">Flight Details</SelectItem>
                              <SelectItem value="stats">Statistics</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Select the type of data to display in this widget.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="position.w"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Width (columns)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min={1} 
                                max={3} 
                                {...field}
                                onChange={e => field.onChange(parseInt(e.target.value) || 1)}
                              />
                            </FormControl>
                            <FormDescription>
                              1-3 columns
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="position.h"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Height (rows)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min={1} 
                                max={2} 
                                {...field}
                                onChange={e => field.onChange(parseInt(e.target.value) || 1)}
                              />
                            </FormControl>
                            <FormDescription>
                              1-2 rows
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    {/* Additional settings based on widget type */}
                    {form.watch('type') === 'map' && (
                      <FormField
                        control={form.control}
                        name="settings.refreshInterval"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Refresh Interval (seconds)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min={5} 
                                {...field}
                                onChange={e => field.onChange(parseInt(e.target.value) || 30)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    
                    {form.watch('type') === 'airportInfo' && (
                      <FormField
                        control={form.control}
                        name="settings.airportCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Airport Code</FormLabel>
                            <FormControl>
                              <Input placeholder="KJFK" {...field} />
                            </FormControl>
                            <FormDescription>
                              Enter ICAO airport code (e.g., KJFK, EGLL)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    
                    <DialogFooter>
                      <Button type="submit">
                        {editingWidget ? 'Update Widget' : 'Add Widget'}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
          
          {widgets.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {widgets.map((widget) => (
                <Card key={widget.id} className="border-muted-foreground/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{widget.title}</CardTitle>
                    <CardDescription>
                      {getWidgetTypeLabel(widget.type)} • 
                      {widget.position.w} x {widget.position.h}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="flex justify-end pt-2">
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditWidget(widget)}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDeleteWidget(widget.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="bg-muted/30 rounded-lg p-8 text-center">
              <p className="text-muted-foreground mb-4">
                This dashboard has no widgets yet. 
                Add your first widget to start customizing your view.
              </p>
              <Button 
                onClick={() => setIsAddWidgetOpen(true)}
                className="flex items-center gap-2 mx-auto"
              >
                <Plus className="h-4 w-4" />
                Add First Widget
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="layout" className="space-y-4">
          <div className="bg-muted/30 p-6 rounded-lg">
            <h3 className="text-lg font-medium mb-4">Layout Settings</h3>
            <p className="text-muted-foreground mb-6">
              This dashboard uses a {dashboard.layout === 'grid' ? 'grid' : 'free-form'} layout.
              Layout management tools will be available in future updates.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}