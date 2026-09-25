import FadeIn from '../components/FadeIn';
import Magnet from '../components/Magnet';
import { Link } from 'react-router-dom';
const HeroSection = () => {
  return (
    <section
      className="h-screen flex flex-col relative"
      style={{ overflowX: 'clip' }}
    >
      {/* Navbar */}
      <FadeIn delay={0} y={-20} as="nav">
        <nav className="flex justify-between px-6 md:px-10 pt-6 md:pt-8 w-full">
          <a
            href="/scan"
            className="text-[#D7E2EA] font-medium uppercase tracking-wider text-sm md:text-lg lg:text-[1.4rem] transition-opacity duration-200 hover:opacity-70"
          >
            SCAN
          </a>
          <a
            href="/login"
            className="text-[#D7E2EA] font-medium uppercase tracking-wider text-sm md:text-lg lg:text-[1.4rem] transition-opacity duration-200 hover:opacity-70"
          >
            Login
          </a>
        </nav>
      </FadeIn>

      {/* Hero Heading */}
      <div className="overflow-hidden mt-6 sm:mt-4 md:-mt-5">
        <FadeIn delay={0.15} y={40}>
          <h1 className="hero-heading font-black tracking-tight leading-none whitespace-nowrap w-full text-[14vw] sm:text-[15vw] md:text-[16vw] lg:text-[17.5vw]">
            impact<span className="mx-2 sm:mx-3 md:mx-5 text-[#D7E2EA] opacity-80">.</span>SDG
          </h1>
        </FadeIn>
      </div>

      {/* Hero Portrait */}
      <Magnet
        padding={150}
        strength={3}
        activeTransition="transform 0.3s ease-out"
        inactiveTransition="transform 0.6s ease-in-out"
        className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 sm:top-auto sm:translate-y-0 sm:bottom-0 z-10 w-[280px] sm:w-[360px] md:w-[440px] lg:w-[520px]"
      >
        <FadeIn delay={0.6} y={30}>
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/2/22/Earth_Western_Hemisphere_transparent_background.png"
            alt="SDG Earth"
            className="w-full h-auto drop-shadow-[0_0_30px_rgba(0,120,255,0.3)]"
          />
        </FadeIn>
      </Magnet>

      {/* Central Button */}
      <div className="absolute top-[65%] sm:top-[50%] left-1/2 -translate-x-1/2 z-30">
        <FadeIn delay={0.8} y={20}>
          <Link to="/investigation">
            <button className="px-8 py-4 bg-[#D7E2EA] text-[#0C0C0C] font-bold rounded-full text-sm md:text-base tracking-widest uppercase hover:bg-white hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all duration-300 whitespace-nowrap">
              START INVESTIGATION
            </button>
          </Link>
        </FadeIn>
      </div>

      {/* Bottom bar */}
      <div className="flex justify-between items-end pb-7 sm:pb-8 md:pb-10 px-6 md:px-10 mt-auto relative z-20">
        <FadeIn delay={0.35} y={20}>
          <p
            className="text-[#D7E2EA] font-light uppercase tracking-wide leading-snug max-w-[160px] sm:max-w-[220px] md:max-w-[260px]"
            style={{ fontSize: 'clamp(0.75rem, 1.4vw, 1.5rem)' }}
          >
            driving sustainable development through striking and impactful projects
          </p>
        </FadeIn>
      </div>
    </section>
  );
};

export default HeroSection;
