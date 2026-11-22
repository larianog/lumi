'use client';

import { ExternalLink, FileText, Maximize2, X } from 'lucide-react';
import { useEffect, useState } from 'react';

type MaterialViewerProps = {
  fileUrl: string;
  mimeType: string;
  fileName: string;
  title?: string;
};

/**
 * Compact "original file" tile (photo thumbnail or PDF icon) that opens the
 * uploaded file in a full-screen modal. The study card shows the extracted
 * questions; the original stays one tap away.
 */
export default function MaterialViewer({ fileUrl, mimeType, fileName, title }: MaterialViewerProps) {
  const [expanded, setExpanded] = useState(false);
  const isPdf = mimeType === 'application/pdf';
  const heading = title || fileName;

  useEffect(() => {
    if (!expanded) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setExpanded(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', closeOnEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, [expanded]);

  return (
    <>
      <button type="button" className="material-file-tile" onClick={() => setExpanded(true)}>
        {isPdf ? (
          <span className="material-file-thumb is-pdf"><FileText size={26} /><small>PDF</small></span>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element -- private, authenticated API file
          <img className="material-file-thumb" src={fileUrl} alt="" loading="lazy" />
        )}
        <span className="material-file-text">
          <strong>Ver arquivo original</strong>
          <small title={fileName}>{fileName}</small>
        </span>
        <Maximize2 className="material-file-open" size={18} aria-hidden="true" />
      </button>

      {expanded && (
        <div className="material-modal-backdrop" role="presentation" onMouseDown={() => setExpanded(false)}>
          <div
            className={`material-modal${isPdf ? ' is-pdf' : ''}`}
            role="dialog"
            aria-modal="true"
            aria-label={heading}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header className="material-modal-header">
              <span className="material-modal-icon"><FileText size={20} /></span>
              <span className="material-modal-title">
                <strong title={heading}>{heading}</strong>
                <small>{fileName}</small>
              </span>
              <a className="material-modal-button" href={fileUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink size={17} /><span>Nova aba</span>
              </a>
              <button type="button" className="material-modal-close" onClick={() => setExpanded(false)} aria-label="Fechar" autoFocus>
                <X size={20} />
              </button>
            </header>
            <div className="material-modal-body">
              {isPdf ? (
                <object className="material-modal-pdf" data={`${fileUrl}#navpanes=0&view=FitH`} type="application/pdf" aria-label={fileName}>
                  <div className="material-modal-fallback">
                    <FileText size={34} />
                    <p>Seu navegador não mostra PDFs aqui.</p>
                    <a className="button button-primary" href={fileUrl} target="_blank" rel="noopener noreferrer">Abrir PDF</a>
                  </div>
                </object>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element -- private, authenticated API file
                <img className="material-modal-image" src={fileUrl} alt={fileName} />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
