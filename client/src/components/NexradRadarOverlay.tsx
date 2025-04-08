import React, { useEffect, useState } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';

// Define the props for the NEXRAD radar overlay component
interface NexradRadarOverlayProps {
  enabled: boolean;
  opacity?: number;
  zoom: number;
}

// Data structure for NEXRAD stations
interface NexradStation {
  id: string;
  name: string;
  lat: number;
  lon: number;
  rangeKm: number;
}

// List of major NEXRAD stations across the US
const NEXRAD_STATIONS: NexradStation[] = [
  { id: "KTLX", name: "Oklahoma City, OK", lat: 35.333, lon: -97.278, rangeKm: 460 },
  { id: "KDIX", name: "Philadelphia, PA", lat: 39.947, lon: -74.411, rangeKm: 460 },
  { id: "KATX", name: "Seattle, WA", lat: 48.195, lon: -122.496, rangeKm: 460 },
  { id: "KMUX", name: "San Francisco, CA", lat: 37.155, lon: -121.898, rangeKm: 460 },
  { id: "KFWS", name: "Dallas/Fort Worth, TX", lat: 32.573, lon: -97.303, rangeKm: 460 },
  { id: "KLOT", name: "Chicago, IL", lat: 41.604, lon: -88.085, rangeKm: 460 },
  { id: "KBRO", name: "Brownsville, TX", lat: 25.916, lon: -97.419, rangeKm: 460 },
  { id: "KAMX", name: "Miami, FL", lat: 25.611, lon: -80.413, rangeKm: 460 },
  { id: "KABX", name: "Albuquerque, NM", lat: 35.150, lon: -106.824, rangeKm: 460 },
  { id: "KFCX", name: "Roanoke, VA", lat: 37.024, lon: -80.274, rangeKm: 460 },
  { id: "KBOX", name: "Boston, MA", lat: 41.956, lon: -71.137, rangeKm: 460 },
  { id: "KRIW", name: "Riverton, WY", lat: 43.066, lon: -108.477, rangeKm: 460 },
  { id: "KLBB", name: "Lubbock, TX", lat: 33.654, lon: -101.814, rangeKm: 460 },
  { id: "KMOB", name: "Mobile, AL", lat: 30.679, lon: -88.240, rangeKm: 460 },
  { id: "KMLB", name: "Melbourne, FL", lat: 28.113, lon: -80.654, rangeKm: 460 }
];

/**
 * Component that displays NEXRAD radar data on a Leaflet map
 */
export function NexradRadarOverlay({ enabled, opacity = 0.65, zoom }: NexradRadarOverlayProps) {
  const map = useMap();
  const { toast } = useToast();
  const [radarLayers, setRadarLayers] = useState<L.ImageOverlay[]>([]);
  const [visibleStations, setVisibleStations] = useState<NexradStation[]>([]);
  const [loading, setLoading] = useState(false);

  // Function to determine which NEXRAD stations should be visible 
  // based on the current map bounds and zoom level
  const getVisibleStations = () => {
    if (!map || zoom < 5) {
      // At low zoom levels, limit to a few stations to avoid overwhelming the map
      return NEXRAD_STATIONS.slice(0, 3);
    }

    const bounds = map.getBounds();
    const visibleArea = bounds.getNorthEast().distanceTo(bounds.getSouthWest()) / 1000; // in km
    
    // If zoomed in very far, only show stations in the visible area
    if (zoom > 8) {
      return NEXRAD_STATIONS.filter(station => {
        return bounds.contains([station.lat, station.lon]);
      });
    }
    
    // Otherwise, select a subset of stations based on the visible area
    // The larger the visible area, the fewer stations we show
    const maxStations = Math.max(3, Math.min(10, Math.floor(20000 / visibleArea)));
    return NEXRAD_STATIONS.filter((station, index) => index < maxStations);
  };

  // Fetch radar data for a specific NEXRAD station
  const fetchRadarData = async (station: NexradStation) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/nexrad?station=${station.id}`);
      
      if (response.data && response.data.url) {
        // Calculate the bounds for the radar image based on station location and range
        const radiusLat = station.rangeKm / 111.32; // 1 degree lat is approximately 111.32 km
        const radiusLon = station.rangeKm / (111.32 * Math.cos(station.lat * (Math.PI / 180)));
        
        const southWest: L.LatLngTuple = [station.lat - radiusLat, station.lon - radiusLon];
        const northEast: L.LatLngTuple = [station.lat + radiusLat, station.lon + radiusLon];
        
        // Create an image overlay with the radar data
        const imageOverlay = L.imageOverlay(response.data.url, [southWest, northEast], {
          opacity: opacity,
          pane: 'overlayPane',
        });
        
        // Add the overlay to the map
        imageOverlay.addTo(map);
        
        // Store the overlay in state so we can remove it later
        setRadarLayers(prev => [...prev, imageOverlay]);
      }
    } catch (error) {
      console.error(`Error fetching NEXRAD data for station ${station.id}:`, error);
      toast({
        title: 'Radar Data Error',
        description: `Unable to load radar data for ${station.name}`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Effect to update visible stations when map bounds or zoom changes
  useEffect(() => {
    if (enabled) {
      const stations = getVisibleStations();
      setVisibleStations(stations);
    }
  }, [map, zoom, enabled]);

  // Effect to fetch radar data for visible stations
  useEffect(() => {
    if (!enabled || visibleStations.length === 0) return;
    
    // Clear existing radar layers
    radarLayers.forEach(layer => {
      if (map.hasLayer(layer)) {
        map.removeLayer(layer);
      }
    });
    setRadarLayers([]);
    
    // Fetch radar data for each visible station
    visibleStations.forEach(station => {
      fetchRadarData(station);
    });
    
    // Cleanup function to remove radar layers when component unmounts
    return () => {
      radarLayers.forEach(layer => {
        if (map.hasLayer(layer)) {
          map.removeLayer(layer);
        }
      });
    };
  }, [visibleStations, enabled]);

  // When the enabled state changes, add or remove the radar overlay
  useEffect(() => {
    if (!enabled) {
      // Remove all radar layers when the overlay is disabled
      radarLayers.forEach(layer => {
        if (map.hasLayer(layer)) {
          map.removeLayer(layer);
        }
      });
      setRadarLayers([]);
    }
  }, [enabled, map]);

  // When opacity changes, update the opacity of all radar layers
  useEffect(() => {
    radarLayers.forEach(layer => {
      layer.setOpacity(opacity);
    });
  }, [opacity, radarLayers]);

  // This component doesn't render anything directly to the DOM
  return null;
}