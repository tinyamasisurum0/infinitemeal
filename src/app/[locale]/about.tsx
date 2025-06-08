import { useTranslations } from 'next-intl';
import React from 'react';

const AboutUs: React.FC = () => {
  const t = useTranslations('about');

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">{t('title')}</h1>
      <p className="text-lg">{t('description')}</p>
    </div>
  );
};

export default AboutUs; 