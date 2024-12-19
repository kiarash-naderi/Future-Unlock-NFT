import React, { useRef } from 'react';
import { Clock } from 'lucide-react';

const TimeInput = ({ days, hours, minutes, onChange }) => {
  const inputRefs = {
    days: useRef(days.toString()),
    hours: useRef(hours.toString()),
    minutes: useRef(minutes.toString())
  };

  const handleChange = (type, value) => {
    if (/^\d*$/.test(value)) {
      inputRefs[type].current = value;
      const current = {
        days: parseInt(inputRefs.days.current) || 0,
        hours: parseInt(inputRefs.hours.current) || 0,
        minutes: parseInt(inputRefs.minutes.current) || 0
      };
      onChange(current);
    }
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl space-y-4">
      <h3 className="text-xl font-bold text-white mb-6">Set Time Lock Duration</h3>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="flex-1">
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <Clock className="h-5 w-5 text-teal-400" />
            </div>
            <input
              type="text"
              defaultValue={days}
              onChange={(e) => handleChange('days', e.target.value)}
              className="w-full pl-12 pr-16 py-4 bg-gray-900 border border-gray-700 rounded-xl 
                        text-white text-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent 
                        transition-all duration-200 hover:border-gray-600"
              placeholder="0"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <span className="text-gray-400 font-medium">Days</span>
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <Clock className="h-5 w-5 text-teal-400" />
            </div>
            <input
              type="text"
              defaultValue={hours}
              onChange={(e) => handleChange('hours', e.target.value)}
              className="w-full pl-12 pr-16 py-4 bg-gray-900 border border-gray-700 rounded-xl 
                        text-white text-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent 
                        transition-all duration-200 hover:border-gray-600"
              placeholder="0"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <span className="text-gray-400 font-medium">Hours</span>
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <Clock className="h-5 w-5 text-teal-400" />
            </div>
            <input
              type="text"
              defaultValue={minutes}
              onChange={(e) => handleChange('minutes', e.target.value)}
              className="w-full pl-12 pr-16 py-4 bg-gray-900 border border-gray-700 rounded-xl 
                        text-white text-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent 
                        transition-all duration-200 hover:border-gray-600"
              placeholder="0"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <span className="text-gray-400 font-medium">Minutes</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="text-center text-gray-400 mt-4">
        Total Lock Time: {days}d {hours}h {minutes}m
      </div>
    </div>
  );
};

export default TimeInput;