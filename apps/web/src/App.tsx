import React, { useState } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { AppsShowcase } from './components/AppsShowcase';
import { DownloadCenter } from './components/DownloadCenter';
import { Footer } from './components/Footer';
import { sounds } from './sound';

function MainLayout() {
  const [isMuted, setIsMuted] = useState(false);

  const toggleSound = () => {
    const nextState = !isMuted;
    setIsMuted(nextState);
    sounds.setMuted(nextState);
    if (!nextState) {
      sounds.playPop();
    }
  };

  return (
    <div className="min-h-screen bg-[#121319] text-gray-100 flex flex-col antialiased selection:bg-cat-primary/30 selection:text-cat-fur">
      {/* Top sticky navigation bar */}
      <Navbar isMuted={isMuted} onToggleSound={toggleSound} />

      {/* Main content body */}
      <main className="flex-1">
        <Hero />
        <AppsShowcase />
        <DownloadCenter />
      </main>

      {/* Site footer */}
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <MainLayout />
    </LanguageProvider>
  );
}
