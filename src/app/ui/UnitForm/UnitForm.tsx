// src/app/ui/UnitForm/UnitForm.tsx
import React, {useEffect, useState} from 'react';
import {useTranslations} from 'next-intl';
import {Unit} from '@/app/types/Unit';
import {useSVGGeneration} from '@/app/hooks/useSvgGeneration';
import BaseUnitForm from "@/app/ui/UnitForm/BaseUnitForm";
import {useIsSmallScreen} from "@/app/hooks/useIsSmallScreen";

interface UnitFormProps {
    unit: Unit;
    onSubmit: (updatedUnit: Unit) => void;
    onDelete: () => void;
    onCancel: () => void;
}

const UnitForm: React.FC<UnitFormProps> = ({unit, onSubmit, onDelete, onCancel}) => {
    const t = useTranslations('UnitForm');
    const {generateUnitSVG} = useSVGGeneration();
    const [unitSvg, setUnitSvg] = useState<string>('');
    const isSmallScreen = useIsSmallScreen();
    const [currentUnit, setCurrentUnit] = useState(unit);

    const updateUnitSvg = React.useCallback(async (unitToUpdate: Unit) => {
        const svg = await generateUnitSVG(unitToUpdate);
        setUnitSvg(svg);
    }, [generateUnitSVG]);

    useEffect(() => {
        updateUnitSvg(currentUnit);
    }, [currentUnit, updateUnitSvg]);


    const handleChange = (updatedData: Partial<Unit>) => {
        setCurrentUnit(prev => ({...prev, ...updatedData}));
    };

    const handleSubmit = (updatedUnit: Unit) => {
        onSubmit(updatedUnit);
    };

    return (
        <div className="flex flex-col lg:flex-row max-w-4xl mx-auto p-4 gap-6 h-full">
            {!isSmallScreen && (
                <div className="lg:w-1/2 flex flex-col h-full">
                    <h3 className="text-lg font-semibold mb-4">{t('preview')}</h3>
                    {unitSvg && (
                        <div
                            dangerouslySetInnerHTML={{__html: unitSvg}}
                            className="border p-4 rounded-lg flex items-center justify-center bg-white shadow-md flex-grow"
                        />
                    )}
                </div>
            )}
            <div className="w-full lg:w-1/2 flex flex-col h-full">
                <h2 className="text-xl font-bold mb-4 text-gray-800">{t('configurationTitle')}</h2>
                <BaseUnitForm
                    initialData={unit}
                    onSubmit={handleSubmit}
                    onCancel={onCancel}
                    submitLabel={t('saveChanges')}
                    showDelete={true}
                    onDelete={onDelete}
                    onChange={handleChange}
                    isSmallScreen={isSmallScreen}
                />
            </div>
        </div>
    );
};

export default UnitForm;