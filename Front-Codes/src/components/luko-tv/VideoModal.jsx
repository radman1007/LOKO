import React from 'react';
import { HiOutlineX } from 'react-icons/hi';

const VideoModal = ({ isOpen, videoSrc, videoTitle, videoXp, colors, onClose, onVideoEnded }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.95)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column'
    }} onClick={onClose}>
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        zIndex: 1001,
        cursor: 'pointer',
        background: 'rgba(255,255,255,0.2)',
        borderRadius: '50%',
        padding: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }} onClick={onClose}>
        <HiOutlineX size={24} color="white" />
      </div>
      
      <div style={{
        width: '90%',
        maxWidth: '1000px',
        position: 'relative',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 30px 60px rgba(0,0,0,0.5)'
      }} onClick={(e) => e.stopPropagation()}>
        <video
          src={videoSrc}
          controls
          autoPlay
          onEnded={onVideoEnded}
          style={{
            width: '100%',
            display: 'block'
          }}
        />
      </div>
      
      <p style={{
        color: 'white',
        textAlign: 'center',
        marginTop: '20px',
        fontSize: '18px',
        fontWeight: '600'
      }}>
        {videoTitle}
      </p>
      
      <p style={{
        color: colors.primary,
        textAlign: 'center',
        marginTop: '10px',
        fontSize: '14px'
      }}>
        پس از اتمام ویدیو، +{videoXp} XP دریافت می‌کنید
      </p>
    </div>
  );
};

export default VideoModal;