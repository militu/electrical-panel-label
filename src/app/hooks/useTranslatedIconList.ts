import { builtInIcons, IconName } from "@/app/types/Icon";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useMemo } from "react";
import { useCustomIcons } from "./useCustomIcons";

// Define a type for built-in icons
interface BuiltInIcon {
  value: IconName;
  label: string;
  isCustom: false;
}

//Define a type for Custom Icons
interface CustomIconTranslated {
  value: string;
  label: string;
  isCustom: true;
  dataUrl: string;
}

// Define a union type for all icons
type TranslatedIcon = BuiltInIcon | CustomIconTranslated;

export function useTranslatedIconList() {
  const t = useTranslations("Icons");
  const currentLocale = useLocale();
  const { icons: customIcons } = useCustomIcons();

  const translateBuiltInIcons = useCallback((): BuiltInIcon[] => {
    return builtInIcons.map((icon) => ({
      value: icon.value,
      label: t(icon.value),
      isCustom: false,
    }));
  }, [t]);

  const translateCustomIcons = useCallback((): CustomIconTranslated[] => {
    return customIcons.map((icon) => ({
      value: icon.id,
      label: icon.translations[currentLocale as string] || icon.name,
      isCustom: true,
      dataUrl: icon.dataUrl,
    }));
  }, [customIcons, currentLocale]);

  const allIcons = useMemo((): TranslatedIcon[] => {
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
