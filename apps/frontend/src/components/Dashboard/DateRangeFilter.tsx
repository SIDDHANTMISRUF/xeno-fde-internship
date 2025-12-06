// apps/frontend/components/Dashboard/DateRangeFilter.tsx
'use client';

import React, { useState } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';

interface DateRangeFilterProps {
  dateRange: {
    start: Date;
    end: Date;
  };
  onDateChange: (range: { start: Date; end: Date }) => void;
}

const DateRangeFilter: React.FC<DateRangeFilterProps> = ({ dateRange, onDateChange }) => {
  const [isCustom, setIsCustom] = useState(false);
  
  const predefinedRanges = [
    { label: 'Today', days: 0 },
    { label: 'Last 7 days', days: 7 },
    { label: 'Last 30 days', days: 30 },
    { label: 'Last 90 days', days: 90 },
  ];

  const handlePredefinedRange = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    onDateChange({ start, end });
    setIsCustom(false);
  };

  const handleCustomStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStart = new Date(e.target.value);
    onDateChange({ start: newStart, end: dateRange.end });
    setIsCustom(true);
  };

  const handleCustomEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEnd = new Date(e.target.value);
    onDateChange({ start: dateRange.start, end: newEnd });
    setIsCustom(true);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 p-4 bg-white rounded-xl shadow-sm">
      <div className="flex items-center space-x-3 mb-4 md:mb-0">
        <Calendar className="w-5 h-5 text-gray-400" />
        <h2 className="text-lg font-semibold text-gray-900">Analytics Period</h2>
      </div>
      
      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
        {/* Predefined Ranges */}
        <div className="flex flex-wrap gap-2">
          {predefinedRanges.map((range) => (
            <button
              key={range.label}
              onClick={() => handlePredefinedRange(range.days)}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                !isCustom && dateRange.start.getDate() === new Date().getDate() - range.days
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {range.label}
            </button>
          ))}
          
          <button
            onClick={() => setIsCustom(!isCustom)}
            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center space-x-1 ${
              isCustom 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span>Custom</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
        
        {/* Custom Date Picker */}
        {isCustom && (
          <div className="flex items-center space-x-4 bg-gray-50 p-3 rounded-lg">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                From
              </label>
              <input
                type="date"
                value={dateRange.start.toISOString().split('T')[0]}
                onChange={handleCustomStartChange}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="text-gray-400">→</div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                To
              </label>
              <input
                type="date"
                value={dateRange.end.toISOString().split('T')[0]}
                onChange={handleCustomEndChange}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}
        
        {/* Display current range */}
        <div className="text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-lg">
          {formatDate(dateRange.start)} – {formatDate(dateRange.end)}
        </div>
      </div>
    </div>
  );
};

export default DateRangeFilter;