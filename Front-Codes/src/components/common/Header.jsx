import React from 'react';
import icon25 from '../../icons/icon25.png';

/*
  هدر یکپارچه‌ی سایت — استایل ثابت و مستقل از تم هر صفحه.
  در صفحات خانه، کلاب، سلامت و پروفایل با ظاهر کاملاً یکسان استفاده می‌شود.

  props:
    title        عنوان وسط هدر (h1)
    user         برای نمایش «سلام {نام}»
    showGreeting نمایش «سلام {نام}» + «خوش برگشتی»
    avatar       آدرس آواتار (در نبود، آواتار پیش‌فرض)
    rightAction  المان سمت چپ هدر (دکمه/بج)
    leftAction   معادل rightAction (سازگاری با فراخوان‌های قدیمی)
    onProfileClick کلیک روی آواتار
*/

// رنگ‌ها و اندازه‌های ثابتِ هدر (یک هویت بصری واحد در همه‌ی صفحات)
const HC = {
  bg: '#FFFFFF',
  title: '#1F2544',
  name: '#1F2544',
  sub: '#7A819A',
};

const Header = ({
  title,
  user,
  showGreeting = false,
  avatar,
  rightAction,
  leftAction,
  onProfileClick,
}) => {
  const action = rightAction || leftAction || null;
  const username = user?.firstName || user?.username?.replace('@', '') || '';

  return (
    <div style={{ position: 'sticky', top: 0, zIndex: 100, padding: '8px 16px 12px', direction: 'rtl' }}>
      <div
        style={{
          width: '100%',
          background: HC.bg,
          borderRadius: 28,
          padding: '14px 18px',
          boxShadow: '0 12px 28px rgba(0,0,0,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxSizing: 'border-box',
          minHeight: 76,
        }}
      >
        {/* ===== سمت راست: آواتار + خوش‌آمد ===== */}
        <div
          onClick={onProfileClick}
          style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0, cursor: onProfileClick ? 'pointer' : 'default' }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              overflow: 'hidden',
              background: 'linear-gradient(135deg, #7EE7E1 0%, #63D5D0 100%)',
              boxShadow: '0 10px 20px rgba(90,210,205,0.22)',
              flexShrink: 0,
            }}
          >
            <img src={avatar || user?.avatar || user?.avatarUrl || icon25} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>

          {showGreeting && (
            <div style={{ minWidth: 0 }}>
              <h2 style={{ margin: 0, color: HC.name, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                سلام {username || 'دوست من'}
              </h2>
              <p style={{ margin: '4px 0 0', fontSize: 13, fontWeight: 700, color: HC.sub }}>خوش برگشتی</p>
            </div>
          )}
        </div>

        {/* ===== وسط: عنوان صفحه ===== */}
        {title && (
          <div style={{ flex: 0, textAlign: 'center', padding: '0 8px' }}>
            <h1 style={{ margin: 0, color: HC.title, whiteSpace: 'nowrap' }}>{title}</h1>
          </div>
        )}

        {/* ===== سمت چپ: اکشن ===== */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', flex: 1, minWidth: 0 }}>
          {action}
        </div>
      </div>
    </div>
  );
};

export default Header;
