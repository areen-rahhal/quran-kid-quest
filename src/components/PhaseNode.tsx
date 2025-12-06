import { cn } from '@/lib/utils';
import { Phase } from '@/types/phases';
import { Check, Circle } from 'lucide-react';

export type PhaseNodeStatus = 'not-started' | 'in-progress' | 'completed';

interface PhaseNodeProps {
  phase: Phase;
  status: PhaseNodeStatus;
  onClick?: () => void;
  isSelected?: boolean;
}

export const PhaseNode = ({ phase, status, onClick, isSelected = false }: PhaseNodeProps) => {
  const getStatusStyles = () => {
    const baseClasses = 'w-16 h-16 rounded-full border-2 flex flex-col items-center justify-center transition-all duration-200';

    switch (status) {
      case 'completed':
        return cn(
          baseClasses,
          'bg-green-100 border-green-400 text-green-700 hover:bg-green-200 hover:border-green-500 hover:shadow-md'
        );
      case 'in-progress':
        return cn(
          baseClasses,
          'bg-blue-100 border-blue-400 text-blue-700 hover:bg-blue-200 hover:border-blue-500 hover:shadow-md'
        );
      case 'not-started':
        return cn(
          baseClasses,
          'bg-gray-100 border-gray-300 text-gray-500 hover:bg-gray-200 hover:border-gray-400 hover:shadow-md'
        );
      default:
        return baseClasses;
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'completed':
        return <Check className="w-6 h-6" />;
      case 'in-progress':
        return <Circle className="w-4 h-4 fill-current" />;
      case 'not-started':
        return null;
      default:
        return null;
    }
  };

  // Format verse range for display (e.g., "1-5")
  const verseRangeDisplay = `${phase.versesStart}-${phase.versesEnd}`;

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={onClick}
        className={cn(
          getStatusStyles(),
          'cursor-pointer relative group',
          isSelected && 'ring-2 ring-offset-2 ring-primary'
        )}
        title={`Phase ${phase.sequenceNumber}: Verses ${verseRangeDisplay}`}
        aria-label={`Phase ${phase.sequenceNumber}, Verses ${verseRangeDisplay}, Status: ${status}`}
      >
        {status === 'completed' ? (
          getStatusIcon()
        ) : (
          <div className="flex flex-col items-center justify-center gap-0.5">
            <span className="text-lg font-bold">{phase.sequenceNumber}</span>
            <span className="text-xs font-semibold">{verseRangeDisplay}</span>
          </div>
        )}
      </button>
    </div>
  );
};

export default PhaseNode;
