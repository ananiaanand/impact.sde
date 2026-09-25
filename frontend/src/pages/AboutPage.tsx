import { Link } from 'react-router-dom';
import FadeIn from '../components/FadeIn';
import { sdgData } from '../data/marqueeImages';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-[#0C0C0C] text-white p-8 md:p-16">
      <nav className="mb-12">
        <Link to="/" className="text-[#D7E2EA] hover:opacity-70 uppercase tracking-wider">
          &larr; Back to Home
        </Link>
      </nav>
      <FadeIn delay={0} y={20}>
        <h1 className="hero-heading font-black text-5xl md:text-7xl mb-12">
          About the 17 SDGs
        </h1>
        <p className="text-xl max-w-3xl mb-16 text-[#D7E2EA]">
          The Sustainable Development Goals (SDGs) are a universal call to action to end poverty, protect the planet, and ensure that by 2030 all people enjoy peace and prosperity.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sdgData.map((sdg) => (
            <div key={sdg.number} className="p-8 rounded-2xl flex flex-col justify-between shadow-lg h-64" style={{ backgroundColor: sdg.color }}>
              <span className="text-white font-black text-5xl opacity-90">{sdg.number}</span>
              <h3 className="text-white font-black uppercase text-2xl leading-tight">{sdg.name}</h3>
            </div>
          ))}
        </div>
      </FadeIn>
    </div>
  );
};

export default AboutPage;
