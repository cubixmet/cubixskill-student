import React, { useState } from 'react';
import { Video, Send } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';

export const LiveClassesPage: React.FC = () => {
  const [inClassroom, setInClassroom] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{ sender: string; text: string }[]>([
    { sender: 'Dr. Vikramaditya Rao', text: 'Welcome everyone! Today we discuss React 19 Compiler internals.' },
    { sender: 'Priya', text: 'Hello sir, excited for the demo!' },
  ]);

  const handleSendMessage = () => {
    if (chatInput.trim()) {
      setChatMessages([...chatMessages, { sender: 'Alex Student', text: chatInput }]);
      setChatInput('');
    }
  };

  if (inClassroom) {
    return (
      <div className="space-y-4 font-sans text-xs text-left max-w-6xl mx-auto">
        <div className="flex items-center justify-between bg-slate-900 text-white p-3 rounded-2xl">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <h2 className="font-extrabold text-xs">LIVE CLASSROOM: React 19 Compiler Architecture Masterclass</h2>
          </div>
          <Button size="sm" variant="danger" onClick={() => setInClassroom(false)}>Leave Classroom</Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* MAIN VIDEO PLAYER */}
          <div className="lg:col-span-8 bg-slate-900 rounded-2xl aspect-video overflow-hidden relative shadow-xl flex items-center justify-center border border-slate-800 text-white">
            <div className="text-center space-y-2">
              <Video className="w-12 h-12 mx-auto text-blue-500 animate-pulse" />
              <span className="font-black text-sm block">Live Streaming Stream (CubixSkill Dedicated Classroom)</span>
              <span className="text-[10px] text-slate-400 font-mono">Provider: Zoom Web SDK Embedded</span>
            </div>
          </div>

          {/* RIGHT CHAT & PARTICIPANTS */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-4 space-y-3 flex flex-col justify-between h-[360px]">
            <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
              <span className="font-extrabold text-xs text-slate-900">Live Chat &amp; Q&amp;A</span>
              <span className="text-[10px] text-emerald-600 font-bold">42 Attending</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 max-h-56">
              {chatMessages.map((m, idx) => (
                <div key={idx} className="p-2 bg-slate-50 rounded-xl text-[11px]">
                  <strong className="text-slate-900 block">{m.sender}</strong>
                  <span className="text-slate-700">{m.text}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                placeholder="Type a question..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 rounded-xl border border-slate-200 p-2 text-xs"
              />
              <Button size="sm" onClick={handleSendMessage}><Send className="w-3.5 h-3.5" /></Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans text-xs text-left max-w-4xl mx-auto">
      <Card padding="md" className="bg-white border border-slate-200/80 shadow-2xs">
        <h1 className="text-2xl sm:text-[28px] font-bold text-slate-900 tracking-tight leading-tight">Course Live Sessions</h1>
        <p className="text-[13px] sm:text-sm text-slate-500 font-normal mt-1">
          Join upcoming interactive live classes and participate in real-time instructor Q&amp;A.
        </p>
      </Card>

      <Card padding="md" className="bg-white border border-slate-200 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <Badge variant="error" size="sm" className="animate-pulse">● LIVE NOW</Badge>
            <h3 className="font-extrabold text-sm text-slate-900">React 19 Compiler Architecture Masterclass</h3>
          </div>
          <span className="text-xs font-mono font-bold text-slate-500">Instructor: Dr. Vikramaditya Rao</span>
        </div>

        <p className="text-slate-600">
          Join the live virtual classroom session inside CubixSkill. Attendance timer active.
        </p>

        <Button onClick={() => setInClassroom(true)} className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold px-6" leftIcon={<Video className="w-4 h-4" />}>
          Join Live Classroom
        </Button>
      </Card>
    </div>
  );
};
