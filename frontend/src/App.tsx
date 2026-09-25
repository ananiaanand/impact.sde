import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HeroSection from './sections/HeroSection';
import MarqueeSection from './sections/MarqueeSection';
import AboutSection from './sections/AboutSection';
import ServicesSection from './sections/ServicesSection';
import ProjectsSection from './sections/ProjectsSection';
import AboutPage from './pages/AboutPage';
import LoginPage from './pages/LoginPage';
import ScanPage from './pages/ScanPage';
import InvestigationPage from './pages/InvestigationPage';
import TeacherDashboard from './pages/TeacherDashboard';

const HomePage = () => (
  <div className="bg-[#0C0C0C]" style={{ overflowX: 'clip' }}>
    <HeroSection />
    <MarqueeSection />
    <AboutSection />
    <ServicesSection />
    <ProjectsSection />
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/scan" element={<ScanPage />} />
        <Route path="/investigation" element={<InvestigationPage />} />
        <Route path="/teacher" element={<TeacherDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
