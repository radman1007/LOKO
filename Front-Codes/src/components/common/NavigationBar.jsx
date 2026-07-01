import React from 'react';

const NavigationBar = ({ navItems, activeNav, setActiveNav, colors, onNavigate, setPressedItem, pressedItem }) => {
  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100%',
      maxWidth: 'min(600px, 100%)', // محدودیت عرض اپلیکیشن
      background: colors.navBg || '#FFFFFF',
      boxShadow: '0 -2px 20px rgba(0,0,0,0.08)',
      borderRadius: '24px 24px 0 0',
      padding: 'clamp(8px, 2vw, 12px) 0',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      zIndex: 100
    }}>
      {navItems.map((item) => {
        const IconComponent = item.icon;
        const isActive = activeNav === item.id;
        return (
          <div
            key={item.id}
            onClick={() => {
              if (setPressedItem) setPressedItem(`nav_${item.id}`);
              setTimeout(() => {
                if (setPressedItem) setPressedItem(null);
                setActiveNav(item.id);
                onNavigate(item.path);
              }, 80);
            }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
              cursor: 'pointer',
              transition: 'transform 0.05s linear',
              transform: pressedItem === `nav_${item.id}` ? 'scale(0.9)' : 'scale(1)',
              padding: '0 8px'
            }}
            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.9)'}
            onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <IconComponent size={20} color={isActive ? (colors.primary || '#4DB6AC') : '#999'} />
            <span style={{ 
              fontSize: 'clamp(8px, 2.5vw, 10px)', 
              color: isActive ? (colors.primary || '#4DB6AC') : '#999', 
              fontWeight: isActive ? '600' : '400' 
            }}>
              {item.name}
            </span>
            {isActive && <div style={{ width: '4px', height: '4px', borderRadius: '2px', background: colors.primary || '#4DB6AC', marginTop: '1px' }} />}
          </div>
        );
      })}
    </div>
  );
};

export default NavigationBar;