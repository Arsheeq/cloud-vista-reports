
import React from 'react';
import { cn } from '@/lib/utils';
import { Step } from '@/types';

interface StepIndicatorProps {
  currentStep: Step;
  steps: Array<{
    id: Step;
    label: string;
  }>;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, steps }) => {
  // Get the index of the current step
  const currentIndex = steps.findIndex(step => step.id === currentStep);

  return (
    <div className="w-full mb-8">
      <div className="flex justify-between relative">
        {/* Progress line */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2 z-0"></div>
        
        {/* Filled progress line */}
        <div 
          className="absolute top-1/2 left-0 h-1 bg-nubinix-purple -translate-y-1/2 z-0 transition-all duration-300"
          style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
        ></div>
        
        {/* Step indicators */}
        {steps.map((step, index) => {
          const isCompleted = index <= currentIndex;
          const isCurrent = index === currentIndex;
          
          return (
            <div 
              key={step.id} 
              className="relative flex flex-col items-center z-10"
            >
              <div 
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300",
                  isCompleted 
                    ? "bg-nubinix-purple text-white" 
                    : "bg-white text-gray-400 border-2 border-gray-200"
                )}
              >
                {index + 1}
              </div>
              <span 
                className={cn(
                  "mt-2 text-xs font-medium transition-colors duration-300",
                  isCurrent ? "text-nubinix-purple" : "text-gray-500"
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StepIndicator;
