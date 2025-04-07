import React, { ReactNode } from 'react';

// Simple container for wrapping chart components
export function ChartContainer({ children, title, className = '' }: { 
  children: ReactNode, 
  title?: string, 
  className?: string 
}) {
  return (
    <div className={`p-4 rounded-lg bg-white/70 dark:bg-gray-800/30 backdrop-blur-sm ${className}`}>
      {title && <h3 className="text-sm font-medium mb-3 text-aviation-blue-dark dark:text-aviation-blue-light">{title}</h3>}
      <div className="w-full">{children}</div>
    </div>
  );
}

// Line chart component (simplified version without actual chart library for now)
export function LineChart({ 
  data = [],
  labels = [],
  height = 200,
  color = 'var(--aviation-blue)',
  className = ''
}: {
  data?: number[],
  labels?: string[],
  height?: number,
  color?: string,
  className?: string
}) {
  return (
    <div className={`h-${height} flex items-center justify-center ${className}`}>
      <div className="flex items-end h-full w-full">
        {data.map((value, index) => {
          // Calculate height percentage based on the value
          const maxValue = Math.max(...data);
          const heightPercent = maxValue > 0 ? (value / maxValue) * 100 : 0;
          
          return (
            <div key={index} className="flex flex-col items-center flex-1 mx-1">
              <div 
                className="w-full rounded-t-sm transition-all duration-300"
                style={{ 
                  height: `${heightPercent}%`, 
                  backgroundColor: color,
                  minHeight: '4px'
                }}
              ></div>
              {labels[index] && (
                <span className="text-xs mt-1 text-gray-500 truncate w-full text-center">
                  {labels[index]}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Bar chart component (simplified version without actual chart library for now)
export function BarChart({ 
  data = [],
  labels = [],
  height = 200,
  color = 'var(--aviation-blue)',
  className = ''
}: {
  data?: number[],
  labels?: string[],
  height?: number,
  color?: string,
  className?: string
}) {
  return (
    <div className={`h-${height} flex items-center justify-center ${className}`}>
      <div className="flex items-end h-full w-full gap-2">
        {data.map((value, index) => {
          // Calculate height percentage based on the value
          const maxValue = Math.max(...data);
          const heightPercent = maxValue > 0 ? (value / maxValue) * 100 : 0;
          
          return (
            <div key={index} className="flex flex-col items-center flex-1">
              <div 
                className="w-full rounded-t-sm transition-all duration-300"
                style={{ 
                  height: `${heightPercent}%`, 
                  backgroundColor: color,
                  minHeight: '4px'
                }}
              ></div>
              {labels[index] && (
                <span className="text-xs mt-1 text-gray-500 truncate w-full text-center">
                  {labels[index]}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}