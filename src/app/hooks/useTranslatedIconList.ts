import {useTranslations} from 'next-intl';
import {iconList} from '@/app/types/Icon';

export const useTranslatedIconList = () => {
    const t = useTranslations('Icons');

    return iconList.map((icon) => ({
        value: icon,
        label: t(icon)
    }));
};