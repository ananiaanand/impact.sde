import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Users, BarChart3, Target, Activity } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function TeacherDashboard() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/login');
        return;
      }
      
      // MVP Authorization Check
      if (session.user.email === 'teacher@gmail.com') {
        setIsAuthorized(true);
        fetchStats();
      } else {
        alert('Access Denied. This area is restricted to teachers.');
        navigate('/');
      }
      setLoading(false);
    };

    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_URL}/analytics/overview`);
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error("Failed to fetch analytics", err);
      }
    };

    checkAuth();
  }, [navigate]);

  if (loading) return <div className="p-10">Loading Dashboard...</div>;
  if (!isAuthorized) return null;

  return (
    <div className="min-h-screen bg-[#F5F5F0] text-[#2C3E2D] p-8">
      <header className="mb-10 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-light">Teacher Dashboard</h1>
          <p className="text-[#8A968B] font-mono mt-2">SDG 11 Investigation Analytics</p>
        </div>
        <button 
          onClick={() => { supabase.auth.signOut(); navigate('/'); }}
          className="border border-[#b23a2f] text-[#b23a2f] px-4 py-2 rounded-sm text-sm uppercase tracking-widest font-bold hover:bg-[#b23a2f]/10"
        >
          Logout
        </button>
      </header>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-6 rounded-xl border border-[#E0E0D8] shadow-sm">
          <div className="flex items-center gap-3 mb-2 text-[#8A968B]"><Users size={20}/> Students Active</div>
          <div className="text-3xl font-mono">{stats?.students_active ?? 0}</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-[#E0E0D8] shadow-sm">
          <div className="flex items-center gap-3 mb-2 text-[#8A968B]"><Activity size={20}/> Games Completed</div>
          <div className="text-3xl font-mono">{stats?.games_completed ?? 0}</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-[#E0E0D8] shadow-sm">
          <div className="flex items-center gap-3 mb-2 text-[#8A968B]"><BarChart3 size={20}/> Avg Understanding</div>
          <div className="text-3xl font-mono">{stats?.average_understanding ?? '--'}%</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-[#E0E0D8] shadow-sm">
          <div className="flex items-center gap-3 mb-2 text-[#8A968B]"><Target size={20}/> Most Mastered SDG</div>
          <div className="text-3xl font-mono text-[#4A5D4E]">{stats?.most_mastered ?? 'N/A'}</div>
        </div>
      </div>

      {/* Student List Placeholder */}
      <div className="bg-white rounded-xl border border-[#E0E0D8] shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E0E0D8] bg-[#F9F9F7]">
          <h2 className="font-semibold text-lg">Student Roster</h2>
        </div>
        <div className="p-6 text-center text-[#8A968B] italic">
          No student data recorded yet. Please run the schema.sql file in your Supabase SQL editor to initialize tables, and update the backend to start tracking events!
        </div>
      </div>
    </div>
  );
}
