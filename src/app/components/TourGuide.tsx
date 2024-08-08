import React, {useCallback, useEffect, useState} from 'react';
import {useTranslations} from "next-intl";
import {STATUS, Step} from "react-joyride";
import ClientOnlyJoyride from "@/app/ui/ClientOnlyJoyride";
import {Button} from "@/app/ui/shadcn/button";

const TourGuide: React.FC = () => {
    const [runTour, setRunTour] = useState(false);
    const t = useTranslations('TourGuide');

    useEffect(() => {
        // Add a CSS rule for smooth scrolling with acceleration
        document.body.style.scrollBehavior = 'smooth';
        return () => {
            document.body.style.scrollBehavior = '';
        };
    }, []);

    const handleJoyrideCallback = useCallback((data: any) => {
        const {status} = data;
        if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
            setRunTour(false);
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });

        }
    }, []);

    const steps: Step[] = [
        {
            target: '.tour-start',
            content: t('steps.welcome'),
            disableBeacon: true,
        },
        {
            target: '.tour-global-settings',
            content: t('steps.globalSettings'),
        },
        {
            target: '.tour-sessions',
            content: t('steps.sessions'),
        },
        {
            target: '.tour-project-management',
            content: t('steps.projectManagement'),
        },
        {
            target: '.tour-panel-layout',
            content: t('steps.panelLayout'),
        },
        {
            target: '.tour-unit-add-customization',
            content: t('steps.unitAddCustomization'),
        },
        {
            target: '.tour-unit-management',
            content: t('steps.unitManagement'),
        },
        {
            target: '.tour-unit-management-buttons',
            content: t('steps.unitManagementButtons'),
        },
        {
            target: '.tour-session-management',
            content: t('steps.RowManagement'),
        },
        {
            target: '.tour-add-row',
            content: t('steps.addRow'),
        },
        {
            target: '.tour-svg-preview',
            content: t('steps.svgPreview'),
        },
        {
            target: '.tour-download',
            content: t('steps.download'),
        },
        {
            target: '.tour-print',
            content: t('steps.print'),
        },
    ];

    return (
        <>
            <ClientOnlyJoyride
                steps={steps}
                run={runTour}
                callback={handleJoyrideCallback}
            />
            <Button onClick={() => setRunTour(true)} className="w-full tour-start">
                {t('startTour')}
            </Button>
        </>
    );
};

export default TourGuide;