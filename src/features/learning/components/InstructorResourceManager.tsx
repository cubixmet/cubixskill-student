import React, { useState } from 'react';
import { Upload, Eye, Download, Trash2, Shield, Plus, CheckCircle2, AlertCircle } from 'lucide-react';
import { useResourceStore, type CourseResource, type ResourceScope } from '../../../stores/resource.store';
import { formatFileSize } from '../utils/resourceAccessResolver';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';

interface Props {
  academyUuid: string;
  courseUuid: string;
  lessonUuid?: string;
  scope?: ResourceScope;
}

export const InstructorResourceManager: React.FC<Props> = ({
  academyUuid,
  courseUuid,
  lessonUuid,
  scope = 'lesson',
}) => {
  const resources = useResourceStore((state) => state.resources);
  const addResource = useResourceStore((state) => state.addResource);
  const updateResourcePermissions = useResourceStore((state) => state.updateResourcePermissions);
  const deleteResource = useResourceStore((state) => state.deleteResource);
  const getTotalStorageUsage = useResourceStore((state) => state.getTotalStorageUsage);

  const [title, setTitle] = useState('');
  const [fileName, setFileName] = useState('');
  const [accessMode, setAccessMode] = useState<'view_only' | 'view_download'>('view_only');
  const [uploading, setUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const filteredResources = resources.filter(
    (res) => res.status === 'active' && res.courseUuid === courseUuid && (!lessonUuid || res.lessonUuid === lessonUuid)
  );

  const totalBytes = getTotalStorageUsage(academyUuid);

  const handleAddResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !fileName.trim()) return;

    setUploading(true);
    setTimeout(() => {
      addResource({
        academyUuid,
        courseUuid,
        lessonUuid,
        scope,
        title: title.trim(),
        fileName: fileName.trim(),
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        mimeType: fileName.endsWith('.pdf') ? 'application/pdf' : 'application/zip',
        fileSize: 2048576, // 2 MB
        allowView: true,
        allowDownload: accessMode === 'view_download',
        isDemoAccessible: true,
      });

      setTitle('');
      setFileName('');
      setAccessMode('view_only');
      setUploading(false);
      setSuccessMsg('Resource uploaded and permissions configured.');
      setTimeout(() => setSuccessMsg(null), 3000);
    }, 400);
  };

  return (
    <Card padding="md" className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl shadow-2xs space-y-5 font-sans text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <h3 className="font-extrabold text-sm text-slate-900">Instructor Resource Permissions</h3>
          <p className="text-slate-500 text-[11px]">Configure explicit View and Download permissions for student files</p>
        </div>
        <div className="px-3 py-1 bg-slate-100 rounded-xl font-semibold text-slate-700 text-[11px] shrink-0">
          Storage Used: {formatFileSize(totalBytes)}
        </div>
      </div>

      {/* SUCCESS NOTICE */}
      {successMsg && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* UPLOAD FORM */}
      <form onSubmit={handleAddResource} className="space-y-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-slate-700">Resource Title</label>
            <input
              type="text"
              placeholder="e.g. React 19 Cheatsheet"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-slate-700">File Name / Path</label>
            <input
              type="text"
              placeholder="e.g. react19_cheatsheet.pdf"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              required
            />
          </div>
        </div>

        {/* STUDENT ACCESS RADIO SELECTOR */}
        <div className="space-y-2 pt-1">
          <label className="block text-[11px] font-bold text-slate-800">Student Access Permission</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label
              className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                accessMode === 'view_only'
                  ? 'border-blue-600 bg-blue-50/70 text-blue-950 font-bold ring-2 ring-blue-500/20'
                  : 'border-slate-200 bg-white text-slate-700'
              }`}
            >
              <input
                type="radio"
                name="accessMode"
                value="view_only"
                checked={accessMode === 'view_only'}
                onChange={() => setAccessMode('view_only')}
                className="mt-0.5"
              />
              <div className="space-y-0.5">
                <span className="text-xs font-bold block">View Only (Recommended)</span>
                <span className="text-[10px] text-slate-500 font-normal leading-tight block">
                  Students can view this file in-app, but no Download button is shown.
                </span>
              </div>
            </label>

            <label
              className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                accessMode === 'view_download'
                  ? 'border-blue-600 bg-blue-50/70 text-blue-950 font-bold ring-2 ring-blue-500/20'
                  : 'border-slate-200 bg-white text-slate-700'
              }`}
            >
              <input
                type="radio"
                name="accessMode"
                value="view_download"
                checked={accessMode === 'view_download'}
                onChange={() => setAccessMode('view_download')}
                className="mt-0.5"
              />
              <div className="space-y-0.5">
                <span className="text-xs font-bold block">View + Download</span>
                <span className="text-[10px] text-slate-500 font-normal leading-tight block">
                  Students can open in-browser and download file to local storage.
                </span>
              </div>
            </label>
          </div>
        </div>

        <Button
          type="submit"
          disabled={uploading || !title.trim() || !fileName.trim()}
          leftIcon={<Plus className="w-4 h-4 shrink-0" />}
          className="w-full sm:w-auto font-semibold px-5 min-h-[42px] bg-blue-600 text-white rounded-xl shadow-xs disabled:opacity-50 cursor-pointer"
        >
          {uploading ? 'Adding Resource...' : 'Add Resource'}
        </Button>
      </form>

      {/* RESOURCE LIST MANAGEMENT */}
      <div className="space-y-3">
        <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider">Active Course Resources</h4>
        <div className="space-y-2">
          {filteredResources.map((res) => (
            <div key={res.resourceUuid} className="p-3 bg-white border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5 min-w-0">
                <span className="font-bold text-slate-900 text-xs truncate block">{res.title}</span>
                <span className="text-[10px] text-slate-400 font-medium block">
                  {res.fileName} • {formatFileSize(res.fileSize)}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* PERMISSION TOGGLE BUTTON */}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateResourcePermissions(res.resourceUuid, true, !res.allowDownload)}
                  className={`font-semibold px-3 min-h-[36px] rounded-xl text-[11px] cursor-pointer ${
                    res.allowDownload
                      ? 'border-emerald-300 text-emerald-700 bg-emerald-50/50'
                      : 'border-slate-300 text-slate-700 bg-slate-50'
                  }`}
                >
                  {res.allowDownload ? 'Access: View + Download' : 'Access: View Only'}
                </Button>

                <button
                  type="button"
                  onClick={() => deleteResource(res.resourceUuid)}
                  className="w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center cursor-pointer transition-colors"
                  title="Delete Resource"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};
