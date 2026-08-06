import React from 'react';
import { useParams } from 'react-router-dom';
import { Download, FileText } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { useAcademyStore } from '../../../stores/academy.store';

export const DownloadsPage: React.FC = () => {
  const { academyUuid = '550e8400-e29b-41d4-a716-446655440000' } = useParams<{ academyUuid?: string }>();
  const academies = useAcademyStore((state) => state.academies);
  const academy = academies.find((a) => a.uuid === academyUuid);
  const theme = academy?.theme || { primaryColor: '#2563EB', primarySoft: '#EFF6FF' };

  const downloads = [
    { name: 'React_19_Architecture_Cheatsheet.pdf', size: '2.4 MB', type: 'PDF Document', module: 'Module 1' },
    { name: 'Zustand_Persist_Boilerplate.zip', size: '4.8 MB', type: 'ZIP Archive', module: 'Module 2' },
    { name: 'Optimistic_Updates_Source_Code.zip', size: '1.2 MB', type: 'ZIP Archive', module: 'Module 3' },
  ];

  return (
    <div className="space-y-6 font-sans text-xs text-left max-w-4xl mx-auto hide-scrollbar">
      <Card padding="md" className="bg-white border border-slate-200/80 shadow-2xs">
        <h1 className="text-2xl sm:text-[28px] font-bold text-slate-900 tracking-tight leading-tight">Course Resources &amp; Downloads</h1>
        <p className="text-[13px] sm:text-sm text-slate-500 font-normal mt-1">
          Download course PDFs, exercise files, source code repositories, and cheat sheets.
        </p>
      </Card>

      <div className="space-y-3">
        {downloads.map((file, idx) => (
          <Card key={idx} padding="md" className="bg-white border border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: theme.primarySoft || '#EFF6FF', color: theme.primaryColor }}
              >
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <span className="font-semibold text-xs text-slate-900 block">{file.name}</span>
                <span className="text-[10px] text-slate-400 font-mono">{file.module} • {file.size} • {file.type}</span>
              </div>
            </div>

            <Button size="sm" variant="outline" leftIcon={<Download className="w-3.5 h-3.5" />} className="font-semibold">
              Download
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
};
