import React, { useState, useEffect } from 'react';

const BannerSlider = ({ banners, colors, onBannerClick }) => {
  const [currentBanner, setCurrentBanner] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX);
    setTouchEnd(null);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const diff = touchStart - touchEnd;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        setCurrentBanner((prev) => (prev + 1) % banners.length);
      } else {
        setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length);
      }
    }
    setTouchStart(null);
    setTouchEnd(null);
  };

  return (
    <div style={{ marginBottom: '24px', position: 'relative' }}>
      <div 
        style={{ borderRadius: '18px', overflow: 'hidden', cursor: 'grab' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={banners[currentBanner].src}
          alt={banners[currentBanner].title}
          style={{ width: '100%', height: '140px', objectFit: 'cover', display: 'block', pointerEvents: 'none' }}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '10px' }}>
        {banners.map((_, index) => (
          <div
            key={index}
            style={{
              width: currentBanner === index ? '20px' : '6px',
              height: '6px',
              borderRadius: '3px',
              background: currentBanner === index ? colors.primaryDark : '#D0D0D0',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onClick={() => setCurrentBanner(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default BannerSlider;