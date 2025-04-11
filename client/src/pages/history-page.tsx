import React from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet';

export default function HistoryPage() {
  const { t } = useTranslation();
  
  // Company timeline events
  const timeline = [
    {
      year: '2020',
      title: t('history.timeline.founding'),
      description: 'AeroTracker was founded with a mission to revolutionize flight tracking for aviation professionals and enthusiasts.',
      icon: '🚀'
    },
    {
      year: '2021',
      title: t('history.timeline.firstRelease'),
      description: 'The first version of AeroTracker was released, featuring basic flight tracking and airport information.',
      icon: '✈️'
    },
    {
      year: '2022',
      title: t('history.timeline.majorUpdate'),
      description: 'Major platform update with advanced filtering, clustering, and weather overlays.',
      icon: '⚡'
    },
    {
      year: '2023',
      title: t('history.timeline.globalExpansion'),
      description: 'Global expansion with multilingual support and partnerships with major aviation data providers.',
      icon: '🌎'
    },
    {
      year: '2024',
      title: t('history.timeline.aiIntegration'),
      description: 'Integration of artificial intelligence for route optimization and predictive analytics.',
      icon: '🧠'
    },
    {
      year: '2025',
      title: t('history.timeline.present'),
      description: 'Continued innovation and development to maintain position as the industry-leading flight tracking platform.',
      icon: '🏆'
    }
  ];
  
  // Team members
  const team = [
    {
      name: 'Alex Reynolds',
      title: 'CEO & Founder',
      bio: 'Former airline pilot with 20+ years of aviation experience and a passion for technology.'
    },
    {
      name: 'Sophia Chen',
      title: 'CTO',
      bio: 'Computer science PhD with expertise in real-time data processing and geospatial visualization.'
    },
    {
      name: 'Marcus Johnson',
      title: 'Head of Data Engineering',
      bio: 'Expert in big data systems and cloud infrastructure with a background in aerospace engineering.'
    },
    {
      name: 'Olivia Patel',
      title: 'UX Design Lead',
      bio: 'Award-winning designer focused on creating intuitive interfaces for complex data visualization.'
    }
  ];

  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <Helmet>
        <title>{t('history.title')} | AeroTracker</title>
        <meta name="description" content="The history and journey of AeroTracker from founding to becoming an industry leader in flight tracking technology." />
      </Helmet>
      
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-2 text-center luxury-heading">
          {t('history.title')}
        </h1>
        <p className="text-xl text-center text-muted-foreground mb-12">
          {t('history.subtitle')}
        </p>
        
        {/* Timeline section */}
        <div className="mb-20">
          <h2 className="text-2xl font-semibold mb-8 luxury-subheading">
            Our Journey
          </h2>
          
          <div className="relative border-l-2 border-primary/30 pl-10 ml-6">
            {timeline.map((event, index) => (
              <div key={index} className="mb-12 relative">
                <div className="absolute -left-[3.25rem] flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-[#003a65] to-[#4995fd] text-white">
                  <span className="text-lg">{event.icon}</span>
                </div>
                <div className="glass-effect p-6 rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">{event.year}</div>
                  <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
                  <p className="text-muted-foreground">{event.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Team section */}
        <div className="mb-20">
          <h2 className="text-2xl font-semibold mb-8 luxury-subheading">
            {t('about.team')}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {team.map((member, index) => (
              <div key={index} className="luxury-card p-6">
                <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                <div className="text-primary font-medium mb-2">{member.title}</div>
                <p className="text-muted-foreground">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Mission section */}
        <div className="mb-20">
          <h2 className="text-2xl font-semibold mb-6 luxury-subheading">
            {t('about.mission')}
          </h2>
          
          <div className="luxury-section p-8">
            <blockquote className="text-lg italic border-l-4 border-primary pl-6 py-2">
              {t('about.missionText')}
            </blockquote>
          </div>
        </div>
        
        {/* Testimonials */}
        <div>
          <h2 className="text-2xl font-semibold mb-8 luxury-subheading">
            What Our Users Say
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="luxury-card p-6">
              <p className="italic mb-4">"AeroTracker has transformed how our airline manages flight operations. The real-time data and analytics have become an essential part of our daily workflow."</p>
              <div className="font-semibold">James Wilson</div>
              <div className="text-muted-foreground text-sm">Chief Operations Officer, Pacific Airways</div>
            </div>
            
            <div className="luxury-card p-6">
              <p className="italic mb-4">"As a private pilot, the route optimization features have helped me plan more efficient flights and save on fuel costs. The interface is intuitive and packed with useful information."</p>
              <div className="font-semibold">Maria Rodriguez</div>
              <div className="text-muted-foreground text-sm">Private Pilot & Flight Instructor</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}