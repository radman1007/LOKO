import React, { useState, useEffect, useRef, useCallback } from 'react';
import { HiOutlinePlay } from 'react-icons/hi';
import Icon3 from '../../icons/icon3.png';

const BannerSlider = ({ banners, onBannerPlay, colors, isMobile, isTablet }) => {
  const [currentBanner, setCurrentBanner] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const autoScrollInterval = useRef(null);

  useEffect(() => {
    autoScrollInterval.current = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    
    return () => {
      if (autoScrollInterval.current) clearInterval(autoScrollInterval.current);
    };
  }, [banners.length]);

  const handleTouchStart = useCallback((e) => {
    if (autoScrollInterval.current) clearInterval(autoScrollInterval.current);
    setTouchStart(e.touches[0].clientX);
    setTouchEnd(null);
  }, []);

  const handleTouchMove = useCallback((e) => {
    setTouchEnd(e.touches[0].clientX);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) {
      autoScrollInterval.current = setInterval(() => {
        setCurrentBanner((prev) => (prev + 1) % banners.length);
      }, 5000);
      return;
    }
    
    const diff = touchStart - touchEnd;
    const minSwipeDistance = 50;
    
    if (Math.abs(diff) > minSwipeDistance) {
      if (diff > 0) {
        setCurrentBanner((prev) => (prev + 1) % banners.length);
      } else {
        setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length);
      }
    }
    
    setTouchStart(null);
    setTouchEnd(null);
    
    autoScrollInterval.current = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
  }, [touchStart, touchEnd, banners.length]);

  const currentBannerData = banners[currentBanner];

  return (
    <div style={{
      marginBottom: '28px',
      position: 'relative',
      maxWidth: isMobile ? '100%' : '700px',
      marginLeft: 'auto',
      marginRight: 'auto'
    }}>
      <div 
        style={{ 
          borderRadius: '20px', 
          overflow: 'hidden', 
          cursor: 'grab',
          maxWidth: '100%'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={currentBannerData.src}
          alt={currentBannerData.title}
          style={{
            width: '100%',
            height: isMobile ? '180px' : (isTablet ? '220px' : '260px'),
            objectFit: 'cover',
            display: 'block',
            pointerEvents: 'none'
          }}
        />
        
        <div style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(8px)',
          borderRadius: '30px',
          padding: '6px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          zIndex: 2
        }}>
          <img src={Icon3} alt="coin" style={{ width: '16px', height: '16px' }} />
          <span style={{ color: colors.orange, fontSize: '12px', fontWeight: 'bold' }}>+{currentBannerData.xp}</span>
          <span style={{ color: 'white', fontSize: '10px' }}>XP</span>
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: '30px',
            left: '20px',
            background: colors.primary,
            borderRadius: '30px',
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            zIndex: 10
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onBannerPlay(currentBannerData.src, currentBannerData.videoTitle, currentBannerData.xp);
          }}
        >
          <HiOutlinePlay size={16} color={colors.bg} />
          <span style={{ color: colors.bg, fontSize: '13px', fontWeight: '600' }}>بزن بریم تماشا کنیم</span>
        </div>

        <div style={{
          position: 'absolute',
          bottom: '30px',
          right: '20px',
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(8px)',
          borderRadius: '30px',
          padding: '6px 14px',
          zIndex: 2,
          textAlign: 'center'
        }}>
          <h3 style={{
            color: 'white',
            fontSize: isMobile ? '12px' : '14px',
            fontWeight: 'bold',
            whiteSpace: 'nowrap'
          }}>
            {currentBannerData.title}
          </h3>
        </div>
      </div>
      
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '8px',
        marginTop: '12px'
      }}>
        {banners.map((_, index) => (
          <div
            key={index}
            style={{
              width: currentBanner === index ? '24px' : '8px',
              height: '8px',
              borderRadius: '4px',
              background: currentBanner === index ? colors.primary : 'rgba(255,255,255,0.3)',
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