import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface StepperProps {
  steps: string[];
  currentStep: number;
}

const Stepper = ({ steps, currentStep }: StepperProps) => {
  const navigate = useNavigate();
  return (
    <div className="flex items-center w-full max-w-4xl mx-auto">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;

        return (
          <div key={index} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center flex-1">
              <button
                onClick={() => {
                  if (index === 0) navigate("/");
                  else if (index === 1) navigate("/report-type");
                  else if (index === 2) navigate("/credentials");
                  else if (index === 3) navigate("/instances");
                  else if (index === 4) navigate("/generate");
                }}
                className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer ${
                  isCompleted
                    ? "bg-nubinix-blue text-white"
                    : isCurrent
                    ? "bg-nubinix-purple text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {index + 1}
              </button>
              <div className="text-sm mt-2 text-center text-gray-600">{step}</div>
            </div>
            {index < steps.length - 1 && (
              <div className="h-[2px] bg-gray-200 w-full mx-4" />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Stepper;