import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import FadeIn from '../components/FadeIn';
import { sdgData } from '../data/marqueeImages';
import EvidenceBoard from '../components/EvidenceBoard';
import RoomSetup from '../components/RoomSetup';
import { supabase } from '../lib/supabase';

const InvestigationPage = () => {
  const [user, setUser] = useState<any>(null);
  const [showSetup, setShowSetup] = useState(false);
  const [showGame, setShowGame] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleStartInvestigation = () => {
    if (!user) {
      navigate('/login', { state: { from: location } });
    } else {
      setShowSetup(true);
    }
  };

  const handleGameStart = () => {
    setShowSetup(false);
    setShowGame(true);
  };

  if (showGame) {
    return <EvidenceBoard />; // Note: You might want to pass roomId to EvidenceBoard later for multiplayer sync
  }

  return (
    <div className="min-h-screen bg-[#F5F5F0] text-[#2C3E2D] font-sans selection:bg-[#4A5D4E] selection:text-white pb-20">
      <nav className="p-8 md:p-12 flex justify-between items-center border-b border-[#E0E0D8]">
        <Link 
          to="/" 
          className="text-[#4A5D4E] font-medium tracking-widest uppercase text-sm hover:opacity-60 transition-opacity"
        >
          &larr; Return to Base
        </Link>
        <div className="flex items-center gap-6">
          <span className="font-bold tracking-widest uppercase text-xs text-[#8A968B] hidden sm:inline-block">
            Global Initiative
          </span>
          {user && (
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                setShowSetup(false);
              }}
              className="text-xs font-bold tracking-widest uppercase text-[#b23a2f] hover:text-[#8a2c22] transition-colors border border-[#b23a2f]/30 px-3 py-1.5 rounded-sm hover:bg-[#b23a2f]/10"
            >
              Logout
            </button>
          )}
        </div>
      </nav>

      {showSetup ? (
        <main className="px-8 md:px-12 py-16 md:py-24">
          <RoomSetup user={user} onGameStart={handleGameStart} />
        </main>
      ) : (
        <>
          {/* Header */}
          <header className="px-8 md:px-12 py-16 md:py-24 max-w-5xl">
            <FadeIn delay={0.1} y={30}>
              <h1 className="text-5xl md:text-7xl font-light tracking-tight leading-tight mb-8">
                The 17 Goals for a <br />
                <span className="font-medium text-[#4A5D4E]">Sustainable Future.</span>
              </h1>
            </FadeIn>
            <FadeIn delay={0.3} y={30}>
              <p className="text-lg md:text-xl text-[#5C6E5E] max-w-2xl leading-relaxed font-light mb-12">
                An investigation into the comprehensive global strategy designed to harmonize human progress with planetary boundaries. Our focus today is on Goal 11.
              </p>
              
              <button 
                onClick={handleStartInvestigation}
                className="bg-[#b23a2f] hover:bg-[#8a2c22] text-white px-8 py-4 rounded-sm font-bold uppercase tracking-wider transition-colors shadow-lg shadow-red-900/20 text-lg flex items-center gap-3 group"
              >
                Start Investigation 
                <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
              </button>
            </FadeIn>
          </header>

          {/* SDG Grid Minimalist Nature Theme */}
          <main className="px-8 md:px-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
              {sdgData.map((sdg, index) => (
                <FadeIn key={sdg.number} delay={0.1 + (index * 0.05)} y={20}>
                  <div 
                    className="group relative h-64 md:h-72 p-8 border border-[#E0E0D8] rounded-2xl bg-white hover:bg-[#F9F9F7] transition-all duration-500 overflow-hidden flex flex-col justify-between"
                  >
                    {/* Decorative subtle nature accent */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#E8ECE9] to-transparent rounded-bl-full opacity-50 transition-transform duration-700 group-hover:scale-125" />
                    
                    <div className="relative z-10">
                      <span className="text-[#8A968B] font-mono text-sm tracking-widest">
                        GOAL {sdg.number}
                      </span>
                    </div>
                    
                    <div className="relative z-10">
                      <h3 className="text-xl md:text-2xl font-medium leading-snug mb-4">
                        {sdg.name}
                      </h3>
                      
                      <div className="flex items-center gap-3">
                        <span 
                          className="w-3 h-3 rounded-full shadow-sm" 
                          style={{ backgroundColor: sdg.color }} 
                        />
                        <span className="text-xs tracking-wider uppercase text-[#8A968B] font-semibold">
                          Action Required
                        </span>
                      </div>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </main>
        </>
      )}
    </div>
  );
};

export default InvestigationPage;
