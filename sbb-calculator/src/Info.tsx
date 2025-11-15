import React from 'react';
import { Link } from 'react-router-dom';
import { Calculator, Train, Globe, MapPin, Star, ChevronLeft } from 'lucide-react';
import { Language } from './translations';
import { useInfoTranslation } from './infoTranslations';

interface InfoProps {
  language: Language;
}

const Info: React.FC<InfoProps> = ({ language }) => {
  const { t } = useInfoTranslation(language);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/"
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4 transition-colors"
          >
            <ChevronLeft size={20} className="mr-1" />
            {t('backToCalculator')}
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('aboutTitle')}
          </h1>
          <p className="text-xl text-gray-600">
            {t('aboutSubtitle')}
          </p>
        </div>

        {/* Main Content */}
        <div className="grid gap-8">
          {/* How it Works */}
          <section className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center mb-4">
              <Train className="text-green-600 mr-3" size={24} />
              <h2 className="text-2xl font-semibold text-gray-900">
                {t('howItWorksTitle')}
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <MapPin className="text-blue-600" size={20} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{t('step1Title')}</h3>
                <p className="text-gray-600 text-sm">{t('step1Description')}</p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <Calculator className="text-green-600" size={20} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{t('step2Title')}</h3>
                <p className="text-gray-600 text-sm">{t('step2Description')}</p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <Star className="text-purple-600" size={20} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{t('step3Title')}</h3>
                <p className="text-gray-600 text-sm">{t('step3Description')}</p>
              </div>
            </div>
          </section>

          {/* What is Travelcards.ch */}
          <section className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center mb-4">
              <Calculator className="text-blue-600 mr-3" size={24} />
              <h2 className="text-2xl font-semibold text-gray-900">
                {t('whatIsTitle')}
              </h2>
            </div>
            <div className="text-gray-700 space-y-4">
              <p>{t('whatIsPara1')}</p>
              <p>{t('whatIsPara2')}</p>
            </div>
          </section>

          {/* Features */}
          <section className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center mb-4">
              <Globe className="text-indigo-600 mr-3" size={24} />
              <h2 className="text-2xl font-semibold text-gray-900">
                {t('featuresTitle')}
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">{t('comprehensiveTitle')}</h3>
                <ul className="text-gray-700 space-y-2 text-sm">
                  <li>• {t('comprehensivePoint1')}</li>
                  <li>• {t('comprehensivePoint2')}</li>
                  <li>• {t('comprehensivePoint3')}</li>
                  <li>• {t('comprehensivePoint4')}</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">{t('userFriendlyTitle')}</h3>
                <ul className="text-gray-700 space-y-2 text-sm">
                  <li>• {t('userFriendlyPoint1')}</li>
                  <li>• {t('userFriendlyPoint2')}</li>
                  <li>• {t('userFriendlyPoint3')}</li>
                  <li>• {t('userFriendlyPoint4')}</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">{t('accurateTitle')}</h3>
                <ul className="text-gray-700 space-y-2 text-sm">
                  <li>• {t('accuratePoint1')}</li>
                  <li>• {t('accuratePoint2')}</li>
                  <li>• {t('accuratePoint3')}</li>
                  <li>• {t('accuratePoint4')}</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">{t('freeTitle')}</h3>
                <ul className="text-gray-700 space-y-2 text-sm">
                  <li>• {t('freePoint1')}</li>
                  <li>• {t('freePoint2')}</li>
                  <li>• {t('freePoint3')}</li>
                  <li>• {t('freePoint4')}</li>
                </ul>
              </div>
            </div>
          </section>

          {/* About Switzerland Transport */}
          <section className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {t('swissTransportTitle')}
            </h2>
            <div className="text-gray-700 space-y-4">
              <p>{t('swissTransportPara1')}</p>
              <p>{t('swissTransportPara2')}</p>
              <div className="bg-blue-50 rounded-lg p-4 mt-4">
                <h3 className="font-semibold text-gray-900 mb-2">{t('keyFactsTitle')}</h3>
                <ul className="text-gray-700 space-y-1 text-sm">
                  <li>• {t('keyFact1')}</li>
                  <li>• {t('keyFact2')}</li>
                  <li>• {t('keyFact3')}</li>
                  <li>• {t('keyFact4')}</li>
                  <li>• {t('keyFact5')}</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Footer */}
          <section className="text-center py-8">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t('ctaTitle')}
              </h3>
              <p className="text-gray-600 mb-4">
                {t('ctaDescription')}
              </p>
              <Link
                to="/"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                {t('ctaButton')}
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Info;