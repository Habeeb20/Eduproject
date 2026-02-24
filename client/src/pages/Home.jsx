import React from 'react'
import HeroSection from '../components/Home/Hero'
import HeroSection2 from '../components/Home/HeroSection'
import FeatureHero from '../components/Home/FeaturedSection'
import SupportedBySection from '../components/Home/SupportedBySection'

const Home = () => {
  return (
    <div>
        <HeroSection/>
        <HeroSection2/>
        <FeatureHero/>
        <SupportedBySection />
      
    </div>
  )
}

export default Home
