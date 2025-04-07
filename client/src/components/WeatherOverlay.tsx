import React, { useEffect, useState } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { WeatherData } from '@shared/schema';

interface WeatherOverlayProps {
  enabled: boolean;
  airportCode?: string;
  zoom: number;
}

const WeatherOverlay: React.FC<WeatherOverlayProps> = ({ enabled, airportCode, zoom }) => {
  const map = useMap();
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [weatherLayer, setWeatherLayer] = useState<L.LayerGroup | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch weather data when airport code changes or enabled changes
  useEffect(() => {
    if (!enabled || !airportCode) {
      if (weatherLayer) {
        weatherLayer.clearLayers();
      }
      return;
    }

    const fetchWeatherData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/weather/${airportCode}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch weather: ${response.statusText}`);
        }
        const data = await response.json();
        setWeatherData(data);
      } catch (err) {
        console.error('Error fetching weather data:', err);
        setError('Failed to load weather information');
      } finally {
        setLoading(false);
      }
    };

    fetchWeatherData();
  }, [enabled, airportCode]);

  // Create or update weather layer when data changes
  useEffect(() => {
    if (!enabled || !weatherData) {
      if (weatherLayer) {
        weatherLayer.clearLayers();
      }
      return;
    }

    // Create a new layer group if it doesn't exist
    if (!weatherLayer) {
      const newLayer = L.layerGroup().addTo(map);
      setWeatherLayer(newLayer);
    } else {
      // Clear existing layers if it already exists
      weatherLayer.clearLayers();
    }

    // Add weather data visualization
    if (weatherData && weatherLayer) {
      try {
        // Add weather marker at location
        const { latitude, longitude } = weatherData.location;
        
        // Create weather icon based on condition
        const weatherIcon = createWeatherIcon(weatherData);
        
        // Add weather marker
        const weatherMarker = L.marker([latitude, longitude], {
          icon: weatherIcon,
          zIndexOffset: 1000
        });
        
        // Create popup with weather details
        const popup = createWeatherPopup(weatherData);
        weatherMarker.bindPopup(popup);
        
        // Add to layer
        weatherLayer.addLayer(weatherMarker);
        
        // If zoom is high enough, add weather impact visualization
        if (zoom >= 7 && weatherData.flightImpact) {
          addWeatherImpactLayer(weatherData, weatherLayer);
        }
      } catch (err) {
        console.error('Error adding weather layers:', err);
      }
    }
  }, [map, enabled, weatherData, weatherLayer, zoom]);

  // Create weather icon based on condition
  const createWeatherIcon = (weather: WeatherData) => {
    // Get condition and icon path
    const condition = weather.current.condition.toLowerCase();
    const iconUrl = weather.current.conditionIcon 
      ? `https:${weather.current.conditionIcon}`
      : getDefaultWeatherIcon(condition);
    
    // Determine color based on flight impact if available
    let borderColor = '#4995fd'; // Default AeroLink blue
    if (weather.flightImpact) {
      const impact = weather.flightImpact.overallImpact;
      if (impact >= 7) {
        borderColor = '#e11d48'; // Red for severe
      } else if (impact >= 5) {
        borderColor = '#f59e0b'; // Amber for moderate
      } else if (impact >= 3) {
        borderColor = '#facc15'; // Yellow for light
      } else {
        borderColor = '#22c55e'; // Green for minimal
      }
    }
    
    return L.divIcon({
      html: `
        <div class="weather-icon" style="
          width: 44px;
          height: 44px;
          background-color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          border: 3px solid ${borderColor};
          position: relative;
        ">
          <img 
            src="${iconUrl}" 
            alt="${condition}" 
            style="width: 32px; height: 32px;" 
          />
          <div style="
            position: absolute;
            bottom: -5px;
            right: -5px;
            background-color: white;
            border-radius: 50%;
            width: 22px;
            height: 22px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 9px;
            border: 2px solid ${borderColor};
            color: #333;
          ">
            ${Math.round(weather.current.tempF)}°F
          </div>
        </div>
      `,
      className: 'weather-marker',
      iconSize: [44, 44],
      iconAnchor: [22, 22],
    });
  };
  
  // Get default weather icon based on condition
  const getDefaultWeatherIcon = (condition: string) => {
    if (condition.includes('thunder') || condition.includes('lightning')) {
      return '/weather-icons/thunderstorm.svg';
    } else if (condition.includes('rain') || condition.includes('drizzle')) {
      return '/weather-icons/rain.svg';
    } else if (condition.includes('snow') || condition.includes('sleet')) {
      return '/weather-icons/snow.svg';
    } else if (condition.includes('fog') || condition.includes('mist')) {
      return '/weather-icons/fog.svg';
    } else if (condition.includes('cloud')) {
      return '/weather-icons/cloudy.svg';
    } else {
      return '/weather-icons/sunny.svg';
    }
  };
  
  // Create weather popup content
  const createWeatherPopup = (weatherData: WeatherData) => {
    const colorClass = getImpactColorClass(weatherData);
    
    const popupContent = document.createElement('div');
    popupContent.className = 'weather-popup';
    
    // Create header with location name
    const header = document.createElement('div');
    header.className = 'weather-popup-header';
    header.style.cssText = `
      font-weight: bold;
      color: #003a65;
      border-bottom: 2px solid #4995fd;
      margin-bottom: 8px;
      padding-bottom: 4px;
    `;
    header.textContent = `${weatherData.location.name} Weather`;
    popupContent.appendChild(header);
    
    // Current conditions
    const current = document.createElement('div');
    current.className = 'weather-current';
    current.innerHTML = `
      <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
        <div>
          <div style="font-size: 20px; font-weight: bold;">${Math.round(weatherData.current.tempF)}°F</div>
          <div>${weatherData.current.condition}</div>
        </div>
        ${weatherData.flightImpact ? `
          <div style="text-align: right;">
            <div style="font-weight: bold; color: ${colorClass};">
              ${weatherData.flightImpact.flightCategory}
            </div>
            <div style="font-size: 12px;">Flying Conditions</div>
          </div>
        ` : ''}
      </div>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 12px;">
        <div>Wind: ${weatherData.current.windMph} mph ${weatherData.current.windDir}</div>
        <div>Visibility: ${weatherData.current.visibilityMiles} mi</div>
        <div>Pressure: ${weatherData.current.pressureInHg} inHg</div>
        <div>Humidity: ${weatherData.current.humidity}%</div>
        <div>Dew Point: ${weatherData.current.dewpointF}°F</div>
        <div>Ceiling: ${weatherData.current.cloudCeiling || 'Unknown'}</div>
      </div>
    `;
    popupContent.appendChild(current);
    
    // Flight impact section
    if (weatherData.flightImpact) {
      const impact = document.createElement('div');
      impact.className = 'weather-impact';
      impact.style.cssText = `
        margin-top: 10px;
        padding-top: 8px;
        border-top: 1px solid #e5e7eb;
      `;
      
      impact.innerHTML = `
        <div style="font-weight: bold; margin-bottom: 4px;">Flight Impact</div>
        <div style="font-size: 12px; margin-bottom: 6px;">Overall Impact: 
          <span style="
            display: inline-block;
            width: 14px;
            height: 14px;
            border-radius: 50%;
            background-color: ${colorClass};
            vertical-align: middle;
            margin-right: 4px;
          "></span>
          ${weatherData.flightImpact.overallImpact.toFixed(1)}/10
        </div>
        ${weatherData.flightImpact.recommendations.length > 0 ? `
          <div style="font-size: 12px; font-style: italic; color: #666;">
            ${weatherData.flightImpact.recommendations[0]}
          </div>
        ` : ''}
      `;
      popupContent.appendChild(impact);
    }
    
    // Forecast preview (if available)
    if (weatherData.forecast?.daily && weatherData.forecast.daily.length > 0) {
      const forecast = document.createElement('div');
      forecast.className = 'weather-forecast';
      forecast.style.cssText = `
        margin-top: 10px;
        padding-top: 8px;
        border-top: 1px solid #e5e7eb;
        font-size: 12px;
      `;
      
      forecast.innerHTML = `
        <div style="font-weight: bold; margin-bottom: 4px;">Forecast</div>
        <div style="display: flex; justify-content: space-between; overflow-x: auto;">
          ${weatherData.forecast.daily.slice(0, 3).map(day => `
            <div style="text-align: center; padding: 0 4px; min-width: 60px;">
              <div>${formatDate(day.date)}</div>
              <div>${Math.round(day.tempMaxF)}°/${Math.round(day.tempMinF)}°</div>
              <div>${day.precipChance}%</div>
            </div>
          `).join('')}
        </div>
      `;
      popupContent.appendChild(forecast);
    }
    
    // Link to detailed view
    const viewMore = document.createElement('div');
    viewMore.className = 'weather-view-more';
    viewMore.style.cssText = `
      margin-top: 10px;
      text-align: center;
      font-size: 12px;
      color: #4995fd;
      cursor: pointer;
    `;
    viewMore.textContent = 'View Detailed Weather';
    viewMore.onclick = () => {
      // For now, just show an alert. In the future, this could open a detailed panel.
      alert('Detailed weather view will be implemented in future updates!');
    };
    popupContent.appendChild(viewMore);
    
    return popupContent;
  };
  
  // Format date for forecast display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { weekday: 'short' });
  };
  
  // Add weather impact visualization to the map
  const addWeatherImpactLayer = (weatherData: WeatherData, layerGroup: L.LayerGroup) => {
    if (!weatherData.flightImpact) return;
    
    const { latitude, longitude } = weatherData.location;
    const impact = weatherData.flightImpact.overallImpact;
    
    // Determine radius based on impact severity (larger for more severe)
    const radius = Math.max(5000, impact * 1500);
    
    // Determine color based on impact
    const color = getImpactColor(weatherData);
    const fillColor = color.replace(')', ', 0.2)').replace('rgb', 'rgba');
    
    // Create circle
    const impactCircle = L.circle([latitude, longitude], {
      radius,
      color,
      fillColor,
      fillOpacity: 0.2,
      weight: 1
    });
    
    layerGroup.addLayer(impactCircle);
    
    // If there are weather alerts, add markers for them
    if (weatherData.alerts && weatherData.alerts.length > 0) {
      addAlertMarkers(weatherData, layerGroup);
    }
  };
  
  // Add alert markers to the map
  const addAlertMarkers = (weatherData: WeatherData, layerGroup: L.LayerGroup) => {
    if (!weatherData.alerts) return;
    
    weatherData.alerts.forEach(alert => {
      // Create position slightly offset from the main weather marker
      const offsetLat = weatherData.location.latitude + (Math.random() * 0.02 - 0.01);
      const offsetLng = weatherData.location.longitude + (Math.random() * 0.02 - 0.01);
      
      // Determine severity color
      let color = '#e11d48'; // Default to red for severe
      if (alert.severity.toLowerCase().includes('minor')) {
        color = '#f59e0b'; // Amber for minor
      } else if (alert.severity.toLowerCase().includes('moderate')) {
        color = '#f59e0b'; // Amber for moderate
      }
      
      // Create alert icon
      const alertIcon = L.divIcon({
        html: `
          <div style="
            width: 24px;
            height: 24px;
            background-color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            border: 2px solid ${color};
          ">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 9V14M12 18H12.01M7.92 3H16.08C16.7801 3 17.3762 3.41752 17.6653 4.05319L21.8779 12.4468C22.143 13.0251 22.0745 13.7048 21.695 14.2174L15.817 22.5806C15.354 23.2351 14.4956 23.3903 13.8489 22.9289L2.3511 14.5711C1.82677 14.2022 1.6584 13.5207 1.9407 12.9653L6.31471 4.05319C6.60376 3.41752 7.19991 3 7.92 3Z" stroke="${color}" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
        `,
        className: 'weather-alert-marker',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });
      
      // Create marker and popup
      const alertMarker = L.marker([offsetLat, offsetLng], {
        icon: alertIcon,
        zIndexOffset: 1100
      });
      
      // Create popup with alert details
      const popupContent = document.createElement('div');
      popupContent.className = 'alert-popup';
      popupContent.innerHTML = `
        <div style="font-weight: bold; color: ${color}; margin-bottom: 5px;">
          ${alert.event}
        </div>
        <div style="font-size: 12px; margin-bottom: 8px;">
          <strong>Severity:</strong> ${alert.severity}
        </div>
        <div style="font-size: 12px; margin-bottom: 8px;">
          ${alert.headline}
        </div>
        <div style="font-size: 11px; color: #666;">
          <strong>Valid:</strong> ${formatTimeRange(alert.effective, alert.expires)}
        </div>
      `;
      
      alertMarker.bindPopup(popupContent);
      layerGroup.addLayer(alertMarker);
    });
  };
  
  // Format alert time range
  const formatTimeRange = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    const formatOptions: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    };
    
    return `${start.toLocaleString(undefined, formatOptions)} - ${end.toLocaleString(undefined, formatOptions)}`;
  };
  
  // Get impact color based on severity
  const getImpactColor = (weather: WeatherData) => {
    if (!weather.flightImpact) return 'rgb(73, 149, 253)'; // Default AeroLink blue
    
    const impact = weather.flightImpact.overallImpact;
    if (impact >= 7) {
      return 'rgb(225, 29, 72)'; // Red for severe
    } else if (impact >= 5) {
      return 'rgb(245, 158, 11)'; // Amber for moderate
    } else if (impact >= 3) {
      return 'rgb(250, 204, 21)'; // Yellow for light
    } else {
      return 'rgb(34, 197, 94)'; // Green for minimal
    }
  };
  
  // Get impact color class
  const getImpactColorClass = (weather: WeatherData) => {
    if (!weather.flightImpact) return '#4995fd'; // Default AeroLink blue
    
    const impact = weather.flightImpact.overallImpact;
    if (impact >= 7) {
      return '#e11d48'; // Red for severe
    } else if (impact >= 5) {
      return '#f59e0b'; // Amber for moderate
    } else if (impact >= 3) {
      return '#facc15'; // Yellow for light
    } else {
      return '#22c55e'; // Green for minimal
    }
  };

  // Component doesn't render anything directly, it just manages the map layers
  return null;
};

export default WeatherOverlay;