import FadeIn from '../components/FadeIn';
import AnimatedText from '../components/AnimatedText';
const AboutSection = () => {
  return (
    <section
      id="mission"
      className="relative min-h-screen flex flex-col items-center justify-center px-5 sm:px-8 md:px-10 py-20"
      style={{ overflowX: 'clip' }}
    >
      {/* Decorative corner images */}
      <FadeIn
        delay={0.1}
        x={-80}
        y={0}
        duration={0.9}
        className="absolute top-[4%] left-[1%] sm:left-[2%] md:left-[4%] w-[80px] sm:w-[120px] md:w-[160px] opacity-70"
      >
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/4/4b/Leaf_icon_15.svg"
          alt="Leaf"
          className="w-full h-auto"
        />
      </FadeIn>

      <FadeIn
        delay={0.25}
        x={-80}
        y={0}
        duration={0.9}
        className="absolute bottom-[8%] left-[3%] sm:left-[6%] md:left-[10%] w-[80px] sm:w-[120px] md:w-[160px] opacity-70"
      >
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/e/e6/Water_drop_icon.svg"
          alt="Water Drop"
          className="w-full h-auto"
        />
      </FadeIn>

      <FadeIn
        delay={0.15}
        x={80}
        y={0}
        duration={0.9}
        className="absolute top-[4%] right-[1%] sm:right-[2%] md:right-[4%] w-[80px] sm:w-[120px] md:w-[160px] opacity-70"
      >
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/5/53/Sun_icon.svg"
          alt="Sun"
          className="w-full h-auto"
        />
      </FadeIn>

      <FadeIn
        delay={0.3}
        x={80}
        y={0}
        duration={0.9}
        className="absolute bottom-[8%] right-[3%] sm:right-[6%] md:right-[10%] w-[80px] sm:w-[120px] md:w-[160px] opacity-70"
      >
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/4/44/Recycle001.svg"
          alt="Recycle"
          className="w-full h-auto"
        />
      </FadeIn>

      {/* Content */}
      <div className="flex flex-col items-center text-center gap-10 sm:gap-14 md:gap-16">
        <FadeIn delay={0} y={40}>
          <h2
            className="hero-heading font-black uppercase leading-none tracking-tight"
            style={{ fontSize: 'clamp(3rem, 12vw, 160px)' }}
          >
            Our Mission
          </h2>
        </FadeIn>

        <div className="flex flex-col items-center gap-16 sm:gap-20 md:gap-24">
          <AnimatedText
            text="We are committed to driving the Sustainable Development Goals (SDGs) globally. Our focus is on climate action, quality education, and reducing inequalities to build a better, more sustainable world for all. Let's build a sustainable future together!"
            className="text-[#D7E2EA] font-medium text-center leading-relaxed max-w-[560px]"
            style={{ fontSize: 'clamp(1rem, 2vw, 1.35rem)' }}
          />
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
