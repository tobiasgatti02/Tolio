import { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import Providers from '../providers';

export default async function LocaleLayout(props: {
  children: ReactNode;
  params: { locale: string };
}) {
  const locale = (await props.params).locale;
  const messages = await getMessages();
  if (locale !== 'es' && locale !== 'en') notFound();
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <Providers>
        <Navbar />
        <main className="min-h-screen">{props.children}</main>
      </Providers>
      <Footer />
    </NextIntlClientProvider>
  );
}
