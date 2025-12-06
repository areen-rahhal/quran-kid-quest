/**
 * LearningPathConnector Component
 * Renders SVG connectors between phase nodes
 * Can be used with CSS-based connectors or full SVG paths
 */

interface LearningPathConnectorProps {
  /**
   * Number of phases to connect
   */
  phaseCount: number;

  /**
   * Height of each phase container in pixels
   */
  phaseHeight?: number;

  /**
   * Color of the connector lines
   */
  color?: string;

  /**
   * CSS classes to apply to the SVG
   */
  className?: string;
}

export const LearningPathConnector = ({
  phaseCount,
  phaseHeight = 150,
  color = 'currentColor',
  className = '',
}: LearningPathConnectorProps) => {
  if (phaseCount < 2) {
    return null;
  }

  // Calculate SVG dimensions
  // Don't extend beyond the last phase to avoid overlapping with the diamond
  const connectorHeight = (phaseCount - 1) * phaseHeight;
  const svgHeight = connectorHeight;
  const svgWidth = 80; // Width for centering the line

  return (
    <svg
      width={svgWidth}
      height={svgHeight}
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      className={`absolute left-1/2 transform -translate-x-1/2 pointer-events-none -z-10 ${className}`}
      style={{ top: '4rem' }} // Align with first phase node
    >
      {/* Draw vertical connecting lines between nodes */}
      {Array.from({ length: phaseCount - 1 }).map((_, index) => {
        const startY = index * phaseHeight;
        const endY = (index + 1) * phaseHeight;

        return (
          <g key={`connector-${index}`}>
            {/* Main vertical line */}
            <line
              x1={svgWidth / 2}
              y1={startY}
              x2={svgWidth / 2}
              y2={endY}
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.5"
            />
          </g>
        );
      })}
    </svg>
  );
};

/**
 * CSS-based connector alternative
 * Uses border-left for a simpler, no-SVG approach
 */
export const LearningPathConnectorCSS = ({
  phaseCount,
  className = '',
}: {
  phaseCount: number;
  className?: string;
}) => {
  if (phaseCount < 2) {
    return null;
  }

  return (
    <div
      className={cn('absolute left-1/2 transform -translate-x-1/2', className)}
      style={{
        width: '2px',
        height: `${(phaseCount - 1) * 150}px`,
        backgroundColor: 'currentColor',
        opacity: 0.3,
        top: '4rem',
      }}
    />
  );
};

// Helper for combining imports
import { cn } from '@/lib/utils';

export default LearningPathConnector;
