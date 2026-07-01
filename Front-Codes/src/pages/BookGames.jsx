// src/pages/BookGames.jsx — لیست بازی‌های یک کتاب با مسیر مرحله‌ای
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  HiOutlineArrowRight, HiLockClosed, HiCheckCircle, 
  HiOutlineHome, HiOutlineUser, HiOutlineFire, HiOutlinePlay, HiOutlineHeart 
} from 'react-icons/hi';
import { useUser } from '../contexts/UserContext';
import { bookService } from '../services/book.service';
import { clubService } from '../services/task.service';
import { getGuestBookGames, getGuestCoins, getGuestCompleted } from '../data/guestData';
import Toast from '../components/common/Toast';
import Header from '../components/common/Header';
import NavigationBar from '../components/common/NavigationBar';

const colors = {
  primary: '#4DB6AC', 
  primaryDark: '#80CBC4',
  bg: '#E8F5E9', 
  cardBg: '#FFFFFF',
  text: '#455A64', 
  textSecondary: '#666666',
  coin: '#F6B100', 
  locked: '#B0BEC5', 
  done: '#66BB6A',
  navBg: '#FFFFFF'
};

const BookGames = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();

  const [bookTitle, setBookTitle] = useState('');
  const [games, setGames] = useState([]);
  const [coins, setCoins] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pressed, setPressed] = useState(null);
  const [toast, setToast] = useState('');
  const [activeNav, setActiveNav] = useState('خانه'); // نوار پایین

  const load = useCallback(async () => {
    setLoading(true);
    if (user?.isGuest) {
      const { book, games: gs } = getGuestBookGames(id);
      const done = getGuestCompleted();
      setBookTitle(book?.title || 'کتاب');
      setGames(gs.map((g) => ({ ...g, completed: done.includes(String(g.id)) })));
      setCoins(getGuestCoins());
      setLoading(false);
      return;
    }

    try {
      const [gamesRes, coinsRes] = await Promise.allSettled([
        bookService.getBookGames(id),
        clubService.getCoins(),
      ]);
      if (gamesRes.status === 'fulfilled' && gamesRes.value?.success) {
        setBookTitle(gamesRes.value.data.book?.title || 'کتاب');
        setGames((gamesRes.value.data.games || []).map((g) => ({ ...g, completed: !!g.completed })));
      }
      if (coinsRes.status === 'fulfilled' && coinsRes.value?.success) {
        setCoins(coinsRes.value.data?.coins ?? 0);
      }
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => { load(); }, [load]);

  const isUnlocked = (index) => index === 0 || !!games[index - 1]?.completed;

  const openGame = (game, index) => {
    if (!isUnlocked(index)) {
      setToast('ابتدا باید بازی قبلی را کامل کنی.');
      return;
    }
    setPressed(game.id);
    setTimeout(() => { setPressed(null); navigate(`/game/${game.id}`); }, 100);
  };

  const navItems = [
    { id: 'لوکو کلاب', name: 'کلاب', icon: HiOutlineFire, path: '/luko-club' },
    { id: 'لوکو تلویزیون', name: 'تلویزیون', icon: HiOutlinePlay, path: '/entertainment' },
    { id: 'خانه', name: 'خانه', icon: HiOutlineHome, path: '/' },
    { id: 'لوکو سلامت', name: 'سلامت', icon: HiOutlineHeart, path: '/luko-health' },
    { id: 'پروفایل', name: 'پروفایل', icon: HiOutlineUser, path: '/profile' }
  ];

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: colors.bg, 
      direction: 'rtl', 
      fontFamily: "'Shoor', sans-serif", 
      paddingBottom: '80px',
      display: 'flex',
      justifyContent: 'center'
    }}>
      <div style={{ width: '100%', maxWidth: 'min(600px, 100%)' }}>
        <Toast message={toast} type="info" duration={2500} onClose={() => setToast('')} />

        {/* هدر استاندارد شده */}
        <Header 
          title={bookTitle || 'بازی‌ها'} 
          user={user} 
          showGreeting={false}
          colors={colors} 
          rightAction={
            <button 
              onClick={() => navigate('/books')} 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px', 
                background: 'transparent', 
                border: 'none', 
                color: colors.text, 
                cursor: 'pointer', 
                fontSize: 'clamp(12px, 3.5vw, 14px)', 
                fontWeight: 600 
              }}
            >
              <HiOutlineArrowRight size={20} /> کتاب‌ها
            </button>
          }
          leftAction={
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              background: colors.coin + '22', 
              padding: 'clamp(6px, 1.5vw, 8px) clamp(10px, 2.5vw, 14px)', 
              borderRadius: '999px',
              boxShadow: '0 2px 8px rgba(246,177,0,0.15)'
            }}>
              <span style={{ fontSize: 'clamp(14px, 4vw, 18px)' }}>🪙</span>
              <span style={{ 
                fontWeight: 700, 
                color: colors.text, 
                fontSize: 'clamp(11px, 3vw, 14px)' 
              }}>{coins}</span>
            </div>
          }
        />

        <div style={{ padding: 'clamp(16px, 4vw, 24px) clamp(12px, 3vw, 16px)' }}>
          <h2 style={{ fontSize: 'clamp(14px, 4vw, 16px)', fontWeight: 700, color: colors.text, marginBottom: '6px' }}>🎮 مسیر بازی‌ها</h2>
          <p style={{ fontSize: 'clamp(11px, 3vw, 13px)', color: colors.textSecondary, marginBottom: 'clamp(14px, 3vw, 18px)' }}>هر بازی را کامل کن تا بازی بعدی باز شود.</p>

          {loading ? (
            <p style={{ textAlign: 'center', color: colors.text, padding: '40px 0', fontSize: 'clamp(13px, 3.5vw, 15px)' }}>در حال بارگذاری...</p>
          ) : games.length === 0 ? (
            <div style={{ textAlign: 'center', color: colors.text, padding: '60px 20px' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🎲</div>
              <p style={{ fontSize: 'clamp(13px, 3.5vw, 15px)' }}>هنوز هیچ بازی‌ای برای این کتاب ثبت نشده است.</p>
            </div>
          ) : (
            <div style={{ position: 'relative' }}>
              {games.map((g, index) => {
                const unlocked = isUnlocked(index);
                const completed = g.completed;
                const stepColor = completed ? colors.done : unlocked ? colors.primary : colors.locked;
                return (
                  <div key={g.id} style={{ display: 'flex', alignItems: 'stretch', gap: 'clamp(10px, 3vw, 14px)', marginBottom: 'clamp(12px, 3vw, 14px)' }}>
                    {/* ستون شماره/خط مسیر */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ 
                        width: 'clamp(34px, 10vw, 40px)', 
                        height: 'clamp(34px, 10vw, 40px)', 
                        borderRadius: '50%', 
                        background: stepColor, 
                        color: '#fff', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        fontWeight: 800, 
                        fontSize: 'clamp(13px, 4vw, 16px)', 
                        boxShadow: '0 3px 8px rgba(0,0,0,0.12)',
                        flexShrink: 0
                      }}>
                        {completed ? <HiCheckCircle size={20} /> : (unlocked ? (index + 1) : <HiLockClosed size={16} />)}
                      </div>
                      {index < games.length - 1 && (
                        <div style={{ flex: 1, width: 3, minHeight: 20, background: completed ? colors.done : '#E0E0E0', marginTop: 2 }} />
                      )}
                    </div>

                    {/* کارت بازی */}
                    <div
                      onClick={() => openGame(g, index)}
                      style={{
                        flex: 1,
                        background: unlocked ? colors.cardBg : '#F5F5F5',
                        borderRadius: '16px',
                        padding: 'clamp(10px, 3vw, 14px) clamp(12px, 3vw, 16px)',
                        boxShadow: unlocked ? '0 4px 12px rgba(0,0,0,0.06)' : 'none',
                        border: unlocked ? `1.5px solid ${completed ? colors.done : colors.primary}33` : '1.5px dashed #CFD8DC',
                        cursor: unlocked ? 'pointer' : 'not-allowed',
                        opacity: unlocked ? 1 : 0.7,
                        transition: 'transform 0.08s linear',
                        transform: pressed === g.id ? 'scale(0.98)' : 'scale(1)',
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        gap: '10px'
                      }}
                    >
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <p style={{ 
                          fontSize: 'clamp(12px, 3.5vw, 14px)', 
                          fontWeight: 700, 
                          color: unlocked ? colors.text : '#90A4AE',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          بازی {index + 1}: {g.title}
                        </p>
                        <p style={{ fontSize: 'clamp(10px, 3vw, 12px)', color: unlocked ? colors.coin : '#B0BEC5', marginTop: '4px', fontWeight: 600 }}>
                          🪙 {g.coin_reward} سکه {completed && '• ✓ کامل شد'}
                        </p>
                      </div>
                      <div style={{
                        background: unlocked ? (completed ? colors.done : colors.primary) : '#CFD8DC',
                        color: '#fff', 
                        borderRadius: '10px', 
                        padding: 'clamp(6px, 2vw, 8px) clamp(10px, 2.5vw, 14px)', 
                        fontSize: 'clamp(10px, 2.8vw, 12px)', 
                        fontWeight: 700, 
                        whiteSpace: 'nowrap',
                        flexShrink: 0
                      }}>
                        {completed ? 'دوباره' : unlocked ? 'شروع ▶' : '🔒 قفل'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* نوار ناوبری پایین که قبلا نداشت */}
      <NavigationBar 
        navItems={navItems} 
        activeNav={activeNav} 
        setActiveNav={setActiveNav} 
        colors={colors} 
        onNavigate={navigate} 
        setPressedItem={setPressed} 
        pressedItem={pressed} 
      />

      <style>{`
        ::-webkit-scrollbar { display: none; }
        * { margin: 0; padding: 0; box-sizing: border-box; -webkit-tap-highlight-color: transparent; user-select: none; }
        button { font-family: inherit; cursor: pointer; }
      `}</style>
    </div>
  );
};

export default BookGames;