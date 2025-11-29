
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
    
    // CLEAN INJECTION: Only copy essential styles, not the entire app head
    // This prevents conflicting React scripts and unnecessary overhead
    
    // 1. Clear existing head (if any from previous renders)
    doc.head.innerHTML = '';

    // 2. Inject Tailwind CDN (matches index.html)
    const tailwindScript = doc.createElement('script');
    tailwindScript.src = "https://cdn.tailwindcss.com";
    doc.head.appendChild(tailwindScript);

    // 3. Inject Google Fonts (matches index.html)
    const fontPreconnect1 = doc.createElement('link');
    fontPreconnect1.rel = 'preconnect';
    fontPreconnect1.href = 'https://fonts.googleapis.com';
    doc.head.appendChild(fontPreconnect1);

    const fontPreconnect2 = doc.createElement('link');
    fontPreconnect2.rel = 'preconnect';
    fontPreconnect2.href = 'https://fonts.gstatic.com';
    fontPreconnect2.crossOrigin = 'anonymous';
    doc.head.appendChild(fontPreconnect2);

    const fontLink = doc.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Syne:wght@400;600;700;800&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap';
    doc.head.appendChild(fontLink);

    // 4. Basic Reset for Iframe Context
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
