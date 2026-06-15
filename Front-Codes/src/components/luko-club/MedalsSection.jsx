import React from 'react';
import { HiOutlineLockClosed } from 'react-icons/hi';

const MedalsSection = ({ medals, colors, isMobile }) => {
  const firstRowMedals = medals.slice(0, 4);
  const secondRowMedals = medals.slice(4, 8);

  const MedalItem = ({ medal }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      <div style={{
        width: isMobile ? '65px' : '75px',
        height: isMobile ? '65px' : '75px',
        borderRadius: '20px',
        backgroundColor: medal.earned ? colors.medalUnlockedBg : colors.medalLockedBg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
      }}>
        <img src={medal.icon} alt={medal.name} style={{ width: '45%', height: '45%', objectFit: 'contain' }} />
        {!medal.earned && (
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
            <HiOutlineLockClosed size={isMobile ? 18 : 22} color="white" />
          </div>
        )}
      </div>
      <p style={{ fontSize: isMobile ? '10px' : '11px', fontWeight: '500', color: colors.text, textAlign: 'center' }}>
        {medal.name}
      </p>
      {!medal.earned && (
        <p style={{ fontSize: '8px', color: colors.textSecondary, textAlign: 'center' }}>
          {medal.xpRequired} XP
        </p>
      )}
    </div>
  );

  return (
    <div style={{ marginTop: '32px' }}>
      <h3 style={{ fontSize: '18px', fontWeight: '700', color: colors.text, marginBottom: '16px' }}>مدال‌های من</h3>
      <div style={{
        backgroundColor: colors.cardBg,
        borderRadius: '20px',
        padding: '16px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.04)'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '16px' }}>
          {firstRowMedals.map((medal) => (
            <MedalItem key={medal.id} medal={medal} />
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
          {secondRowMedals.map((medal) => (
            <MedalItem key={medal.id} medal={medal} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MedalsSection;