export enum Locale {
  EN = "en",
  FR = "fr",
}

export const locales = Object.values(Locale);

export const localeNames: Record<Locale, string> = {
  [Locale.EN]: "English",
  [Locale.FR]: "Français",
};

export const localeFlags: Record<Locale, string> = {
  [Locale.EN]: "🇬🇧",
  [Locale.FR]: "🇫🇷",
};
