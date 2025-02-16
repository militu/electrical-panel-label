// src/app/hooks/useTranslatedIconList.ts

import { builtInIcons } from "@/app/types/Icon";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useMemo } from "react";
import { useCustomIcons } from "./useCustomIcons";

export function useTranslatedIconList() {
  const t = useTranslations("Icons");
  const currentLocale = useLocale();
  const { icons: customIcons } = useCustomIcons();

  const translateBuiltInIcons = useCallback(() => {
    return builtInIcons.map((icon) => ({
      value: icon.value,
      label: t(icon.value),
      isCustom: false,
    }));
  }, [t]);

  const translateCustomIcons = useCallback(() => {
    return customIcons.map((icon) => ({
      value: icon.fileName,
      label: icon.translations[currentLocale as string] || icon.name,
      isCustom: true,
    }));
  }, [customIcons, currentLocale]);

  const allIcons = useMemo(() => {
    const translatedBuiltIn = translateBuiltInIcons();
    const translatedCustom = translateCustomIcons();

    return [...translatedBuiltIn, ...translatedCustom].sort((a, b) =>
      a.label.localeCompare(b.label, undefined, {
        sensitivity: "base",
        ignorePunctuation: true,
      })
    );
  }, [translateBuiltInIcons, translateCustomIcons]);

  return allIcons;
}
