import React, { useState } from 'react';

const MoodModal = ({ isOpen, moodOptions, onSelectMood, onDismiss }) => {
  const [selectedMood, setSelectedMood] = useState(null);

  if (!isOpen) return null;

  const handleMoodSelect = (mood) => {
    setSelectedMood(mood.id);
    setTimeout(() => {
      onSelectMood(mood);
    }, 300);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(8px)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      animation: 'fadeIn 0.3s ease'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '32px',
        padding: '32px 24px',
        maxWidth: '90%',
        width: '320px',
        textAlign: 'center',
        position: 'relative'
      }}>
        <button
          onClick={onDismiss}
          style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            background: 'transparent',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            color: '#999'
          }}
        >
          ✕
        </button>
        
        <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#455A64', marginBottom: '8px' }}>
          💚 حال خوب
        </h3>
        <p style={{ fontSize: '14px', color: '#78909C', marginBottom: '24px' }}>
          امروز حالت چطوره؟
        </p>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginBottom: '24px' }}>
          {moodOptions.map((mood) => (
            <div
              key={mood.id}
              onClick={() => handleMoodSelect(mood)}
              style={{
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                transform: selectedMood === mood.id ? 'scale(1.1)' : 'scale(1)'
              }}
            >
              <img src={mood.icon} alt={mood.label} style={{ width: '60px', height: '60px' }} />
              <span style={{
                fontSize: '12px',
                fontWeight: '500',
                color: selectedMood === mood.id ? '#4DB6AC' : '#455A64',
                display: 'block',
                marginTop: '8px'
              }}>
                {mood.label}
              </span>
            </div>
          ))}
        </div>
        
        <p style={{ fontSize: '11px', color: '#B0BEC5' }}>این کار فقط چند ثانیه وقت می‌گیره</p>
      </div>
      
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default MoodModal;