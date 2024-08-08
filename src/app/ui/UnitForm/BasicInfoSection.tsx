import React from 'react';
import {useTranslations} from 'next-intl';
import {Unit} from '@/app/types/Unit';
import {IconName} from '@/app/types/Icon';
import {Input} from "@/app/ui/shadcn/input";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/app/ui/shadcn/select";
import {useTranslatedIconList} from '@/app/hooks/useTranslatedIconList';
import Image from 'next/image';
import {FormField} from "@/app/ui/UnitForm/FormField";

interface BasicInfoSectionProps {
    unit: Unit;
    onChange: (updates: Partial<Unit>) => void;
}

const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({unit, onChange}) => {
    const t = useTranslations('UnitForm');
    const iconList = useTranslatedIconList();

    const handleSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const size = Math.min(Math.max(1, parseInt(e.target.value) || 1), 18);
        onChange({size});
    };

    const handleLogoChange = (value: string) => {
        onChange({logo: value === '__NO_ICON__' ? null : value as IconName});
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label={t('moduleSize')} name="size">
                <Input
                    type="number"
                    value={unit.size}
                    onChange={handleSizeChange}
                    min={1}
                    max={18}
                />
            </FormField>
            <FormField label={t('icon')} name="logo">
                <Select onValueChange={handleLogoChange} value={unit.logo ?? '__NO_ICON__'}>
                    <SelectTrigger>
                        <SelectValue placeholder={t('selectIconPlaceholder')}/>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="__NO_ICON__">{t('noIcon')}</SelectItem>
                        {iconList.map((icon) => (
                            <SelectItem key={icon.value} value={icon.value}>
                                <div className="flex items-center">
                                    <Image
                                        src={`/icons/${icon.value}.svg`}
                                        width={16}
                                        height={16}
                                        alt={icon.label}
                                        className="mr-2"
                                    />
                                    {icon.label}
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </FormField>
        </div>
    );
};

export default BasicInfoSection;