import React, {useState} from 'react';
import {GlobalSettings} from '@/app/types/GlobalSettings';
import {Button, buttonVariants} from '@/app/ui/shadcn/button';
import {Input} from '@/app/ui/shadcn/input';
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
import {Label} from "@/app/ui/shadcn/label";
import {Info, X} from "lucide-react";
import {useTranslations} from 'next-intl';
import {toast} from "@/app/ui/shadcn/use-toast";

interface GlobalSettingsFormProps {
    settings: GlobalSettings;
    onSave: (settings: GlobalSettings) => void;
    onReset: () => GlobalSettings;
}

export default function GlobalSettingsForm({settings, onSave, onReset}: GlobalSettingsFormProps) {
    const t = useTranslations('GlobalSettingsForm');
    const [formSettings, setFormSettings] = useState<GlobalSettings>(settings);
    const [showResetDialog, setShowResetDialog] = useState(false);
    const [tooltipVisibility, setTooltipVisibility] = useState<{ [key: string]: boolean }>({});

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value, type} = e.target;
        setFormSettings(prev => ({
            ...prev,
            [name]: type === 'color' ? value : Number(value)
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formSettings);
    };

    const handleReset = () => {
        const resetSettings = onReset();
        setFormSettings(resetSettings);
        setShowResetDialog(false);
        toast({
          title: t('toast.resetConfirmationTitle'),
          description: t('toast.resetConfirmationDescription'),
        })
    };

    const toggleTooltip = (id: string) => {
        setTooltipVisibility(prev => ({...prev, [id]: !prev[id]}));
    };

    const renderInputField = (
        id: string,
        label: string,
        value: number | string,
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
        tooltip: string,
        type: string = "number"
    ) => {
        return (
            <div className="space-y-2">
                <div className="flex items-center">
                    <Label htmlFor={id} className="w-1/3 text-sm font-medium">{label}</Label>
                    <div className="w-2/3 flex items-center">
                        <Input
                            id={id}
                            name={id}
                            type={type}
                            value={type === 'color' ? String(value) : value}
                            onChange={onChange}
                            className={`w-full ${type === 'color' ? 'h-10' : ''}`}
                        />
                        <button
                            type="button"
                            className="ml-2 p-1 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                toggleTooltip(id);
                            }}
                        >
                            {tooltipVisibility[id] ? <X size={16}/> : <Info size={16}/>}
                        </button>
                    </div>
                </div>
                {tooltipVisibility[id] && (
                    <div className="ml-1/3 pl-2 text-sm bg-primary text-secondary p-2 rounded">
                        {tooltip}
                    </div>
                )}
            </div>
        );
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 p-6">
            <h2 className="text-2xl font-bold mb-6">{t('title')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                    <h3 className="text-xl font-semibold mb-4">{t('unitSettings')}</h3>
                    <div className="space-y-4">
                        {renderInputField("UNIT_HEIGHT", t('unitHeight'), formSettings.UNIT_HEIGHT, handleInputChange, t('unitHeightTooltip'))}
                        {renderInputField("UNIT_WIDTH", t('unitWidth'), formSettings.UNIT_WIDTH, handleInputChange, t('unitWidthTooltip'))}
                        {renderInputField("TOP_COLOR", t('topColor'), formSettings.TOP_COLOR, handleInputChange, t('topColorTooltip'), "color")}
                    </div>
                </div>
                <div>
                    <h3 className="text-xl font-semibold mb-4">{t('dimensions')}</h3>
                    <div className="space-y-4">
                        {renderInputField("PAGE_WIDTH", t('pageWidth'), formSettings.PAGE_WIDTH, handleInputChange, t('pageWidthTooltip'))}
                        {renderInputField("PAGE_HEIGHT", t('pageHeight'), formSettings.PAGE_HEIGHT, handleInputChange, t('pageHeightTooltip'))}
                    </div>
                </div>
                <div>
                    <h3 className="text-xl font-semibold mb-4">{t('layoutSettings')}</h3>
                    <div className="space-y-4">
                        {renderInputField("BORDER_MARGIN", t('borderMargin'), formSettings.BORDER_MARGIN, handleInputChange, t('borderMarginTooltip'))}
                        {renderInputField("CROSS_SIZE", t('crossSize'), formSettings.CROSS_SIZE, handleInputChange, t('crossSizeTooltip'))}
                    </div>
                </div>
            </div>
            <div className="flex space-x-2 justify-end">
                <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
                    <AlertDialogTrigger asChild>
                        <Button type="button" variant="destructive">{t('resetToDefault')}</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>{t('resetConfirmTitle')}</AlertDialogTitle>
                            <AlertDialogDescription>
                                {t('resetConfirmDescription')}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                            <AlertDialogAction onClick={handleReset}
                                               className={buttonVariants({variant: "destructive"})}>{t('reset')}</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
                <Button type="submit">{t('saveChanges')}</Button>
            </div>
        </form>
    );
}