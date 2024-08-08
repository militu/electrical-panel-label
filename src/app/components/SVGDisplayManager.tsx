import React, {Suspense} from 'react';
import dynamic from 'next/dynamic';
import SkeletonLoader from "@/app/ui/SkeletonLoader";
import {useSVGGeneration} from "@/app/hooks/useSvgGeneration";

const SVGDisplay = dynamic(() => import('@/app/ui/SVGDisplay'), {
    loading: () => <SkeletonLoader/>,
})

const SVGDisplayManager: React.FC = () => {
    const {fullSVG, isLoading} = useSVGGeneration();

    if (isLoading) {
        return <SkeletonLoader/>;
    }

    return (
        <Suspense fallback={<SkeletonLoader/>}>
            <SVGDisplay svgContent={fullSVG}/>
        </Suspense>
    );
};

export default SVGDisplayManager;