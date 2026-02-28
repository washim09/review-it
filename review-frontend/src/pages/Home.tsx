'use client'

import Banner from '../components/home/Banner';
import FeaturedReviews from '../components/home/FeaturedReviews';
import HowItWorks from '../components/home/HowItWorks';
import Navbar from '../components/layout/Navbar';
import TrustThroughTransparency from '../components/home/TrustThroughTransparency';

const Home = () => {
  return (
    <div className="flex flex-col min-h-screen overflow-hidden bg-neutral-50">
      {/* Navbar with placeholder for fixed positioning */}
      <div className="h-[72px]">
        <Navbar />
      </div>
      
      {/* Banner component positioned to connect with navbar */}
      <div>
        <Banner />
      </div>
      
      {/* Gradient background for how it works section */}
      <div className="bg-gradient-to-b from-indigo-50 to-white">
        <HowItWorks />
      </div>
      
      {/* Light background with subtle gradient for featured reviews */}
      <div className="bg-gradient-to-br from-white to-purple-50/30">
        <FeaturedReviews />
      </div>
      
      {/* Trust Through Transparency section */}
      <div className="-mt-[72px]">
        <TrustThroughTransparency />
      </div>
      
      {/* Footer is included globally in App.tsx */}
    </div>
  );
};

export default Home;
