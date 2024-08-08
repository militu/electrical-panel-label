import React from 'react';
import {useTranslations} from 'next-intl';
import {Button} from "@/app/ui/shadcn/button";

type DownloadButtonProps = {
    svgContent: string;
    className?: string;
};

const DownloadButton: React.FC<DownloadButtonProps> = React.memo(({svgContent, className}) => {
    const t = useTranslations('DownloadButton');

    const handleDownload = React.useCallback(() => {
        if (!svgContent) {
            alert(t('noContent'));
            return;
        }

        const blob = new Blob([svgContent], {type: 'image/svg+xml'});
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = 'electrical_panel_label.svg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);
    }, [svgContent, t]);

    if (!svgContent) {
        return null;
    }

    return (
        <Button
            onClick={handleDownload}
            className={className}
        >
            {t('downloadSVG')}
        </Button>
    );
});

DownloadButton.displayName = 'DownloadButton';

export default DownloadButton;