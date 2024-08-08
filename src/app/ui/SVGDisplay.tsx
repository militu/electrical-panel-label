import React from 'react';
import {useTranslations} from 'next-intl';
import DownloadButton from "@/app/ui/DownloadButton";
import PrintButton from "@/app/ui/PrintButton";
import {useSession} from "@/app/contexts/SessionContext";

interface SVGDisplayProps {
    svgContent: string;
}

const SVGDisplay: React.FC<SVGDisplayProps> = React.memo(({svgContent}) => {
    const t = useTranslations('SVGDisplay');
    const {currentSession} = useSession();

    if (!svgContent) return null;

    return (
        <div className="mt-6 tour-svg-preview">
            <div className="flex flex-col md:flex-row justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold mb-2 md:mb-0">{t('generatedSVG')}</h2>
                <div className="flex gap-2">
                    <DownloadButton svgContent={svgContent} className="tour-download"/>
                    <PrintButton svgContent={svgContent} className="tour-print" config={{
                        PAGE_WIDTH: currentSession?.globalSettings.PAGE_WIDTH || 297,
                        PAGE_HEIGHT: currentSession?.globalSettings.PAGE_HEIGHT || 207
                    }}/>
                </div>
            </div>
            <div
                dangerouslySetInnerHTML={{__html: svgContent}}
                className="border p-4 rounded-lg overflow-auto bg-white"
            />
        </div>
    );
});

SVGDisplay.displayName = 'SVGDisplay';

export default SVGDisplay;