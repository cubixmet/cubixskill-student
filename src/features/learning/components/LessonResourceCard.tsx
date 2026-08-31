import React, { useState } from 'react';
import { Eye, Download, FileText, Image as ImageIcon, FileArchive, Code, Lock } from 'lucide-react';
import type { CourseResource } from '../../../stores/resource.store';
import type { CourseEnrollment } from '../../../stores/enrollment.store';
import { resolveResourceAccess, formatFileSize } from '../utils/resourceAccessResolver';
import { ResourceViewerModal } from './ResourceViewerModal';
import { Button } from '../../../components/ui/Button';

interface Props {
  resource: CourseResource;
  enrollment?: CourseEnrollment;
}

export const LessonResourceCard: React.FC<Props> = ({ resource, enrollment }) => {
  const access = resolveResourceAccess({ resource, enrollment });
  const [viewerOpen, setViewerOpen] = useState(false);

  const getFileIcon = () => {
    if (resource.mimeType?.startsWith('image/') || resource.fileName.match(/\.(png|jpe?g|svg|gif|webp)$/i)) {
      return <ImageIcon style={{ color: 'var(--brand-primary)' }} className="w-4 h-4 shrink-0 stroke-current" />;
    }
    if (resource.fileName.match(/\.(zip|tar|gz|rar|7z)$/i)) {
      return <FileArchive style={{ color: 'var(--brand-primary)' }} className="w-4 h-4 shrink-0 stroke-current" />;
    }
    return <FileText style={{ color: 'var(--brand-primary)' }} className="w-4 h-4 shrink-0 stroke-current" />;
  };

  const hasSize = typeof resource.fileSize === 'number' && resource.fileSize > 0;
  const displayTitle = resource.title || resource.fileName || 'Resource Attachment';
  const displayFileName = resource.fileName || resource.title || '';

  return (
    <>
      <div
        style={{
          backgroundColor: 'var(--surface-secondary)',
          borderColor: 'var(--border)',
          color: 'var(--text-primary)',
          borderRadius: '10px',
        }}
        className="p-3 border flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-sans text-xs w-full min-w-0 max-w-full box-border"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div
            style={{
              backgroundColor: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)',
              color: 'var(--brand-primary)',
              borderColor: 'var(--border)',
            }}
            className="w-9 h-9 rounded-lg border flex items-center justify-center shrink-0"
          >
            {getFileIcon()}
          </div>

          <div className="space-y-0.5 min-w-0 flex-1">
            <div className="flex items-center gap-2 min-w-0">
              <h4
                style={{ color: 'var(--text-primary)' }}
                className="font-semibold text-xs sm:text-sm truncate min-w-0 max-w-full"
              >
                {displayTitle}
              </h4>
              {!access.canDownload && access.canView && (
                <span
                  style={{
                    backgroundColor: 'var(--surface)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-muted)',
                  }}
                  className="px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wide shrink-0"
                >
                  View Only
                </span>
              )}
            </div>
            <div style={{ color: 'var(--text-muted)' }} className="flex items-center gap-1.5 text-[12px] font-normal flex-wrap">
              {displayFileName && displayFileName !== displayTitle && (
                <span className="truncate max-w-[180px] sm:max-w-[240px]">{displayFileName}</span>
              )}
              {displayFileName && displayFileName !== displayTitle && hasSize && <span>•</span>}
              {hasSize && <span>{formatFileSize(resource.fileSize)}</span>}
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="w-full sm:w-auto grid grid-cols-2 gap-2 sm:flex sm:items-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[var(--border)]">
          {access.canView ? (
            <button
              type="button"
              onClick={() => setViewerOpen(true)}
              style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
              className="w-full min-h-[42px] px-3.5 font-medium text-xs rounded-lg border flex items-center justify-center gap-1.5 transition-all cursor-pointer hover:bg-[var(--surface-hover)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]"
            >
              <Eye className="w-4 h-4 shrink-0 stroke-current text-current" />
              <span>View</span>
            </button>
          ) : (
            <button
              type="button"
              disabled
              style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)',
                color: 'var(--text-muted)',
              }}
              className="w-full min-h-[42px] px-3.5 font-medium text-xs rounded-lg border flex items-center justify-center gap-1.5 opacity-55 cursor-not-allowed"
            >
              <Lock className="w-3.5 h-3.5 shrink-0" />
              <span>Restricted</span>
            </button>
          )}

          {access.canDownload ? (
            <a
              href={resource.fileUrl}
              download={resource.fileName}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto"
            >
              <button
                type="button"
                style={{
                  backgroundColor: 'var(--brand-primary)',
                  borderColor: 'var(--brand-primary)',
                  color: 'var(--brand-primary-foreground, #FFFFFF)',
                }}
                className="w-full min-h-[42px] px-3.5 font-medium text-xs rounded-lg border flex items-center justify-center gap-1.5 transition-all cursor-pointer hover:opacity-90"
              >
                <Download className="w-4 h-4 shrink-0 stroke-current text-current" />
                <span>Download</span>
              </button>
            </a>
          ) : (
            <button
              type="button"
              disabled
              style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)',
                color: 'var(--text-muted)',
              }}
              className="w-full min-h-[42px] px-3.5 font-medium text-xs rounded-lg border flex items-center justify-center gap-1.5 opacity-55 cursor-not-allowed"
            >
              <Download className="w-4 h-4 shrink-0 stroke-current text-current" />
              <span>Download</span>
            </button>
          )}
        </div>
      </div>

      {viewerOpen && (
        <ResourceViewerModal
          resource={resource}
          onClose={() => setViewerOpen(false)}
          canDownload={access.canDownload}
        />
      )}
    </>
  );
};
