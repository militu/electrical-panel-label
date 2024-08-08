import React, {useMemo} from 'react';
import {useTranslations} from 'next-intl';
import {Unit} from '@/app/types/Unit';
import BaseUnitForm from './BaseUnitForm';
import {UnitService} from "@/app/services/UnitService";
import {useIsSmallScreen} from "@/app/hooks/useIsSmallScreen";

interface MultiUnitFormProps {
    units: Unit[];
    onSubmit: (updatedUnits: Unit[]) => void;
    onCancel: () => void;
}

const MultiUnitForm: React.FC<MultiUnitFormProps> = ({units, onSubmit, onCancel}) => {
    const t = useTranslations('UnitForm');
    const isSmallScreen = useIsSmallScreen();

    const initialData = useMemo(() => {
        const unitService = new UnitService();
        const defaultUnit = unitService.createUnit();
        const commonData: Partial<{ [K in keyof Unit]: Unit[K] | undefined }> = {};

        if (units.length > 0) {
            Object.keys(defaultUnit).forEach((key) => {
                if (key !== 'id') {
                    const allEqual = units.every(unit => unit[key as keyof Unit] === units[0][key as keyof Unit]);
                    if (allEqual) {
                        // @ts-ignore
                        commonData[key as keyof Unit] = units[0][key as keyof Unit];
                    }
                }
            });
        }
        return commonData;
    }, [units]);

    const handleSubmit = (formData: Unit) => {
        const updatedUnits = units.map(unit => ({...unit, ...formData}));
        onSubmit(updatedUnits);
    };

    return (
        <div className="max-w-4xl mx-auto p-4">
            <h2 className="text-xl font-bold mb-4 text-gray-800">{t('configurationTitle')}</h2>
            <BaseUnitForm
                initialData={initialData}
                onSubmit={handleSubmit}
                onCancel={onCancel}
                submitLabel={t('saveChanges')}
                isSmallScreen={isSmallScreen}
            />
        </div>
    );
};

export default MultiUnitForm;