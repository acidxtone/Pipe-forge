import React, { useEffect, useState } from 'react';
import { createPageUrl } from '@/utils';

/**
 * Google AdSense Component
 * Displays Google AdSense ads with proper configuration
 */
const AdSense = ({ 
  slot, 
  className = "", 
  style = {},
  format = "auto",
  fullWidthResponsive = true 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load AdSense script if not already loaded
    if (!window.adsbygoogle) {
      const script = document.createElement('script');
      script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
      script.async = true;
      script.crossOrigin = 'anonymous';
      
      script.onload = () => {
        setIsLoaded(true);
      };
      
      document.head.appendChild(script);
    } else {
      setIsLoaded(true);
    }
  }, []);

  if (!isLoaded) {
    return (
      <div 
        className={`bg-gray-100 border border-gray-200 rounded-lg p-4 animate-pulse ${className}`}
        style={{ minHeight: '250px', ...style }}
      >
        <div className="text-center text-gray-500 text-sm">
          Loading advertisement...
        </div>
      </div>
    );
  }

  return (
    <div className={`adsense-container ${className}`} style={style}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXXXXXXXXXX" // Replace with your AdSense client ID
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={fullWidthResponsive ? 'true' : 'false'}
      />
    </div>
  );
};

/**
 * Banner Ad Component
 * For header, footer, and sidebar placements
 */
export const BannerAd = ({ position = 'top' }) => {
  const adSlots = {
    top: 'XXXXXXXXXX', // Replace with actual slot ID
    bottom: 'XXXXXXXXXX', // Replace with actual slot ID
    sidebar: 'XXXXXXXXXX'  // Replace with actual slot ID
  };

  return (
    <div className={`w-full flex justify-center my-4 ${position === 'sidebar' ? 'my-6' : ''}`}>
      <AdSense 
        slot={adSlots[position]}
        className="w-full max-w-7xl mx-auto"
        style={{ minHeight: position === 'sidebar' ? '600px' : '90px' }}
      />
    </div>
  );
};

/**
 * In-Content Ad Component
 * For placement within study materials and quiz pages
 */
export const InContentAd = ({ slot = 'XXXXXXXXXX' }) => {
  return (
    <div className="my-6 flex justify-center">
      <AdSense 
        slot={slot}
        className="w-full max-w-2xl"
        style={{ minHeight: '250px' }}
      />
    </div>
  );
};

/**
 * Responsive Ad Component
 * Adapts to different screen sizes
 */
export const ResponsiveAd = ({ slot = 'XXXXXXXXXX' }) => {
  return (
    <div className="w-full flex justify-center my-4">
      <AdSense 
        slot={slot}
        className="w-full max-w-4xl"
        format="rectangle"
        fullWidthResponsive={true}
      />
    </div>
  );
};

export default AdSense;
