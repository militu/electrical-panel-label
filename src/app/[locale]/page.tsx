'use client'

import React, {Suspense} from 'react';
import {useSession} from '@/app/contexts/SessionContext';
import TourGuide from "@/app/components/TourGuide";
import {useTranslations} from "next-intl";
import GlobalSettingsManager from "@/app/components/GlobalSettingsManager";
import SkeletonLoader from "@/app/ui/SkeletonLoader";
import dynamic from "next/dynamic";
import Management from "@/components/Management";

const DynamicPanelLayout = dynamic(() => import("@/app/components/PanelLayout"), {
    loading: () => <SkeletonLoader/>,
    ssr: false
});

const HomePage: React.FC = () => {
    const {currentSession} = useSession();
    const [showGlobalSettings, setShowGlobalSettings] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(true);

    const t = useTranslations('HomePage');
    React.useEffect(() => {
        setIsLoading(false);
    }, []);

    if (isLoading) {
        return <div>Loading...</div>;
    }
    if (!currentSession) {
        return <Management/>;
    }

    const handleOpenGlobalSettings = () => setShowGlobalSettings(true);
    const handleCloseGlobalSettings = () => setShowGlobalSettings(false);


    return (
        <div className="container mx-auto px-4 py-8">
            <div className="text-center bg-gradient rounded-2xl mb-8 tour-start">
                <div className="pl-8 pr-8 pt-8">
                    <h1 className="text-2xl md:text-4xl font-bold mb-6">{t('welcomeMessage')}</h1>
                    <p className="text-lg mb-4">{t('welcomeSubMessage')}</p>
                    <ul className="list-disc list-inside text-left max-w-2xl mx-auto mb-6">
                        <li>{t('features.rows')}</li>
                        <li>{t('features.customize')}</li>
                        <li>{t('features.dragDrop')}</li>
                        <li>{t('features.sessions')}</li>
                        <li>{t('features.generate')}</li>
                    </ul>
                    <p className="text-lg ">{t('tourPrompt')}</p>
                </div>
                <div className="flex flex-col sm:flex-row justify-center gap-4 p-4 mb-8">
                    <div className="w-full sm:w-auto">
                        <TourGuide/>
                    </div>
                    <div className="w-full sm:w-auto">
                        <GlobalSettingsManager
                            isOpen={showGlobalSettings}
                            onOpen={handleOpenGlobalSettings}
                            onClose={handleCloseGlobalSettings}
                        />
                    </div>
                </div>
            </div>
            <Management/>
            <Suspense fallback={<SkeletonLoader/>}>
                <DynamicPanelLayout/>
            </Suspense>
        </div>
    );
};

export default HomePage;