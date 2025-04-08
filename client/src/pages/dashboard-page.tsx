import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';
import { Dashboard } from '@shared/schema';
import DashboardManager from '@/components/Dashboard/DashboardManager';
import DashboardEditor from '@/components/Dashboard/DashboardEditor';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function DashboardPage() {
  const { user } = useAuth();
  const [selectedDashboard, setSelectedDashboard] = useState<Dashboard | null>(null);
  const [activeTab, setActiveTab] = useState('manage');

  // Fetch user's dashboards
  const { data: dashboards, isLoading, refetch } = useQuery({
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

  // Find active dashboard
  React.useEffect(() => {
    if (dashboards && dashboards.length > 0) {
      const activeDashboardId = user?.preferences?.activeDashboardId;
      const activeDashboard = activeDashboardId
        ? dashboards.find(d => d.id === activeDashboardId)
        : dashboards.find(d => d.isDefault) || dashboards[0];
        
      if (activeDashboard && !selectedDashboard) {
        setSelectedDashboard(activeDashboard);
      }
    }
  }, [dashboards, user, selectedDashboard]);

  const handleEditDashboard = (dashboard: Dashboard) => {
    setSelectedDashboard(dashboard);
    setActiveTab('edit');
  };

  const handleBackToManager = () => {
    setActiveTab('manage');
    setSelectedDashboard(null);
  };

  const handleDashboardSave = (updatedDashboard: Dashboard) => {
    refetch();
    setActiveTab('manage');
    setSelectedDashboard(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (activeTab === 'edit' && selectedDashboard) {
    return (
      <div className="container mx-auto py-6 px-4">
        <DashboardEditor 
          dashboard={selectedDashboard} 
          onBack={handleBackToManager} 
          onSave={handleDashboardSave}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <Tabs defaultValue="manage" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-primary">Dashboard Management</h1>
          <TabsList>
            <TabsTrigger value="manage">Manage Dashboards</TabsTrigger>
            <TabsTrigger value="view" disabled={!selectedDashboard}>View Dashboard</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="manage" className="space-y-6">
          <DashboardManager />
        </TabsContent>
        
        <TabsContent value="view">
          {selectedDashboard ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-primary">{selectedDashboard.name}</h2>
                <button 
                  onClick={() => handleEditDashboard(selectedDashboard)}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                >
                  Edit Layout
                </button>
              </div>
              
              {selectedDashboard.widgets.length === 0 ? (
                <div className="bg-muted/30 rounded-lg p-8 text-center">
                  <p className="text-muted-foreground">
                    This dashboard doesn't have any widgets yet. 
                    Edit the dashboard to add widgets and customize your view.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  {/* This is where the actual dashboard content would be rendered */}
                  {/* For now, we just show placeholders for the widgets */}
                  {selectedDashboard.widgets.map((widget) => (
                    <div 
                      key={widget.id}
                      className="bg-card border rounded-lg p-4"
                      style={{
                        gridColumn: `span ${widget.position.w}`,
                        gridRow: `span ${widget.position.h}`,
                      }}
                    >
                      <h3 className="font-semibold text-lg mb-2">{widget.title}</h3>
                      <p className="text-muted-foreground">
                        {widget.type} widget
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-muted/30 rounded-lg p-8 text-center">
              <p className="text-muted-foreground">
                No dashboard selected. Please select a dashboard from the manage tab.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}