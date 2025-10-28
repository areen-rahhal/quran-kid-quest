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
    <div className="mb-4">
      <h2 className="text-base font-bold text-foreground mb-3">
        Surahs to Master
      </h2>
      <div className="grid grid-cols-5 gap-2">
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
