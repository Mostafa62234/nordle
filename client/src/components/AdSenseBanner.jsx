import React, { useEffect } from 'react';

const AdSenseBanner = () => {
  const pubId = import.meta.env.VITE_ADSENSE_PUB_ID;
  const slotId = import.meta.env.VITE_ADSENSE_SLOT_ID;

  useEffect(() => {
    try {
      if (pubId && slotId && window.adsbygoogle) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (e) {
      console.error('AdSense error:', e);
    }
  }, [pubId, slotId]);

  if (!pubId || !slotId) {
    return (
      <div className="ad-banner">
        <span>AdSense Placeholder (Configure VITE_ADSENSE_PUB_ID and VITE_ADSENSE_SLOT_ID in .env)</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', width: '100%', margin: '10px 0' }}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: '100%', minWidth: '250px', height: '100px' }}
        data-ad-client={pubId}
        data-ad-slot={slotId}
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
    </div>
  );
};

export default AdSenseBanner;
