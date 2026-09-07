import React, { useState } from 'react';
import { NekoDropDemo } from './demos/NekoDropDemo';
import { NekoPunchDemo } from './demos/NekoPunchDemo';
import { BongoFormatDemo } from './demos/BongoFormatDemo';
import { PurrFocusDemo } from './demos/PurrFocusDemo';
import { sounds } from '../sound';
import { useLanguage } from '../context/LanguageContext';

type AppKey = 'neko-drop' | 'neko-punch' | 'bongo-format' | 'purr-focus';

export const AppsShowcase: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<AppKey>('neko-drop');

  const handleTabChange = (key: AppKey) => {
    sounds.playPop();
    setActiveTab(key);
  };

  const tabs = [
    {
      key: 'neko-drop' as const,
      number: '01',
      name: t.apps.tabs.nekoDrop.name,
      badge: t.apps.tabs.nekoDrop.badge,
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      icon: '🐟',
      tagline: t.apps.tabs.nekoDrop.tagline,
    },
    {
      key: 'neko-punch' as const,
      number: '02',
      name: t.apps.tabs.nekoPunch.name,
      badge: t.apps.tabs.nekoPunch.badge,
      badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      icon: '🥊',
      tagline: t.apps.tabs.nekoPunch.tagline,
    },
    {
      key: 'bongo-format' as const,
      number: '03',
      name: t.apps.tabs.bongoFormat.name,
      badge: t.apps.tabs.bongoFormat.badge,
      badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      icon: '🎹',
      tagline: t.apps.tabs.bongoFormat.tagline,
    },
    {
      key: 'purr-focus' as const,
      number: '04',
      name: t.apps.tabs.purrFocus.name,
      badge: t.apps.tabs.purrFocus.badge,
      badgeColor: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
      icon: '🍞',
      tagline: t.apps.tabs.purrFocus.tagline,
    },
  ];

  return (
    <section id="apps" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs font-bold uppercase tracking-widest text-cat-primary mb-2">
            {t.apps.headerBadge}
          </h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-white">
            {t.apps.headerTitle}
          </p>
          <p className="text-sm text-gray-400 mt-3">
            {t.apps.headerDesc}
          </p>
        </div>

        {/* 4 App Tabs Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {tabs.map((app) => {
            const isActive = activeTab === app.key;
            return (
              <button
                key={app.key}
                onClick={() => handleTabChange(app.key)}
                className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden ${
                  isActive
                    ? 'bg-cat-card border-cat-primary shadow-lg shadow-cat-primary/10'
                    : 'bg-cat-card/40 hover:bg-cat-cardHover/80 border-cat-border/80 opacity-80 hover:opacity-100'
                }`}
              >
                {isActive && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cat-primary to-cat-accent" />
                )}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{app.icon}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${app.badgeColor}`}>
                    {app.badge}
                  </span>
                </div>
                <div className="text-xs font-mono text-gray-500 font-semibold">{app.number}</div>
                <div className="text-base font-bold text-white mt-0.5">{app.name}</div>
                <div className="text-xs text-gray-400 mt-1 truncate">{app.tagline}</div>
              </button>
            );
          })}
        </div>

        {/* Active Demo Panel */}
        <div className="rounded-3xl glass-panel p-6 sm:p-8">
          {activeTab === 'neko-drop' && <NekoDropDemo />}
          {activeTab === 'neko-punch' && <NekoPunchDemo />}
          {activeTab === 'bongo-format' && <BongoFormatDemo />}
          {activeTab === 'purr-focus' && <PurrFocusDemo />}
        </div>
      </div>
    </section>
  );
};
