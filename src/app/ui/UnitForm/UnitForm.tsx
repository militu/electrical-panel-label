import React, {useCallback, useEffect, useState} from 'react';
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

    const updateUnitSvg = useCallback(async (unitToUpdate: Unit) => {
        const svg = await generateUnitSVG(unitToUpdate);
        setUnitSvg(svg);
    }, [generateUnitSVG]);

    useEffect(() => {
        updateUnitSvg(currentUnit);
    }, [currentUnit, updateUnitSvg]);

    const handleChange = (updatedData: Partial<Unit>) => {
        setCurrentUnit(prev => ({...prev, ...updatedData}));
    };

    return (
        <div className="flex flex-col lg:flex-row w-full h-full gap-6">
            {!isSmallScreen && (
                <div className="lg:w-1/2 xl:w-2/5 flex flex-col">
                    <h3 className="text-lg font-semibold mb-4">{t('preview')}</h3>
                    <div
                        className="flex-grow flex items-center justify-center bg-white rounded-lg shadow-md p-4 overflow-hidden">
                        {unitSvg && (
                            <div
                                dangerouslySetInnerHTML={{__html: unitSvg}}
                                className="w-full h-full flex items-center justify-center"
                                style={{maxHeight: '100%', objectFit: 'contain'}}
                            />
                        )}
                    </div>
                </div>
            )}
            <div className={`${isSmallScreen ? 'w-full' : 'lg:w-1/2 xl:w-3/5'} flex flex-col`}>
                <h2 className="text-xl font-bold mb-4 text-gray-800">{t('configurationTitle')}</h2>
                <BaseUnitForm
                    initialData={currentUnit}
                    onSubmit={onSubmit}
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