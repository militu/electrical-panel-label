import React, {Suspense, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useTranslations} from 'next-intl';
import dynamic from 'next/dynamic';
import SkeletonLoader from "@/app/ui/SkeletonLoader";
import {Button, buttonVariants} from "@/app/ui/shadcn/button";
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/app/ui/shadcn/accordion";
import {useSession} from "@/app/contexts/SessionContext";
import {toast} from "@/app/ui/shadcn/use-toast";
import {useSVGGeneration} from '@/app/hooks/useSvgGeneration';
import SVGDisplay from '@/app/ui/SVGDisplay';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from "@/app/ui/shadcn/alert-dialog";

const SCROLL_HEADROOM = 80; // pixels

const RowContainer = dynamic(() => import('@/app/ui/RowContainer'), {
    loading: () => <SkeletonLoader/>,
});

const PanelLayout: React.FC = () => {
    const t = useTranslations('PanelLayout');
    const {currentSession, addRow, duplicateRow, deleteRow} = useSession();
    const accordionRef = useRef<HTMLDivElement>(null);
    const [openItems, setOpenItems] = useState<string[]>(["row-0"]);
    const [latestModifiedRow, setLatestModifiedRow] = useState<number | null>(null);
    const {fullSVG, generateFullSVG} = useSVGGeneration();
    const [rowToDelete, setRowToDelete] = useState<number | null>(null);

    const updateSVG = useCallback(async () => {
        if (currentSession) {
            await generateFullSVG();
        }
    }, [currentSession, generateFullSVG]);

    useEffect(() => {
        if (latestModifiedRow !== null && accordionRef.current) {
            const newRowElement = accordionRef.current.querySelector(`[data-row-id="row-${latestModifiedRow}"]`);
            if (newRowElement) {
                setTimeout(() => {
                    const elementPosition = newRowElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.scrollY - SCROLL_HEADROOM;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });

                    setLatestModifiedRow(null);
                }, 500); // Small delay to ensure the DOM has updated
            }
        }
    }, [latestModifiedRow]);

    useEffect(() => {
        if (currentSession?.rows) {
            updateSVG();
        }
    }, [currentSession?.rows, currentSession?.globalSettings, updateSVG]);

    const rows = currentSession?.rows || [];

    const handleAddRow = useCallback(() => {
        addRow();
        const newRowIndex = currentSession?.rows.length ?? 0;
        setLatestModifiedRow(newRowIndex);
        setOpenItems(prev => [...prev, `row-${newRowIndex}`]);
        toast({
            title: t('toast.rowAdded'),
        });
        updateSVG();
    }, [addRow, currentSession?.rows.length, t, updateSVG]);

    const handleDuplicateRow = useCallback((rowIndex: number) => {
        duplicateRow(rowIndex);
        const newRowIndex = rowIndex + 1;
        setLatestModifiedRow(newRowIndex);
        setOpenItems(prev => [...prev, `row-${newRowIndex}`]);
        toast({
            title: t('toast.rowDuplicated'),
        });
        updateSVG();
    }, [duplicateRow, t, updateSVG]);

    const handleDeleteClick = useCallback((rowIndex: number) => {
        setRowToDelete(rowIndex);
    }, []);

    const handleConfirmDelete = useCallback(() => {
        if (rowToDelete !== null) {
            deleteRow(rowToDelete);
            setRowToDelete(null);
            toast({
                title: t('toast.rowDeleted'),
            });
        }
    }, [deleteRow, rowToDelete, t]);

    const rowContainers = useMemo(() => {
        return rows.map((row, rowIndex) => (
            <AccordionItem
                key={`row-${rowIndex}`}
                value={`row-${rowIndex}`}
                data-row-id={`row-${rowIndex}`}
            >
                <AccordionTrigger className={'font-bold text-lg'}>
                    {t('rowTitle', {index: rowIndex + 1})}
                </AccordionTrigger>
                <AccordionContent>
                    <div className="flex justify-end mb-2">
                        <div className="tour-session-management">
                            <Button onClick={() => handleDuplicateRow(rowIndex)} className="mr-2">
                                {t('duplicateRow')}
                            </Button>
                            <AlertDialog open={rowToDelete === rowIndex}
                                         onOpenChange={(open) => setRowToDelete(open ? rowIndex : null)}>
                                <AlertDialogTrigger asChild>
                                    <Button onClick={() => handleDeleteClick(rowIndex)} type="button"
                                            variant="destructive">{t('deleteRow')}</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>{t('deleteRowConfirmTitle')}</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            {t('deleteRowConfirmDescription')}
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel
                                            onClick={() => setRowToDelete(null)}>{t('cancelRowConfirm')}</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleConfirmDelete}
                                                           className={buttonVariants({variant: "destructive"})}>{t('deleteRow')}</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>
                    <RowContainer rowIndex={rowIndex} units={row} onUpdate={updateSVG}/>
                </AccordionContent>
            </AccordionItem>
        ));
    }, [rows, t, handleDuplicateRow, handleDeleteClick, handleConfirmDelete, rowToDelete, updateSVG]);

    if (!currentSession) {
        return (
            <div className="text-center p-4">
                <p className="text-xl font-semibold">{t('noActiveSession')}</p>
                <p className="mt-2">{t('createOrLoadSession')}</p>
            </div>
        );
    }

    return (
        <div className={`rounded-xl shadow-lg p-4 md:p-6 mb-8 tour-panel-layout`}>
            <h2 className="text-2xl font-semibold mb-4">{t('title')}</h2>
            <Accordion
                type="multiple"
                value={openItems}
                onValueChange={setOpenItems}
                className="space-y-4"
                ref={accordionRef}
            >
                <Suspense fallback={<SkeletonLoader/>}>
                    {rowContainers}
                </Suspense>
            </Accordion>
            <Button onClick={handleAddRow} className="mt-6 w-full tour-add-row">
                {t('addRow')}
            </Button>
            <SVGDisplay svgContent={fullSVG}/>
        </div>
    );
};

export default PanelLayout;