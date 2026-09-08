import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import {
  ZoomIn,
  ZoomOut,
  Maximize,
  RotateCw,
  Download,
  Printer,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

// Configure PDF.js Global Worker
if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
}

interface PdfJsViewerProps {
  blob: Blob | null;
  filename?: string;
  onDownload?: () => void;
  onPrint?: () => void;
}

export const PdfJsViewer: React.FC<PdfJsViewerProps> = ({
  blob,
  filename = 'certificate.pdf',
  onDownload,
  onPrint,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [pageNum, setPageNum] = useState<number>(1);
  const [numPages, setNumPages] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load Document from Blob
  useEffect(() => {
    let isMounted = true;
    if (!blob) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const loadPdf = async () => {
      try {
        const arrayBuffer = await blob.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const doc = await loadingTask.promise;

        if (isMounted) {
          setPdfDoc(doc);
          setNumPages(doc.numPages);
          setPageNum(1);
          setIsLoading(false);
        }
      } catch (err: any) {
        console.error('[PdfJsViewer] Failed to parse PDF document:', err);
        if (isMounted) {
          setError('Unable to render PDF document.');
          setIsLoading(false);
        }
      }
    };

    loadPdf();

    return () => {
      isMounted = false;
    };
  }, [blob]);

  // Render Current Page to Canvas
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;

    let renderTask: any = null;

    const renderPage = async () => {
      try {
        const page = await pdfDoc.getPage(pageNum);
        const viewport = page.getViewport({ scale, rotation });

        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        if (!context) return;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext: any = {
          canvasContext: context,
          viewport,
          canvas,
        };

        renderTask = page.render(renderContext);
        await renderTask.promise;
      } catch (err: any) {
        if (err?.name !== 'RenderingCancelledException') {
          console.warn('[PdfJsViewer] Render warning:', err);
        }
      }
    };

    renderPage();

    return () => {
      if (renderTask) {
        renderTask.cancel();
      }
    };
  }, [pdfDoc, pageNum, scale, rotation]);

  // Zoom Controls
  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.25, 3.0));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.25, 0.5));
  const handleFitWidth = () => setScale(1.0);
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  // Fullscreen Handler
  const handleFullscreen = () => {
    if (containerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        containerRef.current.requestFullscreen();
      }
    }
  };

  // Print Handler
  const handlePrintAction = () => {
    if (onPrint) {
      onPrint();
    } else if (blob) {
      const url = URL.createObjectURL(blob);
      const printWindow = window.open(url, '_blank');
      if (printWindow) {
        printWindow.focus();
        printWindow.print();
      }
    }
  };

  // Download Handler
  const handleDownloadAction = () => {
    if (onDownload) {
      onDownload();
    } else if (blob) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    }
  };

  return (
    <div
      ref={containerRef}
      style={{
        backgroundColor: 'var(--surface)',
        borderColor: 'var(--border)',
        color: 'var(--text-primary)',
      }}
      className="w-full h-full flex flex-col rounded-xl border overflow-hidden font-sans box-border"
    >
      {/* THEME-AWARE CUSTOM PDF TOOLBAR */}
      <div
        style={{
          backgroundColor: 'var(--surface-secondary)',
          borderColor: 'var(--border)',
        }}
        className="flex items-center justify-between gap-2 px-3 py-2 border-b shrink-0 text-xs select-none overflow-x-auto"
      >
        {/* PAGE NAVIGATION */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            disabled={pageNum <= 1}
            onClick={() => setPageNum((prev) => Math.max(prev - 1, 1))}
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)',
            }}
            className="p-1.5 rounded-lg border hover:bg-[var(--surface-hover)] disabled:opacity-40 transition-colors cursor-pointer disabled:cursor-not-allowed"
            title="Previous Page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span style={{ color: 'var(--text-secondary)' }} className="font-semibold text-xs px-1">
            {pageNum} / {numPages}
          </span>
          <button
            type="button"
            disabled={pageNum >= numPages}
            onClick={() => setPageNum((prev) => Math.min(prev + 1, numPages))}
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)',
            }}
            className="p-1.5 rounded-lg border hover:bg-[var(--surface-hover)] disabled:opacity-40 transition-colors cursor-pointer disabled:cursor-not-allowed"
            title="Next Page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* ZOOM & ROTATE CONTROLS */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={handleZoomOut}
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)',
            }}
            className="p-1.5 rounded-lg border hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <span
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
              color: 'var(--text-secondary)',
            }}
            className="px-2 py-1 rounded-lg border text-xs font-mono font-medium"
          >
            {Math.round(scale * 100)}%
          </span>

          <button
            type="button"
            onClick={handleZoomIn}
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)',
            }}
            className="p-1.5 rounded-lg border hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleFitWidth}
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)',
            }}
            className="p-1.5 rounded-lg border hover:bg-[var(--surface-hover)] transition-colors cursor-pointer hidden sm:inline-flex"
            title="Fit Width"
          >
            <Maximize className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleRotate}
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)',
            }}
            className="p-1.5 rounded-lg border hover:bg-[var(--surface-hover)] transition-colors cursor-pointer hidden sm:inline-flex"
            title="Rotate Page"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>

        {/* ACTIONS (PRINT / DOWNLOAD / FULLSCREEN) */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleFullscreen}
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)',
            }}
            className="p-1.5 rounded-lg border hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"
            title="Toggle Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handlePrintAction}
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)',
            }}
            className="p-1.5 rounded-lg border hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"
            title="Print Certificate"
          >
            <Printer className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleDownloadAction}
            style={{
              backgroundColor: 'var(--brand-primary)',
              borderColor: 'var(--brand-primary)',
              color: 'var(--brand-primary-foreground, #FFFFFF)',
            }}
            className="px-3 py-1.5 rounded-lg border font-semibold inline-flex items-center gap-1.5 transition-opacity hover:opacity-90 cursor-pointer"
            title="Download PDF"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Download</span>
          </button>
        </div>
      </div>

      {/* CANVAS DISPLAY SHELL */}
      <div
        style={{
          backgroundColor: 'color-mix(in srgb, var(--surface-secondary) 80%, black 20%)',
        }}
        className="flex-1 overflow-auto p-4 flex items-center justify-center relative min-h-[300px]"
      >
        {isLoading ? (
          <div className="flex flex-col items-center gap-2" style={{ color: 'var(--text-muted)' }}>
            <RefreshCw className="w-8 h-8 animate-spin" style={{ color: 'var(--brand-primary)' }} />
            <span className="text-xs font-semibold">Rendering Certificate PDF...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-2 text-rose-500 text-center p-4">
            <AlertCircle className="w-8 h-8" />
            <span className="text-xs font-semibold">{error}</span>
          </div>
        ) : (
          <canvas
            ref={canvasRef}
            className="shadow-2xl rounded-sm transition-all max-w-full block"
          />
        )}
      </div>
    </div>
  );
};
