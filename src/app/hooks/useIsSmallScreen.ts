import {useEffect, useState} from 'react';

export function useIsSmallScreen(breakpoint: number = 1024) {
    const [isSmallScreen, setIsSmallScreen] = useState(false);

    useEffect(() => {
        const checkScreenSize = () => {
            setIsSmallScreen(window.innerWidth < breakpoint);
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);

        return () => window.removeEventListener('resize', checkScreenSize);
    }, [breakpoint]);

    return isSmallScreen;
}