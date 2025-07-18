interface StepIndicatorProps {
    currentStep: number
    totalSteps: number
  }
  
  export default function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
    return (
      <div className="flex items-center space-x-2">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div 
            key={index} 
            className={`h-2 w-2 rounded-full ${
              index + 1 === currentStep 
                ? 'bg-emerald-600' 
                : index + 1 < currentStep 
                  ? 'bg-emerald-300' 
                  : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
    )
  }
  