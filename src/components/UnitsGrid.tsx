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
  const firstCompletedId = units.find((unit) => unit.status === "completed")?.id;

  return (
    <div className="mb-4">
      <div className="grid grid-cols-4 gap-2">
        {units.map((unit) => (
          <UnitCard
            key={unit.id}
            name={unit.name}
            arabicName={unit.arabicName}
            status={unit.status}
            onClick={() => onUnitClick?.(unit)}
            isFirstCompleted={unit.id === firstCompletedId}
          />
        ))}
      </div>
    </div>
  );
};
