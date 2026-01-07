import Layout from '@/components/layout/Layout';
import HeroSection from '@/components/home/HeroSection';
import FeaturedProjects from '@/components/home/FeaturedProjects';
import HowItWorks from '@/components/home/HowItWorks';
import AboutSection from '@/components/home/AboutSection';

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <FeaturedProjects />
      <HowItWorks />
      <AboutSection />
    </Layout>
  );
};

export default Index;
