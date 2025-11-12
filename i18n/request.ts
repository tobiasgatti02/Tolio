import { getRequestConfig } from 'next-intl/server';

const supportedLocales = ['es', 'en'];

export default getRequestConfig(async ({ locale }) => {
  const safeLocale = supportedLocales.includes(locale) ? locale : 'es';
  const messages = (await import(`../messages/${safeLocale}/common.json`)).default;
  return {
    locale: safeLocale,
    messages: {
      common: messages
    }
  };
});
