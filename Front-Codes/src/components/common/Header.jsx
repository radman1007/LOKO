import React from 'react';
import Icon55 from '../../icons/icon55.png';
import icon25 from '../../icons/icon25.png';

const Header = ({ title, avatar, user, colors = {}, rightAction, showGreeting = false, onProfileClick }) => {
  const c = { text: '#1F2544', textSecondary: '#7A819A', bg: '#FFFFFF', ...colors };

  return (
    <div style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      padding: '8px 16px 12px',
      direction: 'rtl'
    }}>
      <div style={{
        width: '100%',
        background: c.bg || '#FFFFFF',
        borderRadius: 28,
        padding: '16px 18px',
        boxShadow: '0 12px 28px rgba(0,0,0,0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxSizing: 'border-box'
      }}>

        {/* ===== سمت راست - پروفایل ===== */}
        <div
          onClick={onProfileClick}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            flex: 1,
            minWidth: 0,
            cursor: onProfileClick ? 'pointer' : 'default'
          }}
        >
          <div style={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #7EE7E1 0%, #63D5D0 100%)',
            boxShadow: '0 10px 20px rgba(90,210,205,0.22)',
            flexShrink: 0
          }}>
            {avatar || user?.avatar ? (
              <img src={avatar || user?.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <img src={icon25} alt="default" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            )}
          </div>

          {user && (
            <div style={{ minWidth: 0 }}>
              <h2 style={{
                margin: 0,
                fontSize: 18,
                fontWeight: 900,
                color: c.text,
                marginBottom: 5,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
              </h2>
              {showGreeting && (
                <p style={{
                  margin: 0,
                  fontSize: 14,
                  fontWeight: 700,
                  color: c.textSecondary
                }}>
                  خوش برگشتی
                </p>
              )}
            </div>
          )}
        </div>

        {/* ===== وسط - عنوان صفحه ===== */}
        {title && (
          <div style={{ flex: 0, textAlign: 'center', padding: '0 8px' }}>
            <h1 style={{
              margin: 0,
              fontSize: 16,
              fontWeight: 800,
              color: c.text,
              whiteSpace: 'nowrap'
            }}>
              {title}
            </h1>
          </div>
        )}

        {/* ===== سمت چپ - فقط اگر rightAction پاس بشه ===== */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          flex: 1,
          minWidth: 0
        }}>
          {rightAction}
        </div>

      </div>
    </div>
  );
};

export default Header;