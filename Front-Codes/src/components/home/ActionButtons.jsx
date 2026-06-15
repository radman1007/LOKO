import React from 'react';

const ActionButtons = ({ buttons, onPress, pressedItem, colors }) => {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '12px',
      marginBottom: '24px'
    }}>
      {buttons.map((item) => (
        <div
          key={item.id}
          onClick={() => onPress(item.path, item.id)}
          style={{
            background: item.bgColor,
            padding: '14px 12px',
            borderRadius: '18px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'transform 0.08s linear, box-shadow 0.2s ease',
            boxShadow: '0 6px 12px rgba(0,0,0,0.08)',
            transform: pressedItem === item.id ? 'scale(0.97)' : 'scale(1)'
          }}
          onMouseEnter={(e) => {
            if (pressedItem !== item.id) {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 12px 20px rgba(0,0,0,0.12)';
            }
          }}
          onMouseLeave={(e) => {
            if (pressedItem !== item.id) {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.08)';
            }
          }}
        >
          <img src={item.icon} alt={item.name} style={{ width: '40px', height: '40px', marginBottom: '8px' }} />
          <div style={{ fontSize: '12px', fontWeight: '500', color: colors.text }}>{item.name}</div>
        </div>
      ))}
    </div>
  );
};

export default ActionButtons;