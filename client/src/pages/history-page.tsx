import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { History, Award, Globe, Target, Cpu, UsersRound } from 'lucide-react';
import Header from '@/components/Header';

export default function HistoryPage() {
  const { t } = useTranslation();
  
  // Timeline data with dates and key milestones
  const timeline = [
    {
      year: '2020',
      title: t('history.timeline.founding'),
      description: 'The founding team of aviation enthusiasts and software engineers came together to build a better flight tracking platform.',
      icon: <History className="h-8 w-8 text-blue-600" />
    },
    {
      year: '2021',
      title: t('history.timeline.firstRelease'),
      description: 'The first version of AeroTracker was released, offering basic flight tracking capabilities.',
      icon: <Award className="h-8 w-8 text-blue-600" />
    },
    {
      year: '2022',
      title: t('history.timeline.majorUpdate'),
      description: 'Major platform update with enhanced UI, additional data sources, and advanced filtering.',
      icon: <Target className="h-8 w-8 text-blue-600" />
    },
    {
      year: '2023',
      title: t('history.timeline.globalExpansion'),
      description: 'Expanded global coverage with additional data sources and partnerships with international aviation organizations.',
      icon: <Globe className="h-8 w-8 text-blue-600" />
    },
    {
      year: '2024',
      title: t('history.timeline.aiIntegration'),
      description: 'Integration of AI-powered features for flight prediction, route optimization, and advanced analytics.',
      icon: <Cpu className="h-8 w-8 text-blue-600" />
    },
    {
      year: '2025',
      title: t('history.timeline.present'),
      description: 'AeroTracker becomes the leading flight tracking platform with millions of users worldwide.',
      icon: <UsersRound className="h-8 w-8 text-blue-600" />
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-16">
        {/* Hero section */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t('history.title')}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            {t('history.subtitle')}
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Center line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-blue-200 dark:bg-blue-900"></div>
          
          {/* Timeline items */}
          <div className="space-y-12">
            {timeline.map((item, index) => (
              <motion.div 
                key={index}
                className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className={`w-1/2 ${index % 2 === 0 ? 'pr-16 text-right' : 'pl-16'}`}>
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                    <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 block mb-1">
                      {item.year}
                    </span>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {item.description}
                    </p>
                  </div>
                </div>
                
                <div className="z-10 flex items-center justify-center w-12 h-12 rounded-full bg-white dark:bg-gray-800 border-4 border-blue-500 shadow">
                  {item.icon}
                </div>
                
                <div className="w-1/2"></div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Mission section */}
        <motion.div 
          className="mt-24 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md border border-gray-200 dark:border-gray-700"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            {t('about.mission')}
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
            {t('about.missionText')}
          </p>
        </motion.div>
      </div>
    </div>
  );
}