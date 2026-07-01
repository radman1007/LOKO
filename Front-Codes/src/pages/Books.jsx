import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { HiOutlineHome, HiOutlineUser, HiOutlineFire, HiOutlinePlay, HiOutlineHeart } from 'react-icons/hi';
import { bookService } from '../services/book.service';
import { clubService } from '../services/task.service';
import { GUEST_BOOKS, GUEST_CLASSES, getGuestCoins } from '../data/guestData';
import Toast from '../components/common/Toast';
import Header from '../components/common/Header';
import BookCover1 from '../icons/icon32.png';
import BookCover2 from '../icons/icon31.png';
import BookCover3 from '../icons/icon33.png';
import BookCover4 from '../icons/icon30.png';
import BookCover5 from '../icons/icon34.png';
import BookCover6 from '../icons/icon35.png';

const FALLBACK_COVERS = [BookCover1, BookCover2, BookCover3, BookCover4, BookCover5, BookCover6];

const Books = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [pressedItem, setPressedItem] = useState(null);
  const [books, setBooks] = useState([]);
  const [classes, setClasses] = useState([]);
  const [coins, setCoins] = useState(0);
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { document.title = 'LocoLearn - کتاب‌ها'; }, []);

  useEffect(() => {
    let mounted = true;
    if (user?.isGuest) { setBooks(GUEST_BOOKS); setClasses(GUEST_CLASSES); setCoins(getGuestCoins()); setLoading(false); return () => { mounted = false; }; }
    (async () => {
      try {
        const [booksRes, classesRes, coinsRes] = await Promise.allSettled([ 
          bookService.getMyBooks(), 
          bookService.getMyClasses(), 
          clubService.getCoins() 
        ]);
        if (!mounted) return;
        if (booksRes.status === 'fulfilled' && booksRes.value?.success) setBooks(booksRes.value.data || []);
        if (classesRes.status === 'fulfilled' && classesRes.value?.success) setClasses(classesRes.value.data || []);
        if (coinsRes.status === 'fulfilled' && coinsRes.value?.success) setCoins(coinsRes.value.data?.coins ?? 0);
      } catch (e) {} finally { if (mounted) setLoading(false); }
    })();
    return () => { mounted = false; };
  }, [user]);

  const colors = { 
    primary: '#4DB6AC', 
    primaryDark: '#80CBC4', 
    bg: '#E8F5E9', 
    cardBg: '#FFFFFF', 
    text: '#455A64', 
    navBg: '#FFFFFF', 
    coin: '#F6B100' 
  };

  const navItems = [ 
    { id: 'لوکو کلاب', name: 'کلاب', icon: HiOutlineFire, path: '/luko-club' }, 
    { id: 'لوکو تلویزیون', name: 'تلویزیون', icon: HiOutlinePlay, path: '/entertainment' }, 
    { id: 'خانه', name: 'خانه', icon: HiOutlineHome, path: '/' }, 
    { id: 'لوکو سلامت', name: 'سلامت', icon: HiOutlineHeart, path: '/luko-health' }, 
    { id: 'پروفایل', name: 'پروفایل', icon: HiOutlineUser, path: '/profile' } 
  ];

  const handleClick = (path, id) => { 
    setPressedItem(id); 
    setTimeout(() => { setPressedItem(null); navigate(path); }, 100); 
  };
  
  const handleBookClick = (book) => { 
    const gameCount = user?.isGuest ? (book.games?.length || 0) : (book.game_count || 0); 
    if (gameCount > 0) { 
      handleClick(`/book/${book.id}`, book.id); 
    } else { 
      setToast('هنوز هیچ بازی‌ای برای این کتاب ثبت نشده است.'); 
    } 
  };
  
  const coverFor = (book, index) => { 
    if (book.cover_url && /^https?:\/\//.test(book.cover_url)) return book.cover_url; 
    return FALLBACK_COVERS[index % FALLBACK_COVERS.length]; 
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: colors.bg, 
      fontFamily: "'Shoor', 'Shoor Rounded', sans-serif", 
      direction: 'rtl', 
      paddingBottom: '80px',
      display: 'flex',
      justifyContent: 'center'
    }}>
      <Toast message={toast} type="info" duration={3000} onClose={() => setToast('')} />
      
      <div style={{ 
        width: '100%', 
        maxWidth: 'min(600px, 100%)' // الگوی App-Shell
      }}>
        <Header 
          title="کتاب‌های من" 
          user={user} 
          showGreeting={false}
          colors={colors} 
          rightAction={
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              background: colors.coin + '22', 
              padding: 'clamp(6px, 1.5vw, 8px) clamp(10px, 2.5vw, 14px)', 
              borderRadius: '999px' 
            }}>
              <span style={{ fontSize: 'clamp(14px, 4vw, 16px)' }}>🪙</span>
              <span style={{ 
                fontWeight: '700', 
                color: colors.text, 
                fontSize: 'clamp(12px, 3.5vw, 14px)' 
              }}>{coins}</span>
            </div>
          }
        />

        <div style={{ 
          padding: 'clamp(16px, 4vw, 24px) clamp(12px, 3vw, 16px)' 
        }}>
          {classes.length > 0 && (
            <div style={{ 
              marginBottom: 'clamp(12px, 3vw, 20px)', 
              display: 'flex', 
              gap: '8px', 
              flexWrap: 'wrap' 
            }}>
              {classes.map((c) => (
                <span key={c.id} style={{ 
                  background: colors.primary + '18', 
                  color: colors.primary, 
                  padding: 'clamp(4px, 1vw, 6px) clamp(10px, 2.5vw, 14px)', 
                  borderRadius: '999px', 
                  fontSize: 'clamp(11px, 3vw, 13px)', 
                  fontWeight: '600' 
                }}>
                  {c.name}
                </span>
              ))}
            </div>
          )}

          {loading ? (
            <p style={{ 
              textAlign: 'center', 
              color: colors.text, 
              padding: '40px 0',
              fontSize: 'clamp(13px, 3.5vw, 15px)'
            }}>در حال بارگذاری...</p>
          ) : books.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              color: colors.text, 
              padding: '60px 20px' 
            }}>
              <p style={{ fontSize: 'clamp(13px, 3.5vw, 15px)' }}>هنوز کتابی برای تو ثبت نشده است.</p>
            </div>
          ) : (
            <div style={{ 
              display: 'grid', 
              // با توجه به محدودیت 600px، همیشه 2 ستون بهترین حالت است
              gridTemplateColumns: 'repeat(2, 1fr)', 
              gap: 'clamp(12px, 3vw, 20px)' 
            }}>
              {books.map((book, index) => (
                <div 
                  key={book.id} 
                  onClick={() => handleBookClick(book)} 
                  style={{ 
                    cursor: 'pointer', 
                    transition: 'transform 0.08s linear', 
                    transform: pressedItem === book.id ? 'scale(0.97)' : 'scale(1)' 
                  }}
                >
                  <div style={{ 
                    background: colors.cardBg, 
                    borderRadius: 'clamp(16px, 4vw, 20px)', 
                    padding: 'clamp(10px, 2.5vw, 16px)', 
                    textAlign: 'center', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)' 
                  }}>
                    <div style={{ 
                      width: '100%', 
                      aspectRatio: '2/3', 
                      borderRadius: 'clamp(12px, 3vw, 16px)', 
                      overflow: 'hidden', 
                      marginBottom: 'clamp(8px, 2vw, 12px)', 
                      backgroundColor: colors.primary + '20' 
                    }}>
                      <img 
                        src={coverFor(book, index)} 
                        alt={book.title} 
                        onError={(e) => { e.target.src = FALLBACK_COVERS[index % FALLBACK_COVERS.length]; }} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      />
                    </div>
                    <p style={{ 
                      fontSize: 'clamp(12px, 3.5vw, 14px)', 
                      fontWeight: '600', 
                      color: colors.text,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {book.title}
                    </p>
                    {(() => { 
                      const gc = user?.isGuest ? (book.games?.length || 0) : (book.game_count || 0); 
                      return gc > 0 ? (
                        <p style={{ 
                          fontSize: 'clamp(10px, 3vw, 12px)', 
                          color: colors.primary, 
                          marginTop: '4px', 
                          fontWeight: '600' 
                        }}>🎮 {gc} بازی</p>
                      ) : (
                        <p style={{ 
                          fontSize: 'clamp(10px, 3vw, 12px)', 
                          color: '#B0BEC5', 
                          marginTop: '4px', 
                          fontWeight: '600' 
                        }}>بدون بازی</p>
                      ); 
                    })()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* نوار ناوبری استاندارد شده */}
      <div style={{ 
        position: 'fixed', 
        bottom: 0, 
        left: '50%', 
        transform: 'translateX(-50%)',
        width: '100%', 
        maxWidth: 'min(600px, 100%)', 
        background: colors.navBg, 
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
          return (
            <div 
              key={item.id} 
              onClick={() => handleClick(item.path, `nav_${item.id}`)} 
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                gap: '2px', 
                cursor: 'pointer', 
                transition: 'transform 0.05s linear',
                padding: '0 8px'
              }}
              onMouseDown={e => e.currentTarget.style.transform = 'scale(0.9)'}
              onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <IconComponent size={20} color="#999" />
              <span style={{ 
                fontSize: 'clamp(8px, 2.5vw, 10px)', 
                color: '#999', 
                fontWeight: '400' 
              }}>
                {item.name}
              </span>
            </div>
          ); 
        })}
      </div>
    </div>
  );
};

export default Books;