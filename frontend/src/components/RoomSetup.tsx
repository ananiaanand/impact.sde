import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Copy, Check, Users, User, UserPlus } from 'lucide-react';

interface RoomSetupProps {
  user: any;
  onGameStart: (roomId: string) => void;
}

const generateRoomCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

const RoomSetup: React.FC<RoomSetupProps> = ({ user, onGameStart }) => {
  const [mode, setMode] = useState<'1p' | '1v1' | '2v2' | null>(null);
  const [roomCode, setRoomCode] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [activeRoom, setActiveRoom] = useState<any>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeRoom) {
      const fetchPlayers = async () => {
        const { data: playersData } = await supabase
          .from('room_players')
          .select('*')
          .eq('room_id', activeRoom.id);
          
        setPlayers(playersData || []);
      };

      fetchPlayers();

      const subscription = supabase
        .channel(`room:${activeRoom.id}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'room_players', filter: `room_id=eq.${activeRoom.id}` }, () => {
          fetchPlayers();
        })
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'rooms', filter: `id=eq.${activeRoom.id}` }, (payload) => {
          if (payload.new.status === 'active') {
            onGameStart(activeRoom.id);
          }
        })
        .subscribe();

      return () => {
        supabase.removeChannel(subscription);
      };
    }
  }, [activeRoom, onGameStart]);

  useEffect(() => {
    if (activeRoom && activeRoom.created_by === user?.id) {
      const requiredPlayers = activeRoom.mode === '1p' ? 1 : activeRoom.mode === '1v1' ? 2 : 4;
      if (players.length === requiredPlayers) {
        supabase.from('rooms').update({ status: 'active' }).eq('id', activeRoom.id).then(() => {
          onGameStart(activeRoom.id);
        });
      }
    }
  }, [players, activeRoom, user?.id, onGameStart]);

  const handleCreateRoom = async (selectedMode: '1p' | '1v1' | '2v2') => {
    setLoading(true);
    setError(null);
    try {
      const code = generateRoomCode();
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .insert([{ room_code: code, mode: selectedMode, created_by: user?.id }])
        .select()
        .single();
        
      if (roomError) throw roomError;

      await supabase.from('room_players').insert([{ room_id: room.id, user_id: user?.id }]);
      
      setRoomCode(code);
      setActiveRoom(room);
      setMode(selectedMode);
      
      if (selectedMode === '1p') {
        await supabase.from('rooms').update({ status: 'active' }).eq('id', room.id);
        onGameStart(room.id);
      }
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleJoinRoom = async () => {
    if (!joinCode.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .select('*')
        .eq('room_code', joinCode.toUpperCase())
        .single();

      if (roomError || !room) throw new Error("Room not found or invalid code.");
      if (room.status !== 'waiting') throw new Error("Room is no longer waiting for players.");
      
      const { data: existingPlayers } = await supabase.from('room_players').select('*').eq('room_id', room.id);
      const requiredPlayers = room.mode === '1p' ? 1 : room.mode === '1v1' ? 2 : 4;
      
      if (existingPlayers && existingPlayers.length >= requiredPlayers) {
        throw new Error("Room is already full.");
      }

      await supabase.from('room_players').upsert([{ room_id: room.id, user_id: user?.id }]);
      setActiveRoom(room);
      setMode(room.mode);
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (activeRoom && mode !== '1p') {
    const requiredPlayers = mode === '1v1' ? 2 : 4;
    return (
      <div className="w-full max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-xl border border-[#E0E0D8] text-[#2C3E2D]">
        <h2 className="text-3xl font-light mb-6 text-center">Waiting for Players...</h2>
        
        <div className="bg-[#F5F5F0] p-6 rounded-xl flex items-center justify-between mb-8">
          <div>
            <div className="text-sm text-[#8A968B] uppercase tracking-wider mb-1">Room Code</div>
            <div className="text-4xl font-mono tracking-widest font-bold text-[#b23a2f]">{activeRoom.room_code}</div>
          </div>
          <button 
            onClick={copyCode}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E0E0D8] rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
          >
            {copied ? <Check size={18} className="text-green-600" /> : <Copy size={18} />}
            {copied ? 'Copied' : 'Copy Code'}
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-[#E0E0D8] pb-2">
            <span className="font-semibold text-lg">Players in Room</span>
            <span className="text-[#8A968B]">{players.length} / {requiredPlayers}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: requiredPlayers }).map((_, i) => (
              <div key={i} className={`p-4 rounded-lg flex items-center gap-3 border ${players[i] ? 'bg-green-50 border-green-200 text-green-800' : 'bg-gray-50 border-dashed border-gray-300 text-gray-400'}`}>
                {players[i] ? <User size={20} /> : <UserPlus size={20} opacity={0.5} />}
                <span className="font-medium">{players[i] ? `Player ${i + 1} (Joined)` : 'Waiting...'}</span>
              </div>
            ))}
          </div>
        </div>

        {activeRoom.created_by === user.id && (
          <p className="text-center text-sm text-[#8A968B] mt-8">
            The game will start automatically when all players join.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-12 animate-fade-in">
      <div className="text-center">
        <h2 className="text-4xl font-light mb-4">Select Game Mode</h2>
        <p className="text-[#5C6E5E]">Choose how you want to investigate SDG 11 in Bengaluru.</p>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700">
          <p>{error}</p>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {/* 1 Player */}
        <div className="bg-white p-8 rounded-2xl border border-[#E0E0D8] hover:shadow-lg transition-all cursor-pointer group" onClick={() => handleCreateRoom('1p')}>
          <div className="w-12 h-12 bg-[#F5F5F0] rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#b23a2f] group-hover:text-white transition-colors">
            <User size={24} />
          </div>
          <h3 className="text-2xl font-medium mb-2">Solo Investigator</h3>
          <p className="text-[#8A968B] text-sm">Take on the case by yourself. Uncover all the evidence at your own pace.</p>
        </div>

        {/* 1v1 */}
        <div className="bg-white p-8 rounded-2xl border border-[#E0E0D8] hover:shadow-lg transition-all cursor-pointer group" onClick={() => handleCreateRoom('1v1')}>
          <div className="w-12 h-12 bg-[#F5F5F0] rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#b23a2f] group-hover:text-white transition-colors">
            <Users size={24} />
          </div>
          <h3 className="text-2xl font-medium mb-2">1v1 Duel</h3>
          <p className="text-[#8A968B] text-sm">Race against another investigator to find the root cause first.</p>
        </div>

        {/* 2v2 */}
        <div className="bg-white p-8 rounded-2xl border border-[#E0E0D8] hover:shadow-lg transition-all cursor-pointer group" onClick={() => handleCreateRoom('2v2')}>
          <div className="w-12 h-12 bg-[#F5F5F0] rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#b23a2f] group-hover:text-white transition-colors">
            <Users size={24} />
          </div>
          <h3 className="text-2xl font-medium mb-2">2v2 Squad</h3>
          <p className="text-[#8A968B] text-sm">Team up with a partner and compete against another duo.</p>
        </div>
      </div>

      <div className="mt-12 flex flex-col items-center border-t border-[#E0E0D8] pt-12">
        <h3 className="text-xl font-medium mb-4">Or Join an Existing Room</h3>
        <div className="flex w-full max-w-sm gap-2">
          <input 
            type="text" 
            placeholder="Enter Room Code" 
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            className="flex-1 p-3 rounded-lg border border-[#E0E0D8] focus:outline-none focus:border-[#4A5D4E] uppercase"
            maxLength={6}
          />
          <button 
            onClick={handleJoinRoom}
            disabled={loading || joinCode.length < 6}
            className="bg-[#2C3E2D] hover:bg-[#1A261B] text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            Join
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomSetup;
