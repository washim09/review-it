import Banner from '../components/Banner';
import FeaturedReviews from '../components/FeaturedReviews';
import HowItWorks from '../components/HowItWorks';
import Navbar from '../components/Navbar';

const Home = () => {
  return (
    <div>
      <Navbar />
      <Banner />
      <HowItWorks />
      <FeaturedReviews />
    </div>
  );
};

export default Home;
