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
  return (
    <div className="mb-6">
      <h2 className="text-lg font-bold text-foreground mb-4">
        Surahs to Master
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {units.map((unit) => (
          <UnitCard
            key={unit.id}
            name={unit.name}
            arabicName={unit.arabicName}
            status={unit.status}
            onClick={() => onUnitClick?.(unit)}
          />
        ))}
      </div>
    </div>
  );
};
