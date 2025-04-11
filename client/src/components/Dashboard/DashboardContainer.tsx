import React from 'react';
import { Widget } from './WidgetComponents';
import { Dashboard as DashboardType, DashboardWidget } from '@shared/schema';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Settings } from 'lucide-react';

interface DashboardContainerProps {
  dashboard: DashboardType;
  onAddWidget?: () => void;
  onEditWidget?: (widget: DashboardWidget) => void;
  onDeleteWidget?: (widgetId: string) => void;
  onEditDashboard?: () => void;
  isEditable?: boolean;
}

export default function DashboardContainer({
  dashboard,
  onAddWidget,
  onEditWidget,
  onDeleteWidget,
  onEditDashboard,
  isEditable = false
}: DashboardContainerProps) {
  if (!dashboard) {
    return (
      <div className="bg-muted/30 rounded-lg p-8 text-center">
        <p className="text-muted-foreground">
          No dashboard selected. Please select a dashboard from the manage tab.
        </p>
      </div>
    );
  }

  if (dashboard.widgets.length === 0) {
    return (
      <div className="bg-muted/30 rounded-lg p-8 text-center">
        <p className="text-muted-foreground mb-4">
          This dashboard doesn't have any widgets yet.
          {isEditable 
            ? 'Add your first widget to customize your view.' 
            : 'Edit the dashboard to add widgets and customize your view.'}
        </p>
        {isEditable && (
          <Button 
            onClick={onAddWidget}
            className="flex items-center gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            Add First Widget
          </Button>
        )}
      </div>
    );
  }

  // Handle grid layout
  if (dashboard.layout === 'grid') {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-primary">
            {dashboard.name}
            {dashboard.isDefault && (
              <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-1 rounded-full font-normal">
                Default
              </span>
            )}
          </h2>
          {onEditDashboard && (
            <Button 
              onClick={onEditDashboard}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Edit Dashboard
            </Button>
          )}
        </div>
        
        <div className="grid grid-cols-4 gap-4 auto-rows-min">
          {dashboard.widgets.map((widget) => (
            <div 
              key={widget.id}
              className="col-span-4 md:col-span-2 lg:col-span-1"
              style={{
                gridColumn: `span ${Math.min(widget.position.w, 4)}`,
                gridRow: `span ${Math.min(widget.position.h, 4)}`,
              }}
            >
              <Widget
                widget={widget}
                className="h-full"
                onEditWidget={isEditable ? onEditWidget : undefined}
                onDeleteWidget={isEditable ? onDeleteWidget : undefined}
              />
            </div>
          ))}
          
          {isEditable && (
            <div className="col-span-1">
              <Card 
                className="h-full flex flex-col items-center justify-center p-6 border-dashed cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={onAddWidget}
              >
                <PlusCircle className="h-6 w-6 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Add Widget</p>
              </Card>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Handle freeform layout (future enhancement)
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-primary">
          {dashboard.name}
          {dashboard.isDefault && (
            <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-1 rounded-full font-normal">
              Default
            </span>
          )}
        </h2>
        {onEditDashboard && (
          <Button 
            onClick={onEditDashboard}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            Edit Dashboard
          </Button>
        )}
      </div>
      
      <div className="bg-muted/30 p-6 rounded-lg">
        <p className="text-muted-foreground mb-4">
          Free-form layout support is coming soon. Currently, all widgets are displayed in a grid.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dashboard.widgets.map((widget) => (
            <Widget
              key={widget.id}
              widget={widget}
              onEditWidget={isEditable ? onEditWidget : undefined}
              onDeleteWidget={isEditable ? onDeleteWidget : undefined}
            />
          ))}
          
          {isEditable && (
            <Card 
              className="flex flex-col items-center justify-center p-6 border-dashed cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={onAddWidget}
            >
              <PlusCircle className="h-6 w-6 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Add Widget</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}