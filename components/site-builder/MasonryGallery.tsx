
import React from 'react';
import { SiteGalleryItem } from '../../types';
import { motion } from 'framer-motion';

const Motion = motion as any;

interface MasonryGalleryProps {
    images: SiteGalleryItem[];
    onImageClick?: (src: string) => void;
    columns?: number;
    gap?: string;
}

const MasonryGallery: React.FC<MasonryGalleryProps> = ({ images, onImageClick, columns = 3, gap = 'gap-4' }) => {
    return (
        <div className={`columns-1 md:columns-2 lg:columns-${columns} ${gap} space-y-4`}>
            {images.map((img, i) => (
                <Motion.div 
                    key={img.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.5 }}
                    viewport={{ once: true }}
                    className="break-inside-avoid relative group cursor-zoom-in overflow-hidden rounded-lg bg-gray-100"
                    onClick={() => onImageClick && onImageClick(img.url)}
                >
                    <img 
                        src={img.url} 
                        alt={img.caption} 
                        className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                    />
                    {img.caption && (
                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <p className="text-white text-sm font-medium truncate">{img.caption}</p>
                        </div>
                    )}
                </Motion.div>
            ))}
        </div>
    );
};

export default MasonryGallery;
