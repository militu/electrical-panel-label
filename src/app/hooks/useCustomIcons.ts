// src/app/hooks/useCustomIcons.ts

import { useCallback, useEffect, useState } from "react";
import {
  CustomIconError,
  customIconManager,
} from "../services/CustomIconManager";
import { CustomIcon } from "../services/SVGValidationService";

export interface UseCustomIconsResult {
  icons: CustomIcon[];
  isLoading: boolean;
  error: Error | null;
  addIcon: (icon: Omit<CustomIcon, "id" | "dateAdded">) => Promise<CustomIcon>;
  updateIcon: (id: string, updates: Partial<CustomIcon>) => Promise<CustomIcon>;
  deleteIcon: (id: string) => Promise<void>;
  refreshIcons: () => void;
}

export function useCustomIcons(): UseCustomIconsResult {
  const [icons, setIcons] = useState<CustomIcon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadIcons = useCallback(() => {
    try {
      const loadedIcons = customIconManager.getIcons();
      setIcons(loadedIcons);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load icons"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle storage events
  useEffect(() => {
    const handleStorageChange = () => {
      loadIcons();
    };

    window.addEventListener("custom-icons-changed", handleStorageChange);
    return () => {
      window.removeEventListener("custom-icons-changed", handleStorageChange);
    };
  }, [loadIcons]);

  // Initial load
  useEffect(() => {
    loadIcons();
  }, [loadIcons]);

  const addIcon = useCallback(
    async (icon: Omit<CustomIcon, "id" | "dateAdded">): Promise<CustomIcon> => {
      try {
        return customIconManager.addIcon(icon);
      } catch (err) {
        const error =
          err instanceof CustomIconError
            ? err
            : new Error("Failed to add icon");
        setError(error);
        throw error;
      }
    },
    []
  );

  const updateIcon = useCallback(
    async (id: string, updates: Partial<CustomIcon>): Promise<CustomIcon> => {
      try {
        return customIconManager.updateIcon(id, updates);
      } catch (err) {
        const error =
          err instanceof CustomIconError
            ? err
            : new Error("Failed to update icon");
        setError(error);
        throw error;
      }
    },
    []
  );

  const deleteIcon = useCallback(async (id: string): Promise<void> => {
    try {
      customIconManager.deleteIcon(id);
    } catch (err) {
      const error =
        err instanceof CustomIconError
          ? err
          : new Error("Failed to delete icon");
      setError(error);
      throw error;
    }
  }, []);

  return {
    icons,
    isLoading,
    error,
    addIcon,
    updateIcon,
    deleteIcon,
    refreshIcons: loadIcons,
  };
}
