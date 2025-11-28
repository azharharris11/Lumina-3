
import React, { useState, useEffect, useRef } from 'react';
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
    
    // Inject Tailwind CSS
    const script = doc.createElement('script');
    script.src = "https://cdn.tailwindcss.com";
    doc.head.appendChild(script);

    // Inject Fonts
    const fontLink = doc.createElement('link');
    fontLink.href = "https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600&family=Syne:wght@400;600;700;800&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap";
    fontLink.rel = "stylesheet";
    doc.head.appendChild(fontLink);

    // Basic Styles reset
    const style = doc.createElement('style');
    style.innerHTML = `
      body { margin: 0; overflow-x: hidden; }
      * { box-sizing: border-box; }
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
