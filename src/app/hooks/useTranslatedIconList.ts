// src/app/hooks/useTranslatedIconList.ts

import { CustomIconStorage } from "@/app/services/SVGValidationService";
import { builtInIcons, Icon, IconName } from "@/app/types/Icon";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";

// Create a single instance outside the hook
const iconStorage = new CustomIconStorage();

export const useTranslatedIconList = () => {
  const t = useTranslations("Icons");
  const currentLocale = useLocale();
  const [allIcons, setAllIcons] = useState<Icon[]>([]);

  const updateIcons = useCallback(() => {
    // Translate built-in icons
    const translatedBuiltIn = builtInIcons.map((icon) => ({
      value: icon.value,
      label: t(icon.value as IconName),
      isCustom: false,
    }));

    // Get custom icons
    const customIcons = iconStorage.getCustomIcons().map((icon) => ({
      value: icon.fileName,
      label: icon.translations[currentLocale as string] || icon.name,
      isCustom: true,
    }));

    // Combine and sort all icons
    setAllIcons(
      [...translatedBuiltIn, ...customIcons].sort((a, b) =>
        a.label.localeCompare(b.label, undefined, {
          sensitivity: "base",
          ignorePunctuation: true,
        })
      )
    );
  }, [t, currentLocale]);

  useEffect(() => {
    // Initial update
    updateIcons();

    // Add event listener for custom icon changes
    window.addEventListener("custom-icons-changed", updateIcons);

    // Cleanup
    return () => {
      window.removeEventListener("custom-icons-changed", updateIcons);
    };
  }, [updateIcons]);

  return allIcons;
};
