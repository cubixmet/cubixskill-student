import React from 'react';
import { X, ExternalLink, Download, FileText, Image as ImageIcon } from 'lucide-react';
import type { CourseResource } from '../../../stores/resource.store';
import { formatFileSize } from '../utils/resourceAccessResolver';
import { Button } from '../../../components/ui/Button';

interface Props {
  resource: CourseResource | null;
  onClose: () => void;
  canDownload?: boolean;
}

export const ResourceViewerModal: React.FC<Props> = ({ resource, onClose, canDownload = false }) => {
  if (!resource) return null;

  const isImage = resource.mimeType?.startsWith('image/') || resource.fileName.match(/\.(png|jpe?g|svg|webp)$/i);
  const isPdf = resource.mimeType === 'application/pdf' || resource.fileName.endsWith('.pdf');

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm p-3 sm:p-6 flex items-center justify-center font-sans text-xs">
      <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* MODAL HEADER */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between gap-3 bg-slate-50/80">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              {isImage ? <ImageIcon className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
            </div>
            <div className="min-w-0">
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 truncate">{resource.title}</h3>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium pt-0.5">
                <span className="truncate">{resource.fileName}</span>
                <span>•</span>
                <span>{formatFileSize(resource.fileSize)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {canDownload && (
              <a href={resource.fileUrl} download={resource.fileName} target="_blank" rel="noopener noreferrer">
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<Download className="w-4 h-4 shrink-0" />}
                  className="font-semibold px-4 min-h-[38px] border-slate-300 text-slate-700 hover:bg-slate-100 cursor-pointer hidden sm:flex"
                >
                  Download File
                </Button>
              </a>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* MODAL CONTENT BODY */}
        <div className="p-4 sm:p-6 flex-1 overflow-auto bg-slate-900 flex items-center justify-center min-h-[300px]">
          {isImage ? (
            <img src={resource.fileUrl} alt={resource.title} className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-lg" />
          ) : isPdf ? (
            <iframe src={resource.fileUrl} title={resource.title} className="w-full h-[65vh] md:h-[72vh] border-0 rounded-xl bg-white" />
          ) : (
            <div className="p-8 text-center space-y-3 bg-white rounded-2xl border border-slate-200 max-w-md mx-auto">
              <FileText className="w-10 h-10 text-slate-400 mx-auto" />
              <h4 className="font-extrabold text-sm text-slate-900">In-Browser Preview Not Supported</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                This resource file format cannot be rendered directly inside the viewer.
              </p>
              {canDownload && (
                <a href={resource.fileUrl} download={resource.fileName} target="_blank" rel="noopener noreferrer" className="inline-block pt-2">
                  <Button size="md" leftIcon={<Download className="w-4 h-4 shrink-0" />} className="font-semibold bg-blue-600 text-white rounded-xl">
                    Download Resource
                  </Button>
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
