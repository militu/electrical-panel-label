import React from 'react';
import {useTranslations} from 'next-intl';
import {Unit} from '@/app/types/Unit';
import {ColorInput} from "@/app/ui/ColorInput";
import {FormField} from "@/app/ui/UnitForm/FormField";
import {Input} from "@/app/ui/shadcn/input";

interface SidebarSectionProps {
    unit: Unit;
    onChange: (updates: Partial<Unit>) => void;
}

const SidebarSection: React.FC<SidebarSectionProps> = ({unit, onChange}) => {
    const t = useTranslations('UnitForm');

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label={t('sidebarWidth')} name="sidebar_width">
                <Input
                    type="number"
                    value={unit.sidebar_width}
                    onChange={(e) => onChange({sidebar_width: Number(e.target.value)})}
                    min={0}
                    step={0.1}
                />
            </FormField>
            <FormField label={t('sidebarColor')} name="sidebar_color">
                <ColorInput
                    value={unit.sidebar_color}
                    onChange={(e) => onChange({sidebar_color: e.target.value})}
                />
            </FormField>
        </div>
    );
};

export default SidebarSection;