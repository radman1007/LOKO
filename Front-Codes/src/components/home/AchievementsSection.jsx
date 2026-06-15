import React from 'react';
import { HiOutlineLockClosed } from 'react-icons/hi';
import Icon6 from '../../icons/icon6.png';

const AchievementsSection = ({ achievements, colors, isMobile }) => {
  return (
    <div style={{ marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px' }}>
        <img src={Icon6} alt="achievements" style={{ width: '24px', height: '24px' }} />
        <h3 style={{ fontSize: '16px', fontWeight: '700', color: colors.text }}>افتخارات لوکو</h3>
      </div>
      
      <div style={{ display: 'flex', overflowX: 'auto', gap: '12px', scrollbarWidth: 'none', msOverflowStyle: 'none', paddingBottom: '8px' }}>
        {achievements.map((item) => (
          <div
            key={item.id}
            style={{
              minWidth: '100px', width: '100px',
              backgroundColor: colors.cardBg, borderRadius: '16px', padding: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              opacity: item.earned ? 1 : 0.6,
              position: 'relative'
            }}
          >
            <div style={{
              width: '76px', height: '76px', borderRadius: '20px', overflow: 'hidden', 
              backgroundColor: colors.brownLight, marginBottom: '8px', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative'
            }}>
              <img src={item.icon} alt={item.title} style={{ width: '70%', height: '70%', objectFit: 'contain' }} />
              {!item.earned && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <HiOutlineLockClosed size={24} color="white" />
                </div>
              )}
            </div>
            <p style={{ fontSize: '10px', fontWeight: '600', color: colors.text, textAlign: 'center' }}>{item.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AchievementsSection;