import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { HiOutlineHome, HiOutlineUser, HiOutlineFire, HiOutlinePlay, HiOutlineHeart, HiOutlineBookOpen } from 'react-icons/hi';
import BookIcon from '../icons/icon7.png';
import BookCover1 from '../icons/icon30.png';
import BookCover2 from '../icons/icon31.png';
import BookCover3 from '../icons/icon32.png';
import BookCover4 from '../icons/icon33.png';
import BookCover5 from '../icons/icon34.png';
import BookCover6 from '../icons/icon35.png';

const Books = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [pressedItem, setPressedItem] = useState(null);

  useEffect(() => { document.title = 'LocoLearn - کتاب‌ها'; }, []);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;
  const isDesktop = windowWidth >= 1024;

  const colors = { primary: '#4DB6AC', primaryDark: '#80CBC4', bg: '#E8F5E9', cardBg: '#FFFFFF', text: '#455A64', navBg: '#FFFFFF' };

  const books = [
    { id: 1, title: 'ریاضی اول', cover: BookCover1 },
    { id: 2, title: 'علوم اول', cover: BookCover2 },
    { id: 3, title: 'فارسی اول', cover: BookCover3 },
    { id: 4, title: 'قرآن اول', cover: BookCover4 },
    { id: 5, title: 'هدیه‌ها اول', cover: BookCover5 },
    { id: 6, title: 'کار و فناوری', cover: BookCover6 }
  ];

  const navItems = [
    { id: 'خانه', name: 'خانه', icon: HiOutlineHome, path: '/' },
    { id: 'لوکو کلاب', name: 'کلاب', icon: HiOutlineFire, path: '/luko-club' },
    { id: 'لوکو تلویزیون', name: 'تلویزیون', icon: HiOutlinePlay, path: '/entertainment' },
    { id: 'لوکو سلامت', name: 'سلامت', icon: HiOutlineHeart, path: '/luko-health' },
    { id: 'پروفایل', name: 'پروفایل', icon: HiOutlineUser, path: '/profile' }
  ];

  const handleClick = (path, id) => {
    setPressedItem(id);
    setTimeout(() => { setPressedItem(null); navigate(path); }, 100);
  };

  return (
    <div style={{ minHeight: '100vh', background: colors.bg, fontFamily: "'Shoor', 'Shoor Rounded', sans-serif", direction: 'rtl', paddingBottom: '80px' }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 100, background: colors.cardBg, padding: isMobile ? '16px 16px' : '20px 24px', borderBottom: `1px solid ${colors.primary}30`, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', maxWidth: isDesktop ? '1200px' : '100%', margin: '0 auto' }}>
          <img src={BookIcon} alt="books" style={{ width: '28px', height: '28px' }} />
          <h1 style={{ fontSize: isMobile ? '18px' : '24px', fontWeight: '700', color: colors.text }}>کتاب‌های من</h1>
        </div>
      </div>

      <div style={{ maxWidth: isDesktop ? '1200px' : '100%', margin: '0 auto', padding: isMobile ? '20px 16px' : '32px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', gap: '20px' }}>
          {books.map((book) => (
            <div key={book.id} onClick={() => handleClick(`/book/${book.id}`, book.id)} style={{ cursor: 'pointer', transition: 'transform 0.08s linear', transform: pressedItem === book.id ? 'scale(0.97)' : 'scale(1)' }}>
              <div style={{ background: colors.cardBg, borderRadius: '20px', padding: '16px', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <div style={{ width: '100%', aspectRatio: '2/3', borderRadius: '16px', overflow: 'hidden', marginBottom: '12px', backgroundColor: colors.primary + '20' }}>
                  <img src={book.cover} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <p style={{ fontSize: '14px', fontWeight: '600', color: colors.text }}>{book.title}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ position: 'fixed', bottom: 0, right: 0, left: 0, background: colors.navBg, boxShadow: '0 -2px 20px rgba(0,0,0,0.08)', borderRadius: '28px 28px 0 0', padding: isMobile ? '10px 12px' : '12px 20px', display: 'flex', justifyContent: 'space-around', alignItems: 'center', zIndex: 100 }}>
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = item.id === 'کتاب‌ها';
          return (
            <div key={item.id} onClick={() => handleClick(item.path, `nav_${item.id}`)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer', transition: 'transform 0.05s linear' }}>
              <IconComponent size={isMobile ? 20 : 22} color={isActive ? colors.primary : '#999'} />
              <span style={{ fontSize: isMobile ? '9px' : '10px', color: isActive ? colors.primary : '#999', fontWeight: isActive ? '600' : '400' }}>{item.name}</span>
              {isActive && <div style={{ width: '4px', height: '4px', borderRadius: '2px', background: colors.primary, marginTop: '2px' }} />}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Books;