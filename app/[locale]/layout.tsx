import { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import FloatingFaqButton from '@/components/floating-faq-button';
import Providers from '../providers';

export default async function LocaleLayout(props: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  const messages = await getMessages({ locale });
  if (locale !== 'es' && locale !== 'en') notFound();
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <Providers>
        <Navbar />
        <main className="min-h-screen">{props.children}</main>
        <FloatingFaqButton />
      </Providers>
      <Footer />
    </NextIntlClientProvider>
  );
}
