import React from 'react';
import { HiOutlineLockClosed } from 'react-icons/hi';
import Icon6 from '../../icons/icon6.png';

const AchievementsSection = ({ achievements, colors, isMobile }) => {
  return (
    <div style={{ marginBottom: 24, direction: 'rtl', marginTop: 26 }}>
      
      {/* HEADER - کاملاً هماهنگ */}
      <div style={{ display: 'flex', flexDirection: 'column', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <img src={Icon6} alt="achievements" style={{ width: 22, height: 22, objectFit: 'contain', flexShrink: 0 }} />
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#1F2544' }}>
            افتخارات لوکو
          </h3>
        </div>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: '#7B8199', paddingRight: 30 }}>
          مدال‌ها و افتخاراتت رو ببین
        </p>
      </div>
      
      <div style={{ display: 'flex', overflowX: 'auto', gap: '12px', scrollbarWidth: 'none', msOverflowStyle: 'none', paddingBottom: '8px' }}>
        {achievements.map((item) => (
          <div key={item.id} style={{ minWidth: '100px', width: '100px', backgroundColor: colors.cardBg, borderRadius: '16px', padding: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', opacity: item.earned ? 1 : 0.6, position: 'relative' }}>
            <div style={{ width: '76px', height: '76px', borderRadius: '20px', overflow: 'hidden', backgroundColor: colors.brownLight, marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <img src={item.icon} alt={item.title} style={{ width: '70%', height: '70%', objectFit: 'contain' }} />
              {!item.earned && (
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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