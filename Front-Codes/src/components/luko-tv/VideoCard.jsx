import React from 'react';
import { HiOutlinePlay, HiOutlineClock } from 'react-icons/hi';

const VideoCard = ({ 
  item, 
  showProgress = false, 
  isVideo = false, 
  alreadyWatched = false,
  onPlay,
  colors,
  isMobile 
}) => {
  const savedProgress = localStorage.getItem(`video_progress_${item.title}`);
  const displayProgress = showProgress ? (item.progress || parseInt(savedProgress) || 0) : 0;
  
  const handleCardClick = () => {
    if (isVideo && item.video) {
      onPlay(item.video, item.videoTitle || item.title, item.xp);
    }
  };
  
  return (
    <div 
      onClick={handleCardClick}
      style={{
        minWidth: isMobile ? '140px' : '180px',
        width: isMobile ? '140px' : '180px',
        cursor: isVideo && item.video ? 'pointer' : 'default',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
        opacity: alreadyWatched ? 0.6 : 1,
        position: 'relative'
      }}
      onMouseEnter={(e) => {
        if (isVideo && item.video && !alreadyWatched) {
          e.currentTarget.style.transform = 'translateY(-5px)';
          e.currentTarget.style.boxShadow = '0 12px 25px rgba(0,0,0,0.3)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
      }}
    >
      <div style={{
        position: 'relative',
        width: '100%',
        height: isMobile ? '100px' : '130px',
        backgroundColor: '#1a1a3a',
        overflow: 'hidden',
        borderRadius: '16px'
      }}>
        {isVideo && item.video ? (
          <video
            src={item.video}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
            preload="metadata"
          />
        ) : (
          <img
            src={item.image}
            alt={item.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        )}
        
        {isVideo && item.video && !alreadyWatched && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: isMobile ? '40px' : '50px',
            height: isMobile ? '40px' : '50px',
            borderRadius: '50%',
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <HiOutlinePlay size={isMobile ? 24 : 30} color="white" />
          </div>
        )}

        {alreadyWatched && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(0,0,0,0.7)',
            borderRadius: '20px',
            padding: '4px 12px',
            whiteSpace: 'nowrap'
          }}>
            <span style={{ color: colors.primary, fontSize: '12px', fontWeight: 'bold' }}>✓ دیده شد</span>
          </div>
        )}

        <div style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          borderRadius: '12px',
          padding: '2px 6px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <HiOutlineClock size={10} color="white" />
          <span style={{ fontSize: '10px', color: 'white' }}>{item.duration}</span>
        </div>

        <div style={{
          position: 'absolute',
          bottom: '8px',
          right: '8px',
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          borderRadius: '12px',
          padding: '2px 6px'
        }}>
          <span style={{
            fontSize: '9px',
            color: alreadyWatched ? colors.textSecondary : colors.primary,
            fontWeight: 'bold'
          }}>
            {alreadyWatched ? '✓ دریافت شد' : `+${item.xp} XP`}
          </span>
        </div>

        {showProgress && displayProgress > 0 && (
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: 'rgba(255,255,255,0.3)'
          }}>
            <div style={{
              width: `${displayProgress}%`,
              height: '100%',
              background: colors.primary,
              borderRadius: '2px'
            }} />
          </div>
        )}
      </div>

      <div style={{
        padding: '8px 4px',
        textAlign: 'right'
      }}>
        <p style={{
          fontSize: isMobile ? '12px' : '13px',
          fontWeight: '600',
          color: colors.text,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {item.title}
        </p>
      </div>
    </div>
  );
};

export default VideoCard;