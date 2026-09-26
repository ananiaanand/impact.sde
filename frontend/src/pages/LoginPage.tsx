import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import FadeIn from '../components/FadeIn';
import { supabase } from '../lib/supabase';

const TEACHER_EMAIL = 'teacher@gmail.com';
const TEACHER_PASSWORD = 'teacher';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    const teacherSession = localStorage.getItem('impact_teacher_session');
    if (teacherSession === 'active') {
      navigate('/teacher', { replace: true });
      return;
    }

    supabase.auth.getSession().then((response: any) => {
      const { session } = response.data;
      if (session) {
        navigate(from, { replace: true });
      }
    });
  }, [navigate, from]);

  const handleAuth = async (e: React.FormEvent, isSignUp: boolean) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const normalizedEmail = email.trim().toLowerCase();
    if (normalizedEmail === TEACHER_EMAIL && password === TEACHER_PASSWORD) {
      localStorage.setItem('impact_teacher_session', 'active');
      navigate('/teacher', { replace: true });
      setLoading(false);
      return;
    }

    localStorage.removeItem('impact_teacher_session');

    let result;
    if (isSignUp) {
      result = await supabase.auth.signUp({ email, password });
    } else {
      result = await supabase.auth.signInWithPassword({ email, password });
    }

    if (result.error) {
      setError(result.error.message);
    } else {
      navigate(from, { replace: true });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0C0C0C] text-white flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-md">
        <nav className="mb-12">
          <Link to="/" className="text-[#D7E2EA] hover:opacity-70 uppercase tracking-wider">
            &larr; Back to Home
          </Link>
        </nav>
        
        <FadeIn delay={0} y={20}>
          <h1 className="hero-heading font-black text-4xl mb-8">Agent Access</h1>
          <form className="flex flex-col gap-4">
            <input 
              type="email" 
              placeholder="Email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="p-4 rounded-xl bg-[#1A1A1A] border border-gray-800 text-white focus:outline-none focus:border-blue-500"
              required
            />
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="p-4 rounded-xl bg-[#1A1A1A] border border-gray-800 text-white focus:outline-none focus:border-blue-500"
              required
            />
            
            {error && <div className="text-red-500 text-sm mt-2">{error}</div>}

            <div className="flex gap-4 mt-4">
              <button 
                type="submit"
                onClick={(e) => handleAuth(e, false)}
                disabled={loading}
                className="flex-1 bg-white text-black font-bold uppercase tracking-wider py-4 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Sign In
              </button>
              <button 
                type="button"
                onClick={(e) => handleAuth(e, true)}
                disabled={loading}
                className="flex-1 bg-transparent border border-white text-white font-bold uppercase tracking-wider py-4 rounded-xl hover:bg-white/10 transition-colors disabled:opacity-50"
              >
                Sign Up
              </button>
            </div>
          </form>
        </FadeIn>
      </div>
    </div>
  );
};

export default LoginPage;
