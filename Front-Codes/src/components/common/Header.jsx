// src/components/common/Header.jsx
import React from 'react';
import { HiOutlineUser } from 'react-icons/hi';

const Header = ({ title, avatar, isMobile, colors, onProfileClick, pressedItem, setPressedItem }) => {
  return (
    <div style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: colors.cardBg,
      padding: isMobile ? '12px 16px' : '16px 24px',
      borderBottom: `1px solid ${colors.primaryLight}`,
      boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        
        {/* سمت چپ - فقط پروفایل (عکس) */}
        <div
          onClick={onProfileClick}
          style={{
            cursor: 'pointer',
            transition: 'transform 0.05s linear',
            transform: pressedItem === 'profile' ? 'scale(0.97)' : 'scale(1)'
          }}
          onMouseDown={() => setPressedItem('profile')}
          onMouseUp={() => setTimeout(() => setPressedItem(null), 100)}
          onMouseLeave={() => setPressedItem(null)}
        >
          <div style={{
            width: isMobile ? '44px' : '50px',
            height: isMobile ? '44px' : '50px',
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden'
          }}>
            {avatar ? (
              <img src={avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <HiOutlineUser size={isMobile ? 22 : 26} color="white" />
            )}
          </div>
        </div>

        {/* سمت راست - عنوان */}
        <div>
          <h1 style={{ fontSize: isMobile ? '20px' : '26px', fontWeight: '700', color: colors.text, letterSpacing: '-0.5px' }}>
            {title}
          </h1>
        </div>
      </div>
    </div>
  );
};

export default Header;