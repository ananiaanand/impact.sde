import { useEffect, useRef, useState } from 'react';
import { marqueeRow1, marqueeRow2 } from '../data/marqueeImages';
import type { SDG } from '../data/marqueeImages';

const tripled = (arr: SDG[]) => [...arr, ...arr, ...arr];

const MarqueeSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const section = sectionRef.current;
      if (!section) return;

      const sectionTop = section.getBoundingClientRect().top + window.scrollY;
      const newOffset =
        (window.scrollY - sectionTop + window.innerHeight) * 0.3;

      setOffset(newOffset);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const row1 = tripled(marqueeRow1);
  const row2 = tripled(marqueeRow2);

  return (
    <section
      ref={sectionRef}
      className="bg-[#0C0C0C] pt-24 sm:pt-32 md:pt-40 pb-10"
      style={{ overflowX: 'clip' }}
    >
      <div className="flex flex-col gap-3">
        <div
          className="flex gap-3"
          style={{
            transform: `translateX(${offset - 200}px)`,
            willChange: 'transform',
          }}
        >
          {row1.map((sdg, i) => (
            <div
              key={`row1-${i}`}
              className="rounded-2xl flex-shrink-0 flex flex-col justify-between p-6 shadow-lg"
              style={{ width: 420, height: 270, backgroundColor: sdg.color }}
            >
              <span className="text-white font-black text-6xl opacity-90">{sdg.number}</span>
              <h3 className="text-white font-black uppercase text-3xl leading-tight">{sdg.name}</h3>
            </div>
          ))}
        </div>
        <div
          className="flex gap-3"
          style={{
            transform: `translateX(${-(offset - 200)}px)`,
            willChange: 'transform',
          }}
        >
          {row2.map((sdg, i) => (
            <div
              key={`row2-${i}`}
              className="rounded-2xl flex-shrink-0 flex flex-col justify-between p-6 shadow-lg"
              style={{ width: 420, height: 270, backgroundColor: sdg.color }}
            >
              <span className="text-white font-black text-6xl opacity-90">{sdg.number}</span>
              <h3 className="text-white font-black uppercase text-3xl leading-tight">{sdg.name}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MarqueeSection;
