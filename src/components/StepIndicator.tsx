
import React from 'react';
import { cn } from '@/lib/utils';
import { Step } from '@/types';

interface StepIndicatorProps {
  steps: Array<{ id: Step; label: string }>;
  currentStep: Step;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ steps, currentStep }) => {
  return (
    <div className="flex items-center justify-center w-full max-w-3xl mx-auto mb-8 mt-4">
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <div
            className={cn(
              'flex flex-col items-center',
              currentStep === step.id ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            <div
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center border-2',
                currentStep === step.id
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-muted-foreground'
              )}
            >
              {index + 1}
            </div>
            <span className="mt-2 text-sm">{step.label}</span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={cn(
                'h-[2px] w-12 mx-2',
                currentStep === step.id || steps.findIndex(s => s.id === currentStep) > index
                  ? 'bg-primary'
                  : 'bg-muted-foreground'
              )}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default StepIndicator;
