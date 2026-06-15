import React from 'react';

const NavigationBar = ({ navItems, activeNav, setActiveNav, isMobile, colors, onNavigate, setPressedItem, pressedItem }) => {
  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      right: 0,
      left: 0,
      background: colors.navBg,
      boxShadow: '0 -2px 20px rgba(0,0,0,0.08)',
      borderRadius: '28px 28px 0 0',
      padding: isMobile ? '10px 12px' : '12px 20px',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      zIndex: 100,
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      {navItems.map((item) => {
        const IconComponent = item.icon;
        const isActive = activeNav === item.id;
        return (
          <div
            key={item.id}
            onClick={() => {
              setPressedItem(`nav_${item.id}`);
              setTimeout(() => {
                setPressedItem(null);
                setActiveNav(item.id);
                onNavigate(item.path);
              }, 80);
            }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
              transition: 'transform 0.05s linear',
              transform: pressedItem === `nav_${item.id}` ? 'scale(0.92)' : 'scale(1)'
            }}
          >
            <IconComponent size={isMobile ? 20 : 22} color={isActive ? colors.primary : '#999'} />
            <span style={{ fontSize: isMobile ? '9px' : '10px', color: isActive ? colors.primary : '#999', fontWeight: isActive ? '600' : '400' }}>
              {item.name}
            </span>
            {isActive && <div style={{ width: '4px', height: '4px', borderRadius: '2px', background: colors.primary, marginTop: '2px' }} />}
          </div>
        );
      })}
    </div>
  );
};

export default NavigationBar;