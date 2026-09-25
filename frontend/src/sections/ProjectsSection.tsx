import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import FadeIn from '../components/FadeIn';

import { projects } from '../data/projects';
import type { Project } from '../data/projects';

const totalCards = projects.length;

interface ProjectCardProps {
  project: Project;
  index: number;
}

const ProjectCard = ({ project, index }: ProjectCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ['start end', 'start start'],
  });

  const targetScale = 1 - (totalCards - 1 - index) * 0.03;
  const scale = useTransform(scrollYProgress, [0, 1], [1, targetScale]);

  return (
    <div
      ref={cardRef}
      className="sticky top-24 md:top-32 h-[85vh]"
      style={{ top: `${96 + index * 28}px` }}
    >
      <motion.div
        style={{ scale, top: `${index * 28}px` }}
        className="relative rounded-[40px] sm:rounded-[50px] md:rounded-[60px] border-2 border-[#D7E2EA] bg-[#0C0C0C] p-4 sm:p-6 md:p-8 h-full flex flex-col"
      >


        {/* Bottom row: image grid */}
        <div className="flex gap-3 sm:gap-4 flex-1 min-h-0">
          <div className="flex flex-col gap-3 sm:gap-4" style={{ width: '40%' }}>
            <img
              src={project.col1Image1}
              alt={`${project.name} preview 1`}
              className="rounded-[40px] sm:rounded-[50px] md:rounded-[60px] object-cover w-full"
              style={{ height: 'clamp(130px, 16vw, 230px)' }}
            />
            <img
              src={project.col1Image2}
              alt={`${project.name} preview 2`}
              className="rounded-[40px] sm:rounded-[50px] md:rounded-[60px] object-cover w-full"
              style={{ height: 'clamp(160px, 22vw, 340px)' }}
            />
          </div>
          <div style={{ width: '60%' }}>
            <img
              src={project.col2Image}
              alt={`${project.name} preview 3`}
              className="rounded-[40px] sm:rounded-[50px] md:rounded-[60px] object-cover w-full h-full"
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const ProjectsSection = () => {
  return (
    <section
      id="projects"
      className="relative bg-[#0C0C0C] rounded-t-[40px] sm:rounded-t-[50px] md:rounded-t-[60px] -mt-10 sm:-mt-12 md:-mt-14 z-10 px-5 sm:px-8 md:px-10 py-20 sm:py-24 md:py-32"
      style={{ overflowX: 'clip' }}
    >
      <FadeIn delay={0} y={30}>
        <h2
          className="hero-heading font-black uppercase leading-none tracking-tight text-center mb-16 sm:mb-20 md:mb-28"
          style={{ fontSize: 'clamp(3rem, 12vw, 160px)' }}
        >
          Let's go
        </h2>
      </FadeIn>

      <div className="flex flex-col">
        {projects.map((project, i) => (
          <ProjectCard key={project.number} project={project} index={i} />
        ))}
      </div>

      <div className="mt-20 md:mt-32 flex justify-center pb-20">
        <Link to="/investigation">
          <button className="px-6 py-2 border border-[#D7E2EA] text-[#D7E2EA] rounded-full text-xs tracking-widest uppercase hover:bg-[#D7E2EA] hover:text-[#0C0C0C] transition-colors duration-300">
            START INVESTIGATION
          </button>
        </Link>
      </div>
    </section>
  );
};

export default ProjectsSection;
