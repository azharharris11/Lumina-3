
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { SiteConfig, Package, User, SiteGalleryItem, StudioConfig, PublicBookingSubmission, SitePage, SiteSection } from '../../../types';
import BookingWidget from '../BookingWidget';
import MasonryGallery from '../MasonryGallery';
import Lightbox from '../Lightbox';

const Motion = motion as any;

interface ThemeProps {
    site: SiteConfig;
    activePage?: SiteConfig | SitePage;
    packages: Package[];
    users: User[];
    config: StudioConfig;
    onBooking?: (data: PublicBookingSubmission) => void;
    onNavigate?: (pageId: string) => void;
}

const CinemaTheme: React.FC<ThemeProps> = ({ site, activePage, packages, users, config, onBooking, onNavigate }) => {
    const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
    const data = activePage || site;
    const sections = (data as SitePage).sections || [];

    const renderHero = (headline: string, desc: string, img: string) => (
        <section className="h-screen w-full relative flex items-end p-6 md:p-12 overflow-hidden">
            <div className="absolute inset-0 z-0">
                <img src={img} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent"></div>
            </div>
            <div className="relative z-10 max-w-5xl pb-10 md:pb-0">
                <Motion.h1 
                    initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: "easeOut" }} 
                    className="text-[clamp(3rem,6vw,7rem)] font-bold mb-6 tracking-tighter leading-[0.9] text-white drop-shadow-2xl"
                >
                    {headline}
                </Motion.h1>
                <Motion.p 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 1 }} 
                    className="text-lg md:text-2xl text-gray-200 max-w-xl font-light leading-relaxed drop-shadow-md"
                >
                    {desc}
                </Motion.p>
            </div>
        </section>
    );

    const renderSections = () => sections.map((section: SiteSection) => {
        switch(section.type) {
            case 'HERO': return <div key={section.id}>{renderHero(section.content.headline || '', section.content.description || '', section.content.image || '')}</div>;
            case 'TEXT_IMAGE': return (
                <section key={section.id} className="py-20 px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center bg-black">
                    <div className={`aspect-video relative overflow-hidden rounded-lg ${section.content.layout === 'RIGHT' ? 'md:order-2' : 'md:order-1'}`}>
                        <img src={section.content.image} className="w-full h-full object-cover opacity-80" />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent"></div>
                    </div>
                    <div className={`${section.content.layout === 'RIGHT' ? 'md:order-1' : 'md:order-2'}`}>
                        <h2 className="text-3xl md:text-5xl font-bold mb-6 text-blue-500">{section.content.headline}</h2>
                        <p className="text-gray-300 text-lg md:text-xl leading-relaxed font-light">{section.content.description}</p>
                    </div>
                </section>
            );
            case 'GALLERY': return (
                <section key={section.id} className="py-20 px-6 bg-black">
                    <h2 className="text-3xl font-bold mb-12 text-center text-white uppercase tracking-widest">Visual Archives</h2>
                    <MasonryGallery images={site.gallery} onImageClick={setLightboxSrc} columns={3} />
                </section>
            );
            default: return null;
        }
    });

    return (
        <div className="bg-black text-white font-sans min-h-full overflow-x-hidden">
            <nav className="absolute top-0 left-0 right-0 z-50 p-6 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
                <span onClick={() => onNavigate && onNavigate('HOME')} className="font-bold tracking-widest uppercase text-sm cursor-pointer">{site.title}</span>
                <div className="hidden md:flex gap-6 text-xs font-bold uppercase tracking-widest text-gray-400">
                    <button onClick={() => onNavigate && onNavigate('HOME')} className="hover:text-white transition-colors">Home</button>
                    {site.pages?.map(p => (
                        <button key={p.id} onClick={() => onNavigate && onNavigate(p.id)} className="hover:text-white transition-colors">{p.title}</button>
                    ))}
                </div>
            </nav>

            {sections.length > 0 ? renderSections() : renderHero(data.headline, data.description, data.heroImage)}

            {data.showBookingWidget && (
                <div className="py-24 bg-[#0a0a0a] border-t border-white/10" id="booking-widget">
                    <div className="text-center mb-12"><h2 className="text-3xl md:text-4xl font-bold mb-2">Production Schedule</h2></div>
                    <BookingWidget packages={packages} theme="CINEMA" onSubmit={onBooking} />
                </div>
            )}

            <Lightbox isOpen={!!lightboxSrc} imageSrc={lightboxSrc} onClose={() => setLightboxSrc(null)} />
        </div>
    )
}

export default CinemaTheme;
