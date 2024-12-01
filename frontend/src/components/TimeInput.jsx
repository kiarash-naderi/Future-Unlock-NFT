import React from 'react';
import { Clock } from 'lucide-react';

const TimeInput = ({ days, hours, minutes, onChange }) => {
  const handleChange = (type, value) => {
    const numValue = Math.max(0, parseInt(value) || 0);
    onChange({ days, hours, minutes, [type]: numValue });
  };

  const TimeUnit = ({ value, type, label, max }) => (
    <div className="flex-1">
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <Clock className="h-5 w-5 text-teal-400" />
        </div>
        <input
          type="number"
          min="0"
          max={max}
          value={value}
          onChange={(e) => handleChange(type, e.target.value)}
          className="w-full pl-12 pr-16 py-4 bg-gray-900 border border-gray-700 rounded-xl text-white text-lg 
                   focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200
                   hover:border-gray-600"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <span className="text-gray-400 font-medium">{label}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl space-y-4">
      <h3 className="text-xl font-bold text-white mb-6">Set Time Lock Duration</h3>
      
      <div className="grid grid-cols-3 gap-4">
        <TimeUnit 
          value={days} 
          type="days" 
          label="Days"
          max={365}
        />
        <TimeUnit 
          value={hours} 
          type="hours" 
          label="Hours"
          max={23}
        />
        <TimeUnit 
          value={minutes} 
          type="minutes" 
          label="Minutes"
          max={59}
        />
      </div>
      
      <div className="text-center text-gray-400 mt-4">
        Total Lock Time: {days}d {hours}h {minutes}m
      </div>
    </div>
  );
};

export default TimeInput;