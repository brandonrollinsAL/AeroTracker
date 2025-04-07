import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { LiveFlight, MapFilter } from '@/types';
import { ChevronRight, BarChart2, TrendingUp, PieChart as PieChartIcon, Timer } from 'lucide-react';

// Generate fake flight data for analytics
const generateMockFlightData = () => {
  // Mock daily flight data - past week
  const dailyFlightData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      commercial: Math.floor(Math.random() * 2000) + 5000,
      private: Math.floor(Math.random() * 500) + 800,
      cargo: Math.floor(Math.random() * 300) + 600,
    };
  });

  // Mock flight distribution by aircraft type
  const aircraftTypeData = [
    { name: 'Boeing 737', value: Math.floor(Math.random() * 1000) + 2000 },
    { name: 'Airbus A320', value: Math.floor(Math.random() * 1000) + 1800 },
    { name: 'Boeing 777', value: Math.floor(Math.random() * 500) + 800 },
    { name: 'Airbus A350', value: Math.floor(Math.random() * 300) + 600 },
    { name: 'Boeing 787', value: Math.floor(Math.random() * 300) + 700 },
    { name: 'Other', value: Math.floor(Math.random() * 1000) + 2500 },
  ];

  // Mock airline activity data
  const airlineData = [
    { name: 'Delta', flights: Math.floor(Math.random() * 400) + 800 },
    { name: 'United', flights: Math.floor(Math.random() * 300) + 700 },
    { name: 'American', flights: Math.floor(Math.random() * 350) + 750 },
    { name: 'Southwest', flights: Math.floor(Math.random() * 450) + 850 },
    { name: 'JetBlue', flights: Math.floor(Math.random() * 200) + 400 },
    { name: 'Alaska', flights: Math.floor(Math.random() * 150) + 350 },
  ];

  // Mock flight altitude distribution
  const altitudeData = [
    { range: '0-10,000 ft', count: Math.floor(Math.random() * 500) + 1000 },
    { range: '10,001-20,000 ft', count: Math.floor(Math.random() * 800) + 1500 },
    { range: '20,001-30,000 ft', count: Math.floor(Math.random() * 1000) + 2500 },
    { range: '30,001-40,000 ft', count: Math.floor(Math.random() * 1200) + 3000 },
    { range: '40,001+ ft', count: Math.floor(Math.random() * 200) + 300 },
  ];

  // Mock hourly distribution
  const hourlyData = Array.from({ length: 24 }, (_, i) => {
    let multiplier = 1;
    
    // Create a realistic daily pattern with more flights during daytime
    if (i >= 6 && i <= 10) multiplier = 3; // Morning rush
    else if (i >= 11 && i <= 15) multiplier = 2.5; // Midday
    else if (i >= 16 && i <= 21) multiplier = 2.8; // Evening rush
    else if (i >= 22 || i <= 5) multiplier = 0.5; // Night time
    
    return {
      hour: i.toString().padStart(2, '0') + ':00',
      flights: Math.floor(Math.random() * 300 * multiplier) + 100,
    };
  });

  return {
    dailyFlightData,
    aircraftTypeData,
    airlineData,
    altitudeData,
    hourlyData,
    overallStats: {
      totalActiveFlights: Math.floor(Math.random() * 2000) + 8000,
      averageAltitude: Math.floor(Math.random() * 5000) + 30000,
      averageSpeed: Math.floor(Math.random() * 100) + 450,
      delayedFlights: Math.floor(Math.random() * 300) + 600,
      totalTrackingUsers: Math.floor(Math.random() * 5000) + 15000,
    }
  };
};

// Colors for charts
const COLORS = ['#4995fd', '#003a65', '#a0d0ec', '#55ffdd', '#2460a7', '#67c8ff'];

interface FlightAnalyticsProps {
  flights: LiveFlight[];
  filters: MapFilter;
}

export default function FlightAnalytics({ flights, filters }: FlightAnalyticsProps) {
  const [analyticsData, setAnalyticsData] = useState(generateMockFlightData());
  const [refreshCounter, setRefreshCounter] = useState(0);
  
  // Regenerate data every 60 seconds to simulate real-time updates
  useEffect(() => {
    const timer = setInterval(() => {
      setAnalyticsData(generateMockFlightData());
      setRefreshCounter(prev => prev + 1);
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);

  // Calculate the current filter type for display purposes
  const currentFilterType = filters.type.charAt(0).toUpperCase() + filters.type.slice(1);
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="rounded-md h-8 px-3 border-blue-200 text-blue-600 bg-blue-50 hover:bg-blue-100"
        >
          <BarChart2 className="h-3 w-3 mr-1.5" />
          Flight Stats
          <ChevronRight className="h-3 w-3 ml-1" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2 border-b">
          <DialogTitle className="text-xl font-bold text-blue-600">Flight Analytics Dashboard</DialogTitle>
          <CardDescription className="text-gray-500">
            Real-time statistics and trends from {analyticsData.overallStats.totalActiveFlights.toLocaleString()} tracked flights
            <span className="text-xs ml-2 text-gray-400">Last updated: {new Date().toLocaleString()}</span>
          </CardDescription>
        </DialogHeader>
        
        <div className="p-4">
          <div className="grid grid-cols-4 gap-4 mb-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-gray-500 mb-1">Active Flights</div>
                <div className="text-2xl font-bold text-blue-600">{analyticsData.overallStats.totalActiveFlights.toLocaleString()}</div>
                <div className="text-xs text-green-600 mt-1">+3.2% from yesterday</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-gray-500 mb-1">Avg. Altitude</div>
                <div className="text-2xl font-bold text-blue-600">{analyticsData.overallStats.averageAltitude.toLocaleString()} ft</div>
                <div className="text-xs text-gray-500 mt-1">Based on {currentFilterType} flights</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-gray-500 mb-1">Avg. Speed</div>
                <div className="text-2xl font-bold text-blue-600">{analyticsData.overallStats.averageSpeed} mph</div>
                <div className="text-xs text-gray-500 mt-1">Cruising velocity</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-gray-500 mb-1">Delayed Flights</div>
                <div className="text-2xl font-bold text-yellow-600">{analyticsData.overallStats.delayedFlights.toLocaleString()}</div>
                <div className="text-xs text-red-500 mt-1">+5.7% from last week</div>
              </CardContent>
            </Card>
          </div>
          
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="mb-4 bg-gray-100">
              <TabsTrigger value="overview" className="data-[state=active]:bg-white">
                <TrendingUp className="h-4 w-4 mr-1.5" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="aircraft" className="data-[state=active]:bg-white">
                <PieChartIcon className="h-4 w-4 mr-1.5" />
                Aircraft
              </TabsTrigger>
              <TabsTrigger value="hourly" className="data-[state=active]:bg-white">
                <Timer className="h-4 w-4 mr-1.5" />
                Hourly
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="m-0">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Flight Activity (Past Week)</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={analyticsData.dailyFlightData}
                          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                          <YAxis width={50} tick={{ fontSize: 12 }} />
                          <Tooltip />
                          <Legend />
                          <Area 
                            type="monotone" 
                            dataKey="commercial" 
                            stackId="1"
                            stroke="#4995fd" 
                            fill="#4995fd" 
                            name="Commercial"
                          />
                          <Area 
                            type="monotone" 
                            dataKey="private" 
                            stackId="1"
                            stroke="#67c8ff" 
                            fill="#67c8ff" 
                            name="Private"
                          />
                          <Area 
                            type="monotone" 
                            dataKey="cargo" 
                            stackId="1"
                            stroke="#003a65" 
                            fill="#003a65" 
                            name="Cargo"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Top Airlines (Current Activity)</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={analyticsData.airlineData}
                          margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
                          layout="vertical"
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                          <XAxis type="number" tick={{ fontSize: 12 }} />
                          <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12 }} />
                          <Tooltip />
                          <Bar dataKey="flights" fill="#4995fd" name="Active Flights">
                            {analyticsData.airlineData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="aircraft" className="m-0">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Aircraft Types Distribution</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={analyticsData.aircraftTypeData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {analyticsData.aircraftTypeData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [value, 'Flights']} />
                          <Legend layout="vertical" verticalAlign="middle" align="right" />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Altitude Distribution</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={analyticsData.altitudeData}
                          margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                          <YAxis width={50} tick={{ fontSize: 12 }} />
                          <Tooltip />
                          <Bar dataKey="count" fill="#55ffdd" name="Number of Flights" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="hourly" className="m-0">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Hourly Flight Distribution (Last 24 Hours)</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={analyticsData.hourlyData}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis 
                          dataKey="hour" 
                          tick={{ fontSize: 11 }} 
                          interval={2}
                        />
                        <YAxis width={50} tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Line 
                          type="monotone" 
                          dataKey="flights" 
                          stroke="#4995fd" 
                          strokeWidth={2}
                          dot={{ fill: '#4995fd', strokeWidth: 2 }}
                          activeDot={{ r: 6, fill: '#55ffdd', stroke: '#4995fd' }}
                          name="Flights"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}