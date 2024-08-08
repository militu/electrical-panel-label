// UnitCard.tsx
import React from 'react';
import {Unit} from '@/app/types/Unit';
import ElectricalModule from "@/app/ui/electrical-module/ElectricalModule";
import {Checkbox} from "@/app/ui/shadcn/checkbox";
import {PencilIcon} from "lucide-react";

interface UnitCardProps {
    unit: Unit;
    onEdit: () => void;
    className?: string;
    isSelected: boolean;
    onSelect: (id: string, isSelected: boolean) => void;
}

const UnitCard: React.FC<UnitCardProps> = ({unit, onEdit, className, isSelected, onSelect}) => {
    return (
        <div className={`relative`}>
            <div className="absolute bottom-1 left-2 z-10">
                <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) => onSelect(unit.id, checked as boolean)}
                /></div>
            <div className="absolute bottom-1 right-2 z-10">
                {onEdit && (
                    <button onClick={onEdit} aria-label="Edit">
                        <PencilIcon size={16}/>
                    </button>
                )}
            </div>
            <ElectricalModule
                size={unit.size}
                logo={unit.logo || undefined}
                description={unit.description || ' '}
                className={`${className} ${isSelected ? 'opacity-80 border-solid border-2 border-sky-500' : ''}`}
                backgroundColor={unit.bottom_color}
                textColor={unit.description_color}
                sidebarColor={unit.sidebar_color}
            />
        </div>
    );
};

export default UnitCard;