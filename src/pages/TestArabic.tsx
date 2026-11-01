import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const TestArabic = () => {
  const { t, language, setLanguage, isRTL } = useLanguage();

  return (
    <div className={`min-h-screen bg-background p-8 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-center gap-4 mb-8">
          <Button 
            onClick={() => setLanguage('en')}
            variant={language === 'en' ? 'default' : 'outline'}
          >
            English
          </Button>
          <Button 
            onClick={() => setLanguage('ar')}
            variant={language === 'ar' ? 'default' : 'outline'}
          >
            العربية
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.personalInfo')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  {t('checkout.firstName')}
                </label>
                <input className="w-full p-2 border rounded" placeholder={t('checkout.firstName')} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  {t('checkout.lastName')}
                </label>
                <input className="w-full p-2 border rounded" placeholder={t('checkout.lastName')} />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                {t('checkout.emailAddress')}
              </label>
              <input className="w-full p-2 border rounded" placeholder={t('checkout.emailAddress')} />
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">{t('dashboard.overview')}</h3>
              <p>{t('dashboard.totalBookings')}: 5</p>
              <p>{t('dashboard.activeBookings')}: 3</p>
              <p>{t('dashboard.totalSpent')}: $1,200</p>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">{t('checkout.paymentMethod')}</h3>
              <ul className="space-y-1">
                <li>• {t('checkout.payAtProperty')}</li>
                <li>• {t('checkout.bankTransfer')}</li>
                <li>• {t('checkout.creditCard')}</li>
              </ul>
            </div>

            <div className="flex gap-4">
              <Button>{t('common.save')}</Button>
              <Button variant="outline">{t('common.cancel')}</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TestArabic;