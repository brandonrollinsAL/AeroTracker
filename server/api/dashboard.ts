import { Router } from "express";
import { storage } from "../storage";
import { z } from "zod";
import crypto from "crypto";

// Validation schemas
const dashboardWidgetSchema = z.object({
  id: z.string().optional(),
  type: z.enum(['map', 'flightList', 'weatherInfo', 'airportInfo', 'flightDetails', 'stats']),
  title: z.string(),
  position: z.object({
    x: z.number(),
    y: z.number(),
    w: z.number(),
    h: z.number()
  }),
  settings: z.record(z.any()).optional()
});

const dashboardSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  isDefault: z.boolean().optional().default(false),
  layout: z.enum(['grid', 'freeform']),
  widgets: z.array(dashboardWidgetSchema)
});

export function setupDashboardRoutes(router: Router): void {
  // Get all dashboards for a user
  router.get("/api/dashboards", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    const user = await storage.getUser(req.user!.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    const dashboards = user.preferences?.dashboards || [];
    res.json(dashboards);
  });
  
  // Create a new dashboard
  router.post("/api/dashboards", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const parsedBody = dashboardSchema.parse(req.body);
      
      // Generate a unique ID if not provided
      const dashboard = {
        ...parsedBody,
        id: parsedBody.id || crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const user = await storage.getUser(req.user!.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // If this is the first dashboard or marked as default, make it the active one
      const existingDashboards = user.preferences?.dashboards || [];
      const shouldBeActive = dashboard.isDefault || existingDashboards.length === 0;
      
      // Make sure only one dashboard is default
      let dashboards = [...existingDashboards];
      if (dashboard.isDefault) {
        dashboards = dashboards.map(d => ({...d, isDefault: false}));
      }
      dashboards.push(dashboard);
      
      // Update user preferences
      const updatedUser = await storage.updateUserPreferences(req.user!.id, {
        ...user.preferences,
        dashboards,
        ...(shouldBeActive ? { activeDashboardId: dashboard.id } : {})
      });
      
      if (!updatedUser) {
        return res.status(500).json({ error: "Failed to update user preferences" });
      }
      
      res.status(201).json(dashboard);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Invalid request" });
    }
  });
  
  // Update a dashboard
  router.put("/api/dashboards/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    const dashboardId = req.params.id;
    
    try {
      const parsedBody = dashboardSchema.parse(req.body);
      
      const user = await storage.getUser(req.user!.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      const dashboards = user.preferences?.dashboards || [];
      const dashboardIndex = dashboards.findIndex(d => d.id === dashboardId);
      
      if (dashboardIndex === -1) {
        return res.status(404).json({ error: "Dashboard not found" });
      }
      
      // Update the dashboard
      const updatedDashboard = {
        ...parsedBody,
        id: dashboardId,
        createdAt: dashboards[dashboardIndex].createdAt,
        updatedAt: new Date().toISOString()
      };
      
      // Make sure only one dashboard is default
      let updatedDashboards = [...dashboards];
      if (updatedDashboard.isDefault) {
        updatedDashboards = updatedDashboards.map(d => 
          d.id === dashboardId ? updatedDashboard : {...d, isDefault: false}
        );
      } else {
        updatedDashboards[dashboardIndex] = updatedDashboard;
      }
      
      // Update user preferences
      const updatedUser = await storage.updateUserPreferences(req.user!.id, {
        ...user.preferences,
        dashboards: updatedDashboards
      });
      
      if (!updatedUser) {
        return res.status(500).json({ error: "Failed to update user preferences" });
      }
      
      res.json(updatedDashboard);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Invalid request" });
    }
  });
  
  // Delete a dashboard
  router.delete("/api/dashboards/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    const dashboardId = req.params.id;
    
    const user = await storage.getUser(req.user!.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    const dashboards = user.preferences?.dashboards || [];
    const dashboardIndex = dashboards.findIndex(d => d.id === dashboardId);
    
    if (dashboardIndex === -1) {
      return res.status(404).json({ error: "Dashboard not found" });
    }
    
    // Remove the dashboard
    const updatedDashboards = dashboards.filter(d => d.id !== dashboardId);
    
    // If we're deleting the active dashboard, set a new active dashboard if available
    let activeDashboardId = user.preferences?.activeDashboardId;
    if (activeDashboardId === dashboardId) {
      const newDefault = updatedDashboards.find(d => d.isDefault) || updatedDashboards[0];
      activeDashboardId = newDefault?.id || null;
    }
    
    // Update user preferences
    const updatedUser = await storage.updateUserPreferences(req.user!.id, {
      ...user.preferences,
      dashboards: updatedDashboards,
      activeDashboardId
    });
    
    if (!updatedUser) {
      return res.status(500).json({ error: "Failed to update user preferences" });
    }
    
    res.status(204).end();
  });
  
  // Set active dashboard
  router.post("/api/dashboards/:id/activate", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    const dashboardId = req.params.id;
    
    const user = await storage.getUser(req.user!.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    const dashboards = user.preferences?.dashboards || [];
    const dashboardExists = dashboards.some(d => d.id === dashboardId);
    
    if (!dashboardExists) {
      return res.status(404).json({ error: "Dashboard not found" });
    }
    
    // Update user preferences to set active dashboard
    const updatedUser = await storage.updateUserPreferences(req.user!.id, {
      ...user.preferences,
      activeDashboardId: dashboardId
    });
    
    if (!updatedUser) {
      return res.status(500).json({ error: "Failed to update user preferences" });
    }
    
    res.status(200).json({ success: true });
  });
  
  // Get dashboard widgets
  router.get("/api/dashboards/:id/widgets", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    const dashboardId = req.params.id;
    
    const user = await storage.getUser(req.user!.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    const dashboards = user.preferences?.dashboards || [];
    const dashboard = dashboards.find(d => d.id === dashboardId);
    
    if (!dashboard) {
      return res.status(404).json({ error: "Dashboard not found" });
    }
    
    res.json(dashboard.widgets);
  });
  
  // Add a widget to a dashboard
  router.post("/api/dashboards/:id/widgets", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    const dashboardId = req.params.id;
    
    try {
      const parsedWidget = dashboardWidgetSchema.parse(req.body);
      
      const user = await storage.getUser(req.user!.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      const dashboards = user.preferences?.dashboards || [];
      const dashboardIndex = dashboards.findIndex(d => d.id === dashboardId);
      
      if (dashboardIndex === -1) {
        return res.status(404).json({ error: "Dashboard not found" });
      }
      
      // Add the widget with a unique ID
      const widget = {
        ...parsedWidget,
        id: parsedWidget.id || crypto.randomUUID()
      };
      
      const updatedDashboard = {
        ...dashboards[dashboardIndex],
        widgets: [...dashboards[dashboardIndex].widgets, widget],
        updatedAt: new Date().toISOString()
      };
      
      const updatedDashboards = [...dashboards];
      updatedDashboards[dashboardIndex] = updatedDashboard;
      
      // Update user preferences
      const updatedUser = await storage.updateUserPreferences(req.user!.id, {
        ...user.preferences,
        dashboards: updatedDashboards
      });
      
      if (!updatedUser) {
        return res.status(500).json({ error: "Failed to update user preferences" });
      }
      
      res.status(201).json(widget);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Invalid request" });
    }
  });
  
  // Update a dashboard widget
  router.put("/api/dashboards/:dashboardId/widgets/:widgetId", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    const { dashboardId, widgetId } = req.params;
    
    try {
      const parsedWidget = dashboardWidgetSchema.parse(req.body);
      
      const user = await storage.getUser(req.user!.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      const dashboards = user.preferences?.dashboards || [];
      const dashboardIndex = dashboards.findIndex(d => d.id === dashboardId);
      
      if (dashboardIndex === -1) {
        return res.status(404).json({ error: "Dashboard not found" });
      }
      
      const widgetIndex = dashboards[dashboardIndex].widgets.findIndex(w => w.id === widgetId);
      
      if (widgetIndex === -1) {
        return res.status(404).json({ error: "Widget not found" });
      }
      
      // Update the widget
      const updatedWidget = {
        ...parsedWidget,
        id: widgetId
      };
      
      const updatedWidgets = [...dashboards[dashboardIndex].widgets];
      updatedWidgets[widgetIndex] = updatedWidget;
      
      const updatedDashboard = {
        ...dashboards[dashboardIndex],
        widgets: updatedWidgets,
        updatedAt: new Date().toISOString()
      };
      
      const updatedDashboards = [...dashboards];
      updatedDashboards[dashboardIndex] = updatedDashboard;
      
      // Update user preferences
      const updatedUser = await storage.updateUserPreferences(req.user!.id, {
        ...user.preferences,
        dashboards: updatedDashboards
      });
      
      if (!updatedUser) {
        return res.status(500).json({ error: "Failed to update user preferences" });
      }
      
      res.json(updatedWidget);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Invalid request" });
    }
  });
  
  // Delete a dashboard widget
  router.delete("/api/dashboards/:dashboardId/widgets/:widgetId", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    const { dashboardId, widgetId } = req.params;
    
    const user = await storage.getUser(req.user!.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    const dashboards = user.preferences?.dashboards || [];
    const dashboardIndex = dashboards.findIndex(d => d.id === dashboardId);
    
    if (dashboardIndex === -1) {
      return res.status(404).json({ error: "Dashboard not found" });
    }
    
    const widgetExists = dashboards[dashboardIndex].widgets.some(w => w.id === widgetId);
    
    if (!widgetExists) {
      return res.status(404).json({ error: "Widget not found" });
    }
    
    // Remove the widget
    const updatedDashboard = {
      ...dashboards[dashboardIndex],
      widgets: dashboards[dashboardIndex].widgets.filter(w => w.id !== widgetId),
      updatedAt: new Date().toISOString()
    };
    
    const updatedDashboards = [...dashboards];
    updatedDashboards[dashboardIndex] = updatedDashboard;
    
    // Update user preferences
    const updatedUser = await storage.updateUserPreferences(req.user!.id, {
      ...user.preferences,
      dashboards: updatedDashboards
    });
    
    if (!updatedUser) {
      return res.status(500).json({ error: "Failed to update user preferences" });
    }
    
    res.status(204).end();
  });
}