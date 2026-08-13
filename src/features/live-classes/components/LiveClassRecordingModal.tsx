import React from 'react';
import { X, PlayCircle, Radio } from 'lucide-react';
import type { LiveClass } from '../../../stores/live-class.store';

interface Props {
  liveClass: LiveClass | null;
  onClose: () => void;
}

export const LiveClassRecordingModal: React.FC<Props> = ({ liveClass, onClose }) => {
  if (!liveClass || !liveClass.recordingUrl) return null;

  const isVideoMp4 = liveClass.recordingUrl.endsWith('.mp4');

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm p-3 sm:p-6 flex items-center justify-center font-sans text-xs">
      <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl w-full max-w-5xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* MODAL HEADER */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between gap-3 bg-slate-50/90">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
              <PlayCircle className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 truncate">{liveClass.title}</h3>
              <span className="text-[11px] text-slate-500 font-medium block truncate">
                Recorded Live Session • Replay
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center cursor-pointer transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODAL VIDEO PLAYER BODY */}
        <div className="p-4 sm:p-6 bg-slate-950 flex items-center justify-center">
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-slate-800 bg-black shadow-lg">
            {isVideoMp4 ? (
              <video controls autoPlay playsInline className="w-full h-full object-contain">
                <source src={liveClass.recordingUrl} type="video/mp4" />
                Your browser does not support HTML5 video playback.
              </video>
            ) : (
              <iframe
                src={liveClass.recordingUrl}
                title={liveClass.title}
                className="w-full h-full border-0"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
