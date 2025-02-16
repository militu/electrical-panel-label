// src/app/hooks/useSvgGeneration.ts

import { callGenerateFullSVG, callGenerateUnitSVG } from "@/app/api/apiSVG";
import { useSession } from "@/app/contexts/SessionContext";
import { Unit } from "@/app/types/Unit";
import { useCallback, useEffect, useState } from "react";

export function useSVGGeneration() {
  const { currentSession } = useSession();
  const [fullSVG, setFullSVG] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const generateUnitSVG = useCallback(
    async (unit: Unit) => {
      if (!currentSession?.globalSettings) return "";
      return callGenerateUnitSVG(unit, currentSession.globalSettings);
    },
    [currentSession?.globalSettings]
  );

  const generateAndSetFullSVG = useCallback(async () => {
    if (!currentSession?.rows || !currentSession?.globalSettings) return;
    setIsLoading(true);
    try {
      const svg = await callGenerateFullSVG(
        currentSession.rows,
        currentSession.globalSettings
      );
      setFullSVG(svg);
    } catch (error) {
      console.error("Error generating SVG:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentSession?.rows, currentSession?.globalSettings]);

  useEffect(() => {
    void generateAndSetFullSVG();
  }, [generateAndSetFullSVG]);

  return {
    generateUnitSVG,
    generateFullSVG: generateAndSetFullSVG,
    fullSVG,
    isLoading,
  };
}
