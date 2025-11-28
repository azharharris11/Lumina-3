
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface SitePreviewFrameProps {
  children: React.ReactNode;
  className?: string;
}

const SitePreviewFrame: React.FC<SitePreviewFrameProps> = ({ children, className }) => {
  const [contentRef, setContentRef] = useState<HTMLIFrameElement | null>(null);
  const mountNode = contentRef?.contentWindow?.document?.body;

  useEffect(() => {
    if (!contentRef?.contentWindow) return;

    const doc = contentRef.contentWindow.document;
    
    // Performance Fix: Clone Parent Styles directly instead of fetching CDN
    // This prevents Flash of Unstyled Content (FOUC) and works offline
    const parentHeadHtml = window.document.head.innerHTML;
    
    // Clone all style/script tags from parent to iframe
    doc.head.innerHTML = parentHeadHtml;

    // Additional Basic Reset for Iframe Context
    const style = doc.createElement('style');
    style.innerHTML = `
      body { margin: 0; overflow-x: hidden; background-color: #fff; }
      * { box-sizing: border-box; }
      /* Inherit scrollbar styles from app */
      ::-webkit-scrollbar { width: 6px; }
      ::-webkit-scrollbar-track { background: #1c1917; }
      ::-webkit-scrollbar-thumb { background: #292524; border-radius: 3px; }
    `;
    doc.head.appendChild(style);

  }, [contentRef]);

  return (
    <iframe
      ref={setContentRef}
      className={className}
      title="Site Preview"
      style={{ border: 'none', width: '100%', height: '100%' }}
    >
      {mountNode && createPortal(children, mountNode)}
    </iframe>
  );
};

export default SitePreviewFrame;
