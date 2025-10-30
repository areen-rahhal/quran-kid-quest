import { UnitCard, UnitStatus } from "./UnitCard";

export interface Unit {
  id: number;
  name: string;
  arabicName: string;
  status: UnitStatus;
}

interface UnitsGridProps {
  units: Unit[];
  onUnitClick?: (unit: Unit) => void;
}

export const UnitsGrid = ({ units, onUnitClick }: UnitsGridProps) => {
  // Generate random positions for each unit
  const getRandomPosition = (index: number) => {
    // Use index as seed for consistent positioning
    const seed = index * 2654435761;
    const random1 = ((seed ^ (seed >> 16)) & 0xFFFF) / 0xFFFF;
    const random2 = (((seed * 1103515245 + 12345) ^ ((seed * 1103515245 + 12345) >> 16)) & 0xFFFF) / 0xFFFF;
    
    return {
      top: `${random1 * 85}%`, // 85% to keep within bounds
      left: `${random2 * 85}%`, // 85% to keep within bounds
    };
  };

  return (
    <div className="mb-4">
      {/* Container with same approximate height as 8 rows grid */}
      <div className="relative h-[680px] w-full">
        {units.map((unit, index) => {
          const position = getRandomPosition(index);
          return (
            <div
              key={unit.id}
              className="absolute w-[50px]"
              style={position}
            >
              <UnitCard
                name={unit.name}
                arabicName={unit.arabicName}
                status={unit.status}
                onClick={() => onUnitClick?.(unit)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
