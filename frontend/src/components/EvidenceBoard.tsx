import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Map, AlertCircle, CheckCircle2, Search, ArrowRight, Lightbulb } from 'lucide-react';
import HeatMap from '../components/HeatMap';
import textureImg from '../assets/texture.avif';

const API_URL = import.meta.env.VITE_API_URL || '';

interface Evidence {
  id: string;
  type: string;
  title: string;
  content: string;
}

interface LevelData {
  level_number: number;
  title: string;
  story: string;
  evidence: Evidence[];
  investigation_task: string;
  research_prompt: string;
  sdg_target_revealed?: boolean;
}

const EvidenceBoard = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [caseIntro, setCaseIntro] = useState('');
  const [urbanContext, setUrbanContext] = useState('');
  const [currentLevel, setCurrentLevel] = useState<LevelData | null>(null);
  
  const [inputValue, setInputValue] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'bad', message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  
  const [finalMode, setFinalMode] = useState(false);
  const [finalQuestion, setFinalQuestion] = useState('');
  const [finalResult, setFinalResult] = useState<any>(null);
  
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const startCase = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/session/start`, { method: 'POST' });
      if (!res.ok) throw new Error("Failed to start session");
      const data = await res.json();
      
      setSessionId(data.session_id);
      setCaseIntro(data.case_intro);
      setUrbanContext(data.urban_context);
      setCurrentLevel(data.current_level);
    } catch (err) {
      console.error(err);
      alert("Failed to connect to the game server. Ensure the backend is running and Gemini API key is set.");
    }
    setIsLoading(false);
  };

  const submitAnswer = async () => {
    if (!sessionId || !inputValue.trim()) return;
    setIsSubmitting(true);
    setFeedback(null);
    setHint(null);
    try {
      const res = await fetch(`${API_URL}/session/${sessionId}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer: inputValue })
      });
      const data = await res.json();
      
      if (!data.correct) {
        setFeedback({ type: 'bad', message: data.message });
      } else {
        setFeedback({ type: 'ok', message: data.message });
        setInputValue('');
        
        if (data.game_complete) {
          openFinal();
        } else if (data.unlocked_next) {
          setTimeout(() => {
            setCurrentLevel(data.next_level);
            setFeedback(null);
          }, 1500);
        }
      }
    } catch (err) {
      setFeedback({ type: 'bad', message: 'Error submitting answer.' });
    }
    setIsSubmitting(false);
  };

  const requestHint = async () => {
    if (!sessionId) return;
    try {
      const res = await fetch(`${API_URL}/session/${sessionId}/hint`, { method: 'POST' });
      const data = await res.json();
      const mapHint = 'Satellite clue: compare the Bengaluru heat map by year to see how land surface temperatures changed between 2016 and 2026.';
      setHint(`${data.hint} ${mapHint}`);
    } catch (err) {
      console.error("Hint failed", err);
    }
  };

  const openFinal = async () => {
    try {
      const res = await fetch(`${API_URL}/session/${sessionId}/final/question`);
      const data = await res.json();
      setFinalQuestion(data.question);
      setFinalMode(true);
    } catch (err) {
      console.error(err);
    }
  };

  const submitFinal = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/session/${sessionId}/final`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ findings: inputValue })
      });
      const data = await res.json();
      setFinalResult(data);
    } catch (err) {
      console.error(err);
    }
    setIsSubmitting(false);
  };

  if (!sessionId && !isLoading) {
    return (
      <div className="min-h-screen bg-[#1c1a17] flex items-center justify-center p-6"
           style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, #262220 0%, transparent 40%), radial-gradient(circle at 80% 70%, #201d19 0%, transparent 45%)' }}>
        <div className="bg-[#f2ead9] max-w-xl w-full p-10 rounded-sm shadow-2xl relative" style={{ backgroundImage: `url(${textureImg})`, backgroundSize: 'cover', backgroundBlendMode: 'multiply' }}>
          <div className="absolute -top-4 -left-4 text-[#b23a2f] font-mono px-4 py-1 -rotate-6 text-sm tracking-widest bg-[#f2ead9]" style={{ backgroundImage: `url(${textureImg})`, backgroundSize: 'cover', backgroundBlendMode: 'multiply' }}>
            CLASSIFIED
          </div>
          <h1 className="font-playfair text-4xl font-bold mb-4 text-[#2a2620]">Active Investigation</h1>
          <p className="text-[#5a5343] mb-8 leading-relaxed">
            A new urban crisis has emerged. The details are currently unfolding, and we need your expertise. 
            Review the evidence, trace the causal chain, and identify the root SDG 11 failures.
            <br/><br/>
            <strong>Note:</strong> Every case is generated in real-time based on actual NASA data. No two investigations are the same.
          </p>
          <button 
            onClick={startCase}
            className="bg-[#b23a2f] hover:bg-[#8a2c22] text-white px-8 py-4 rounded-sm font-bold uppercase tracking-wider transition-colors w-full flex items-center justify-center gap-2"
          >
            <Search size={20} /> START NEW INVESTIGATION
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1c1a17] flex flex-col items-center justify-center p-6 text-white font-mono space-y-4">
        <div className="w-12 h-12 border-4 border-t-[#b23a2f] border-[#f2ead9]/20 rounded-full animate-spin"></div>
        <p>Synthesizing NASA Data & SDG Knowledge Base...</p>
        <p className="text-xs text-[#a89f8c]">Generating Dynamic Case Blueprint</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1c1a17] text-[#2a2620] pb-20"
         style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, #262220 0%, transparent 40%), radial-gradient(circle at 80% 70%, #201d19 0%, transparent 45%)' }}>
      
      {/* Header */}
      <header className="px-8 py-6 flex flex-col sm:flex-row justify-between sm:items-end relative z-10 gap-4">
        <div>
          <h1 className="font-playfair text-4xl text-[#f2ead9] shadow-black drop-shadow-md">Active Case</h1>
          <div className="font-mono text-sm text-[#caa24a] mt-1 tracking-widest">{urbanContext}</div>
        </div>
        <div className="text-left sm:text-right text-[#a89f8c] text-sm font-mono">
          Session ID: <span className="text-[#f2ead9]">{sessionId?.slice(0, 8)}</span><br />
          {!finalMode && currentLevel && (
            <>Level: <span className="text-white font-bold">{currentLevel.level_number}</span></>
          )}
        </div>
      </header>

      {/* Main Board */}
      <div className="px-8 flex flex-col lg:flex-row gap-8 relative z-10 max-w-[1600px] mx-auto">
        
        {/* Left: Case Intro & Evidence Grid */}
        <div className="flex-1 lg:w-1/2 space-y-8">
          <div className="bg-[#f2ead9] p-6 rounded-sm shadow-lg" style={{ backgroundImage: `url(${textureImg})`, backgroundSize: 'cover', backgroundBlendMode: 'multiply' }}>
            <h2 className="font-playfair font-bold uppercase tracking-wider text-lg text-[#8a2c22] mb-2">Case Briefing</h2>
            <p className="font-serif leading-relaxed text-[#5a5343]">{caseIntro}</p>
          </div>
          
          {!finalMode && currentLevel && (
            <div>
              <div className="font-mono text-[#caa24a] text-sm mb-6 border-b border-[#55503f] pb-2 inline-block">
                — Level {currentLevel.level_number} Evidence —
              </div>
              
              <div className="grid gap-6">
                {currentLevel.evidence.map((ev, i) => (
                  <motion.div 
                    key={ev.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-[#f2ead9] p-5 rounded-sm shadow-md"
                    style={{ backgroundImage: `url(${textureImg})`, backgroundSize: 'cover', backgroundBlendMode: 'multiply' }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {ev.type === 'nasa' ? <Map size={16} className="text-[#b23a2f]"/> : <FileText size={16} className="text-[#4a6b3a]"/>}
                        <span className="text-xs font-bold tracking-widest uppercase text-[#5a5343]">
                          {ev.type === 'nasa' ? 'DATA RECORD' : 'DOCUMENT'}
                        </span>
                      </div>
                      <div className="w-2 h-2 rounded-full bg-[#c9a13b] shadow-sm" />
                    </div>
                    <h3 className="font-playfair font-bold text-xl leading-tight mb-2">{ev.title}</h3>
                    <p className="text-sm font-serif leading-relaxed bg-[#fffdf6] p-3 border border-[#e8dfc7]">{ev.content}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Active Panel (Investigation Task / Final Submission) */}
        <div className="lg:w-1/2 lg:sticky lg:top-8 self-start">
          <div className="bg-[#f2ead9] rounded-sm shadow-2xl p-6 md:p-8 min-h-[500px]" style={{ backgroundImage: `url(${textureImg})`, backgroundSize: 'cover', backgroundBlendMode: 'multiply' }}>
            
            {finalMode ? (
              <AnimatePresence mode="wait">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <h2 className="font-playfair text-3xl font-bold border-b-2 border-[#b23a2f] pb-2 inline-block">Final Investigation</h2>
                  <div className="text-sm bg-[#efe6cc] p-4 rounded-sm leading-relaxed font-serif text-[#2a2620]" style={{ backgroundImage: `url(${textureImg})`, backgroundSize: 'cover', backgroundBlendMode: 'multiply' }}>
                    {finalQuestion}
                  </div>
                  
                  {!finalResult ? (
                    <div className="space-y-4">
                      <textarea 
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Reconstruct the entire causal chain. Explain how the events connect to each other and to SDG 11..."
                        className="w-full h-40 bg-[#fffdf6] border border-[#b7a26a] p-4 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-[#b23a2f] leading-relaxed"
                      />
                      <button 
                        onClick={submitFinal}
                        disabled={isSubmitting || !inputValue.trim()}
                        className="bg-[#b23a2f] hover:bg-[#8a2c22] text-white px-6 py-3 text-sm font-bold uppercase transition-colors disabled:opacity-50 w-full"
                      >
                        {isSubmitting ? 'Evaluating...' : 'Submit Final Report'}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4 text-sm mt-6 animate-fade-in">
                      <div className="bg-white p-4 shadow-sm" style={{ backgroundImage: `url(${textureImg})`, backgroundSize: 'cover', backgroundBlendMode: 'multiply' }}>
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-bold text-[#8a2c22] uppercase">Evaluation Score</h4>
                          <span className="font-mono text-2xl font-bold text-[#4a6b3a]">{Math.round(finalResult.score * 100)}%</span>
                        </div>
                      </div>
                      
                      <div className="bg-white p-4 shadow-sm" style={{ backgroundImage: `url(${textureImg})`, backgroundSize: 'cover', backgroundBlendMode: 'multiply' }}>
                        <h4 className="font-bold text-[#8a2c22] mb-2 uppercase">Case Summary</h4>
                        <p className="leading-relaxed">{finalResult.case_summary}</p>
                      </div>
                      
                      <div className="bg-white p-4 shadow-sm" style={{ backgroundImage: `url(${textureImg})`, backgroundSize: 'cover', backgroundBlendMode: 'multiply' }}>
                        <h4 className="font-bold text-[#8a2c22] mb-2 uppercase">SDG 11 Learning Summary</h4>
                        <p className="leading-relaxed">{finalResult.learning_summary}</p>
                      </div>

                      {finalResult.timeline?.length > 0 && (
                        <div className="bg-white p-4 shadow-sm" style={{ backgroundImage: `url(${textureImg})`, backgroundSize: 'cover', backgroundBlendMode: 'multiply' }}>
                          <h4 className="font-bold text-[#8a2c22] mb-2 uppercase">Actual Timeline (Causal Chain)</h4>
                          <ol className="list-decimal pl-5 space-y-2">
                            {finalResult.timeline.map((t: string, i: number) => <li key={i}>{t}</li>)}
                          </ol>
                        </div>
                      )}
                      
                      {finalResult.missed_points?.length > 0 && (
                        <div className="bg-[#fffdf6] p-4 shadow-sm" style={{ backgroundImage: `url(${textureImg})`, backgroundSize: 'cover', backgroundBlendMode: 'multiply' }}>
                          <h4 className="font-bold text-[#b89342] mb-2 uppercase flex items-center gap-2">
                            <AlertCircle size={16} /> Missed Connections
                          </h4>
                          <ul className="list-disc pl-5 space-y-1">
                            {finalResult.missed_points.map((m: string, i: number) => <li key={i}>{m}</li>)}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            ) : currentLevel ? (
              <AnimatePresence mode="wait">
                <motion.div key={currentLevel.level_number} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                  <div>
                    <h2 className="font-playfair text-2xl font-bold border-b-2 border-[#b23a2f] pb-2 inline-block">
                      {currentLevel.title}
                    </h2>
                  </div>
                  
                  <div className="text-[15px] leading-relaxed border-l-4 border-[#b23a2f] pl-4 italic text-[#2a2620]">
                    {currentLevel.story}
                  </div>
                  
                  <div className="bg-[#e9dfc7] p-4 rounded-sm text-sm" style={{ backgroundImage: `url(${textureImg})`, backgroundSize: 'cover', backgroundBlendMode: 'multiply' }}>
                    <div className="font-bold text-[#8a2c22] mb-1 uppercase text-xs">Current Task</div>
                    <div className="font-semibold mb-3">{currentLevel.investigation_task}</div>
                    
                    <div className="font-bold text-[#8a2c22] mb-1 uppercase text-xs">Research Prompt</div>
                    <div className="font-serif bg-[#fffdf6] p-3" style={{ backgroundImage: `url(${textureImg})`, backgroundSize: 'cover', backgroundBlendMode: 'multiply' }}>{currentLevel.research_prompt}</div>
                  </div>

                  <div className="mt-6 space-y-4">
                    <textarea 
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Enter your answer based on evidence and research..."
                      className="w-full h-16 bg-[#fffdf6] border border-[#b7a26a] p-3 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-[#b23a2f]"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          submitAnswer();
                        }
                      }}
                    />
                    
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={submitAnswer}
                        disabled={isSubmitting || !inputValue.trim()}
                        className="bg-[#2a2620] hover:bg-[#1a1713] text-white px-6 py-2 text-sm font-bold uppercase transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {isSubmitting ? 'Verifying...' : 'Submit'} <ArrowRight size={16} />
                      </button>
                      
                      <button 
                        onClick={requestHint}
                        className="border border-[#b7a26a] text-[#5a5343] hover:bg-[#e9dfc7] px-4 py-2 text-sm font-bold uppercase transition-colors flex items-center gap-2"
                      >
                        <Lightbulb size={16} /> Hint
                      </button>
                    </div>

                    {hint && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-[#fffdf6] p-3 text-sm text-[#8a6a22]" style={{ backgroundImage: `url(${textureImg})`, backgroundSize: 'cover', backgroundBlendMode: 'multiply' }}>
                        <div className="flex flex-col gap-3">
                          <div>
                            <span className="font-bold uppercase text-xs mr-2">Hint:</span> {hint}
                          </div>
                          <button
                            onClick={() => setIsMapOpen(true)}
                            className="self-start border border-[#b23a2f] text-[#b23a2f] px-3 py-2 text-[11px] font-bold uppercase tracking-wider hover:bg-[#b23a2f]/10 transition-colors"
                          >
                            Open Bengaluru Heat Map
                          </button>
                        </div>
                      </motion.div>
                    )}
                    
                    {feedback && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`text-sm font-bold p-3 rounded-sm ${feedback.type === 'ok' ? 'bg-[#4a6b3a]/10 text-[#4a6b3a]' : 'bg-[#b23a2f]/10 text-[#b23a2f]'}`}>
                        <div className="flex items-center gap-2">
                          {feedback.type === 'ok' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                          {feedback.message}
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            ) : null}
          </div>
        </div>
      </div>

      {/* Floating Map Button */}
      <button 
        onClick={() => setIsMapOpen(true)}
        className="fixed bottom-8 right-8 z-40 bg-[#caa24a] hover:bg-[#b89342] text-[#241f16] font-bold px-6 py-3 rounded-full shadow-[0_8px_20px_#00000060] flex items-center gap-2 transition-transform hover:-translate-y-1"
      >
        <Map size={18} /> View NASA Heat Map
      </button>

      {/* Map Modal */}
      {isMapOpen && <HeatMap onClose={() => setIsMapOpen(false)} />}
    </div>
  );
};

export default EvidenceBoard;
