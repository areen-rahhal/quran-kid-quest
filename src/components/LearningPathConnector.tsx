/**
 * LearningPathConnector Component
 * Renders SVG connectors between phase nodes
 * Can be used with CSS-based connectors or full SVG paths
 */

import { cn } from '@/lib/utils';

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
   * Width of the SVG in pixels
   */
  svgWidth?: number;

  /**
   * Top offset for the connector line (CSS value)
   */
  topOffset?: string;

  /**
   * CSS classes to apply to the SVG
   */
  className?: string;
}

export const LearningPathConnector = ({
  phaseCount,
  phaseHeight = 150,
  color = 'currentColor',
  svgWidth = 80,
  topOffset = '4rem',
  className = '',
}: LearningPathConnectorProps) => {
  if (phaseCount < 2) {
    return null;
  }

  // Calculate SVG dimensions
  // End the connector line before the diamond appears
  // Subtract half the phaseHeight to stop at the middle of the last phase
  const connectorHeight = (phaseCount - 1.5) * phaseHeight;
  const svgHeight = Math.max(0, connectorHeight);

  return (
    <svg
      width={svgWidth}
      height={svgHeight}
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      className={`absolute left-1/2 transform -translate-x-1/2 pointer-events-none -z-10 ${className}`}
      style={{ top: topOffset }} // Align with first phase node
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

export default LearningPathConnector;
