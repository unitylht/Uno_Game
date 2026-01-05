import i18nConfig from "~/i18n";

export default function getBaseUrl() {
  const segments = (typeof window !== "undefined"
    ? window.location.pathname.split("/")
    : []
  ).filter(Boolean);
  const supportedLocales = i18nConfig.locales || [];
  const lang = supportedLocales.includes(segments[0])
    ? segments[0]
    : i18nConfig.defaultLocale;

  return `${window.location.protocol}//${window.location.host}/${lang}`;
}
