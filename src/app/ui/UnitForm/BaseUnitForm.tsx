import React, {useState} from 'react';
import {useTranslations} from 'next-intl';
import {Unit} from '@/app/types/Unit';
import {Button} from "@/app/ui/shadcn/button";
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/app/ui/shadcn/accordion";
import BasicInfoSection from "@/app/ui/UnitForm/BasicInfoSection";
import DescriptionSection from "@/app/ui/UnitForm/DescriptionSection";
import SidebarSection from "@/app/ui/UnitForm/SidebarSection";
import BottomSection from "@/app/ui/UnitForm/BottomSection";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/app/ui/shadcn/alert-dialog";

interface BaseUnitFormProps {
    initialData: Partial<Unit>;
    onSubmit: (updatedData: Unit) => void;
    onCancel: () => void;
    submitLabel: string;
    showDelete?: boolean;
    onDelete?: () => void;
    onChange?: (updatedData: Partial<Unit>) => void;
    isSmallScreen: boolean;
}

const BaseUnitForm: React.FC<BaseUnitFormProps> = ({
    initialData,
    onSubmit,
    onCancel,
    submitLabel,
    showDelete = false,
    onDelete,
    onChange,
    isSmallScreen,
}) => {
    const t = useTranslations('UnitForm');
    const [formData, setFormData] = useState<Unit>({...initialData} as Unit);

    const handleChange = (updates: Partial<Unit>) => {
        setFormData(prev => {
            const newData = {...prev, ...updates};
            onChange?.(newData);
            return newData;
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const handleDelete = () => {
        onDelete?.();
        onCancel(); // Close the form after deletion
    };

    const renderForm = () => (
        <>
            <BasicInfoSection unit={formData as Unit} onChange={handleChange}/>
            <DescriptionSection unit={formData as Unit} onChange={handleChange}/>
            <SidebarSection unit={formData as Unit} onChange={handleChange}/>
            <BottomSection unit={formData as Unit} onChange={handleChange}/>
        </>
    );

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {isSmallScreen ? (
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="basic-info">
                        <AccordionTrigger>{t('basicInfo')}</AccordionTrigger>
                        <AccordionContent>
                            <BasicInfoSection unit={formData as Unit} onChange={handleChange}/>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="description">
                        <AccordionTrigger>{t('descriptionSettings')}</AccordionTrigger>
                        <AccordionContent>
                            <DescriptionSection unit={formData as Unit} onChange={handleChange}/>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="sidebar">
                        <AccordionTrigger>{t('sidebarSettings')}</AccordionTrigger>
                        <AccordionContent>
                            <SidebarSection unit={formData as Unit} onChange={handleChange}/>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="bottom">
                        <AccordionTrigger>{t('bottomSettings')}</AccordionTrigger>
                        <AccordionContent>
                            <BottomSection unit={formData as Unit} onChange={handleChange}/>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            ) : (
                renderForm()
            )}
            <div
                className={`flex flex-col md:flex-row items-center justify-between mt-4 gap-2 
                pt-4 ${isSmallScreen ? '' : 'border-t'}`}>
                <Button type="submit" className="w-full md:w-auto">
                    {submitLabel}
                </Button>
                <Button type="button" onClick={onCancel} variant="outline" className="w-full md:w-auto">
                    {t('cancel')}
                </Button>
                {showDelete && onDelete && (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" className="w-full md:w-auto">
                                {t('delete')}
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>{t('deleteConfirmTitle')}</AlertDialogTitle>
                                <AlertDialogDescription>{t('deleteConfirmDescription')}</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDelete}>{t('delete')}</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
            </div>
        </form>
    );
};

export default BaseUnitForm;