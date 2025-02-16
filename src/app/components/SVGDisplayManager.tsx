import { useSVGGeneration } from "@/app/hooks/useSvgGeneration";
import SkeletonLoader from "@/app/ui/SkeletonLoader";
import dynamic from "next/dynamic";
import React, { Suspense } from "react";

const SVGDisplay = dynamic(() => import("@/app/ui/SVGDisplay"), {
  loading: () => <SkeletonLoader />,
});

const SVGDisplayManager: React.FC = () => {
  const { fullSVG, isLoading } = useSVGGeneration();

  if (isLoading) {
    return <SkeletonLoader />;
  }

  return (
    <Suspense fallback={<SkeletonLoader />}>
      <SVGDisplay svgContent={fullSVG} />
    </Suspense>
  );
};

export default SVGDisplayManager;
