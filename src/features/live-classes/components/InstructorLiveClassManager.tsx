import React, { useState } from 'react';
import { Video, Calendar, Clock, Link as LinkIcon, Plus, CheckCircle2 } from 'lucide-react';
import { useLiveClassStore, type LiveClassDeliveryType } from '../../../stores/live-class.store';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';

interface Props {
  academyUuid: string;
  courseUuid: string;
}

export const InstructorLiveClassManager: React.FC<Props> = ({ academyUuid, courseUuid }) => {
  const addLiveClass = useLiveClassStore((state) => state.addLiveClass);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [deliveryType, setDeliveryType] = useState<LiveClassDeliveryType>('external_url');
  const [joinUrl, setJoinUrl] = useState('');
  const [streamUrl, setStreamUrl] = useState('');
  const [isDemoAccessible, setIsDemoAccessible] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !startDate || !startTime) return;

    setSubmitting(true);
    const startIso = new Date(`${startDate}T${startTime}`).toISOString();
    const endIso = new Date(new Date(startIso).getTime() + 1000 * 60 * 60).toISOString();

    setTimeout(() => {
      addLiveClass({
        academyUuid,
        courseUuid,
        title: title.trim(),
        description: description.trim(),
        scheduledStartAt: startIso,
        scheduledEndAt: endIso,
        timezone: 'Asia/Kolkata',
        deliveryType,
        joinUrl: deliveryType === 'external_url' ? joinUrl.trim() || 'https://meet.google.com/abc-defg-hij' : undefined,
        streamUrl: deliveryType === 'stream' ? streamUrl.trim() || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' : undefined,
        status: 'scheduled',
        isDemoAccessible,
      });

      setTitle('');
      setDescription('');
      setJoinUrl('');
      setStreamUrl('');
      setSubmitting(false);
      setSuccessMsg('Live session scheduled and eligible students notified.');
      setTimeout(() => setSuccessMsg(null), 3000);
    }, 400);
  };

  return (
    <Card padding="md" className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl shadow-2xs space-y-4 font-sans text-xs">
      <div className="border-b border-slate-100 pb-3">
        <h3 className="font-extrabold text-sm text-slate-900">Schedule Instructor Live Class</h3>
        <p className="text-slate-500 text-[11px]">Schedule interactive course events and stream sessions</p>
      </div>

      {successMsg && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
        <div className="space-y-1">
          <label className="block text-[11px] font-bold text-slate-700">Live Session Title</label>
          <input
            type="text"
            placeholder="e.g. React 19 Compiler Architecture Masterclass"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full h-10 px-3 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-slate-700">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-slate-700">Start Time</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              required
            />
          </div>
        </div>

        {/* DELIVERY TYPE SELECTOR */}
        <div className="space-y-2 pt-1">
          <label className="block text-[11px] font-bold text-slate-800">Session Delivery Method</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label
              className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                deliveryType === 'external_url'
                  ? 'border-blue-600 bg-blue-50/70 text-blue-950 font-bold ring-2 ring-blue-500/20'
                  : 'border-slate-200 bg-white text-slate-700'
              }`}
            >
              <input
                type="radio"
                name="deliveryType"
                value="external_url"
                checked={deliveryType === 'external_url'}
                onChange={() => setDeliveryType('external_url')}
                className="mt-0.5"
              />
              <div className="space-y-0.5">
                <span className="text-xs font-bold block">External URL Meeting</span>
                <span className="text-[10px] text-slate-500 font-normal leading-tight block">
                  Google Meet, Zoom, MS Teams, or provider link.
                </span>
              </div>
            </label>

            <label
              className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                deliveryType === 'stream'
                  ? 'border-blue-600 bg-blue-50/70 text-blue-950 font-bold ring-2 ring-blue-500/20'
                  : 'border-slate-200 bg-white text-slate-700'
              }`}
            >
              <input
                type="radio"
                name="deliveryType"
                value="stream"
                checked={deliveryType === 'stream'}
                onChange={() => setDeliveryType('stream')}
                className="mt-0.5"
              />
              <div className="space-y-0.5">
                <span className="text-xs font-bold block">Platform Embedded Stream</span>
                <span className="text-[10px] text-slate-500 font-normal leading-tight block">
                  Interactive in-app stream classroom with live chat.
                </span>
              </div>
            </label>
          </div>
        </div>

        {deliveryType === 'external_url' ? (
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-slate-700">Live Session Join URL</label>
            <input
              type="text"
              placeholder="https://meet.google.com/..."
              value={joinUrl}
              onChange={(e) => setJoinUrl(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        ) : (
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-slate-700">Stream HLS / Playback URL</label>
            <input
              type="text"
              placeholder="https://commondatastorage.googleapis.com/..."
              value={streamUrl}
              onChange={(e) => setStreamUrl(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        )}

        {/* STUDENT ACCESS */}
        <div className="space-y-1 pt-1">
          <label className="block text-[11px] font-bold text-slate-800">Student Access Scope</label>
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-700">
            <label className="inline-flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="isDemoAccessible"
                checked={!isDemoAccessible}
                onChange={() => setIsDemoAccessible(false)}
              />
              <span>Full Course Students Only</span>
            </label>

            <label className="inline-flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="isDemoAccessible"
                checked={isDemoAccessible}
                onChange={() => setIsDemoAccessible(true)}
              />
              <span>Full + Demo Students</span>
            </label>
          </div>
        </div>

        <Button
          type="submit"
          disabled={submitting}
          leftIcon={<Plus className="w-4 h-4 shrink-0" />}
          className="w-full sm:w-auto font-semibold px-6 min-h-[44px] bg-blue-600 text-white rounded-xl shadow-xs disabled:opacity-50 cursor-pointer"
        >
          {submitting ? 'Scheduling...' : 'Schedule Live Session'}
        </Button>
      </form>
    </Card>
  );
};
