import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { HiOutlineHome, HiOutlineUser, HiOutlineFire, HiOutlinePlay, HiOutlineHeart } from 'react-icons/hi';
import { bookService } from '../services/book.service';
import { clubService } from '../services/task.service';
import { GUEST_BOOKS, GUEST_CLASSES, getGuestCoins } from '../data/guestData';
import Toast from '../components/common/Toast';
import BookIcon from '../icons/icon7.png';
import BookCover1 from '../icons/icon30.png';
import BookCover2 from '../icons/icon31.png';
import BookCover3 from '../icons/icon32.png';
import BookCover4 from '../icons/icon33.png';
import BookCover5 from '../icons/icon34.png';
import BookCover6 from '../icons/icon35.png';

const FALLBACK_COVERS = [BookCover1, BookCover2, BookCover3, BookCover4, BookCover5, BookCover6];

const Books = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [pressedItem, setPressedItem] = useState(null);
  const [books, setBooks] = useState([]);
  const [classes, setClasses] = useState([]);
  const [coins, setCoins] = useState(0);
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { document.title = 'LocoLearn - کتاب‌ها'; }, []);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    let mounted = true;

    // حالت مهمان: داده‌ی دموی کلاس اول
    if (user?.isGuest) {
      setBooks(GUEST_BOOKS);
      setClasses(GUEST_CLASSES);
      setCoins(getGuestCoins());
      setLoading(false);
      return () => { mounted = false; };
    }

    (async () => {
      try {
        const [booksRes, classesRes, coinsRes] = await Promise.allSettled([
          bookService.getMyBooks(),
          bookService.getMyClasses(),
          clubService.getCoins(),
        ]);
        if (!mounted) return;
        if (booksRes.status === 'fulfilled' && booksRes.value?.success) {
          setBooks(booksRes.value.data || []);
        }
        if (classesRes.status === 'fulfilled' && classesRes.value?.success) {
          setClasses(classesRes.value.data || []);
        }
        if (coinsRes.status === 'fulfilled' && coinsRes.value?.success) {
          setCoins(coinsRes.value.data?.coins ?? 0);
        }
      } catch (e) {
        // در صورت خطا، صفحه خالی نمایش داده می‌شود
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [user]);

  const isMobile = windowWidth < 768;
  const isDesktop = windowWidth >= 1024;

  const colors = { primary: '#4DB6AC', primaryDark: '#80CBC4', bg: '#E8F5E9', cardBg: '#FFFFFF', text: '#455A64', navBg: '#FFFFFF', coin: '#F6B100' };

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

  // کلیک روی کتاب: اگر بازی داشته باشد لیست بازی‌ها، وگرنه نوتیفیکیشن
  const handleBookClick = (book) => {
    const gameCount = user?.isGuest ? (book.games?.length || 0) : (book.game_count || 0);
    if (gameCount > 0) {
      setPressedItem(book.id);
      setTimeout(() => { setPressedItem(null); navigate(`/book/${book.id}`); }, 100);
    } else {
      setToast('هنوز هیچ بازی‌ای برای این کتاب ثبت نشده است.');
    }
  };

  const coverFor = (book, index) => {
    if (book.cover_url && /^https?:\/\//.test(book.cover_url)) return book.cover_url;
    return FALLBACK_COVERS[index % FALLBACK_COVERS.length];
  };

  // گروه‌بندی کتاب‌ها زیر هر کلاس (کتاب‌های عمومی زیر «همه»)
  const classNameById = {};
  classes.forEach((c) => { classNameById[c.id] = c.name; });

  return (
    <div style={{ minHeight: '100vh', background: colors.bg, fontFamily: "'Shoor', 'Shoor Rounded', sans-serif", direction: 'rtl', paddingBottom: '80px' }}>
      <Toast message={toast} type="info" duration={3000} onClose={() => setToast('')} />
      <div style={{ position: 'sticky', top: 0, zIndex: 100, background: colors.cardBg, padding: isMobile ? '16px 16px' : '20px 24px', borderBottom: `1px solid ${colors.primary}30`, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: isDesktop ? '1200px' : '100%', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src={BookIcon} alt="books" style={{ width: '28px', height: '28px' }} />
            <h1 style={{ fontSize: isMobile ? '18px' : '24px', fontWeight: '700', color: colors.text }}>کتاب‌های من</h1>
          </div>
          {/* موجودی سکه */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: colors.coin + '22', padding: '6px 12px', borderRadius: '999px' }}>
            <span style={{ fontSize: '18px' }}>🪙</span>
            <span style={{ fontWeight: '700', color: colors.text }}>{coins}</span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: isDesktop ? '1200px' : '100%', margin: '0 auto', padding: isMobile ? '20px 16px' : '32px 24px' }}>
        {classes.length > 0 && (
          <div style={{ marginBottom: '20px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {classes.map((c) => (
              <span key={c.id} style={{ background: colors.primary + '18', color: colors.primary, padding: '6px 14px', borderRadius: '999px', fontSize: '13px', fontWeight: '600' }}>
                {c.name}
              </span>
            ))}
          </div>
        )}

        {loading ? (
          <p style={{ textAlign: 'center', color: colors.text, padding: '40px 0' }}>در حال بارگذاری...</p>
        ) : books.length === 0 ? (
          <div style={{ textAlign: 'center', color: colors.text, padding: '60px 20px' }}>
            <p style={{ fontSize: '15px' }}>هنوز کتابی برای تو ثبت نشده است.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', gap: '20px' }}>
            {books.map((book, index) => (
              <div key={book.id} onClick={() => handleBookClick(book)} style={{ cursor: 'pointer', transition: 'transform 0.08s linear', transform: pressedItem === book.id ? 'scale(0.97)' : 'scale(1)' }}>
                <div style={{ background: colors.cardBg, borderRadius: '20px', padding: '16px', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                  <div style={{ width: '100%', aspectRatio: '2/3', borderRadius: '16px', overflow: 'hidden', marginBottom: '12px', backgroundColor: colors.primary + '20' }}>
                    <img
                      src={coverFor(book, index)}
                      alt={book.title}
                      onError={(e) => { e.target.src = FALLBACK_COVERS[index % FALLBACK_COVERS.length]; }}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <p style={{ fontSize: '14px', fontWeight: '600', color: colors.text }}>{book.title}</p>
                  {(() => {
                    const gc = user?.isGuest ? (book.games?.length || 0) : (book.game_count || 0);
                    return gc > 0 ? (
                      <p style={{ fontSize: '12px', color: colors.primary, marginTop: '4px', fontWeight: '600' }}>🎮 {gc} بازی</p>
                    ) : (
                      <p style={{ fontSize: '12px', color: '#B0BEC5', marginTop: '4px', fontWeight: '600' }}>بدون بازی</p>
                    );
                  })()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ position: 'fixed', bottom: 0, right: 0, left: 0, background: colors.navBg, boxShadow: '0 -2px 20px rgba(0,0,0,0.08)', borderRadius: '28px 28px 0 0', padding: isMobile ? '10px 12px' : '12px 20px', display: 'flex', justifyContent: 'space-around', alignItems: 'center', zIndex: 100 }}>
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = false;
          return (
            <div key={item.id} onClick={() => handleClick(item.path, `nav_${item.id}`)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer', transition: 'transform 0.05s linear' }}>
              <IconComponent size={isMobile ? 20 : 22} color={isActive ? colors.primary : '#999'} />
              <span style={{ fontSize: isMobile ? '9px' : '10px', color: isActive ? colors.primary : '#999', fontWeight: isActive ? '600' : '400' }}>{item.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Books;
