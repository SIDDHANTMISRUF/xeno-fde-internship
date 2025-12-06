// apps/frontend/components/Dashboard/StatsCard.tsx
import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon?: React.ReactNode;
  description?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  change, 
  icon,
  description 
}) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <div className="flex items-baseline space-x-2">
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            {change !== undefined && (
              <span className={`text-sm font-semibold ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {change >= 0 ? '↗' : '↘'} {Math.abs(change)}%
              </span>
            )}
          </div>
          {description && (
            <p className="text-xs text-gray-400 mt-2">{description}</p>
          )}
        </div>
        {icon && (
          <div className="p-3 bg-blue-50 rounded-lg">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;