import React from 'react';
import HeroSection from '../components/home/HeroSection';
import AboutSection from '../components/home/AboutSection';
import RoadmapSection from '../components/home/RoadmapSection';
import TrainingSection from '../components/home/TrainingSection';
import EventsSection from '../components/home/EventsSection';
import SquadronSection from '../components/home/SquadronSection';
import ContactSection from '../components/home/ContactSection';

const Home = () => (
    <>
        <HeroSection />
        <div className="section-divider" />
        <AboutSection />
        <div className="section-divider" />
        <RoadmapSection />
        <TrainingSection />
        <div className="section-divider" />
        <EventsSection />
        <div className="section-divider" />
        <SquadronSection />
        <div className="section-divider" />
        <ContactSection />
    </>
);

export default Home;
