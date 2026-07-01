// src/pages/BookGames.jsx — لیست بازی‌های یک کتاب با مسیر مرحله‌ای (قفل ترتیبی)
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HiOutlineArrowRight, HiLockClosed, HiCheckCircle } from 'react-icons/hi';
import { useUser } from '../contexts/UserContext';
import { bookService } from '../services/book.service';
import { clubService } from '../services/task.service';
import { getGuestBookGames, getGuestCoins, getGuestCompleted } from '../data/guestData';
import Toast from '../components/common/Toast';

const colors = {
  primary: '#4DB6AC', bg: '#E8F5E9', cardBg: '#FFFFFF',
  text: '#455A64', coin: '#F6B100', locked: '#B0BEC5', done: '#66BB6A',
};

const BookGames = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();

  const [bookTitle, setBookTitle] = useState('');
  const [games, setGames] = useState([]); // هر آیتم: {id,title,coin_reward,completed}
  const [coins, setCoins] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pressed, setPressed] = useState(null);
  const [toast, setToast] = useState('');

  const load = useCallback(async () => {
    setLoading(true);

    // حالت مهمان
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
        setGames((gamesRes.value.data.games || []).map((g) => ({
          ...g,
          completed: !!g.completed,
        })));
      }
      if (coinsRes.status === 'fulfilled' && coinsRes.value?.success) {
        setCoins(coinsRes.value.data?.coins ?? 0);
      }
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => { load(); }, [load]);

  // بازی i باز است اگر اولین باشد یا بازی قبلی کامل شده باشد
  const isUnlocked = (index) => index === 0 || !!games[index - 1]?.completed;

  const openGame = (game, index) => {
    if (!isUnlocked(index)) {
      setToast('ابتدا باید بازی قبلی را کامل کنی.');
      return;
    }
    setPressed(game.id);
    setTimeout(() => { setPressed(null); navigate(`/game/${game.id}`); }, 100);
  };

  return (
    <div style={{ minHeight: '100vh', background: colors.bg, direction: 'rtl', fontFamily: "'Shoor', sans-serif", paddingBottom: '40px' }}>
      <Toast message={toast} type="info" duration={2500} onClose={() => setToast('')} />

      {/* هدر */}
      <div style={{ position: 'sticky', top: 0, zIndex: 100, background: colors.cardBg, padding: '16px 20px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={() => navigate('/books')} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: colors.text, cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}>
          <HiOutlineArrowRight size={20} /> کتاب‌ها
        </button>
        <h1 style={{ fontSize: '17px', fontWeight: 700, color: colors.text }}>{bookTitle}</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: colors.coin + '22', padding: '6px 12px', borderRadius: 999 }}>
          <span style={{ fontSize: 18 }}>🪙</span>
          <span style={{ fontWeight: 700, color: colors.text }}>{coins}</span>
        </div>
      </div>

      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '20px 16px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: 700, color: colors.text, marginBottom: '6px' }}>🎮 مسیر بازی‌ها</h2>
        <p style={{ fontSize: '12px', color: '#90A4AE', marginBottom: '18px' }}>هر بازی را کامل کن تا بازی بعدی باز شود.</p>

        {loading ? (
          <p style={{ textAlign: 'center', color: colors.text, padding: '40px 0' }}>در حال بارگذاری...</p>
        ) : games.length === 0 ? (
          <div style={{ textAlign: 'center', color: colors.text, padding: '60px 20px' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎲</div>
            <p style={{ fontSize: '15px' }}>هنوز هیچ بازی‌ای برای این کتاب ثبت نشده است.</p>
          </div>
        ) : (
          <div style={{ position: 'relative' }}>
            {games.map((g, index) => {
              const unlocked = isUnlocked(index);
              const completed = g.completed;
              const stepColor = completed ? colors.done : unlocked ? colors.primary : colors.locked;
              return (
                <div key={g.id} style={{ display: 'flex', alignItems: 'stretch', gap: '14px', marginBottom: '14px' }}>
                  {/* ستون شماره/خط مسیر */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: stepColor, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16, boxShadow: '0 3px 8px rgba(0,0,0,0.12)' }}>
                      {completed ? <HiCheckCircle size={22} /> : (unlocked ? (index + 1) : <HiLockClosed size={18} />)}
                    </div>
                    {index < games.length - 1 && (
                      <div style={{ flex: 1, width: 3, minHeight: 24, background: completed ? colors.done : '#E0E0E0', marginTop: 2 }} />
                    )}
                  </div>

                  {/* کارت بازی */}
                  <div
                    onClick={() => openGame(g, index)}
                    style={{
                      flex: 1,
                      background: unlocked ? colors.cardBg : '#F5F5F5',
                      borderRadius: '16px',
                      padding: '14px 16px',
                      boxShadow: unlocked ? '0 4px 12px rgba(0,0,0,0.06)' : 'none',
                      border: unlocked ? `1.5px solid ${completed ? colors.done : colors.primary}33` : '1.5px dashed #CFD8DC',
                      cursor: unlocked ? 'pointer' : 'not-allowed',
                      opacity: unlocked ? 1 : 0.7,
                      transition: 'transform 0.08s linear',
                      transform: pressed === g.id ? 'scale(0.98)' : 'scale(1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: 700, color: unlocked ? colors.text : '#90A4AE' }}>
                        بازی {index + 1}: {g.title}
                      </p>
                      <p style={{ fontSize: '12px', color: unlocked ? colors.coin : '#B0BEC5', marginTop: '4px', fontWeight: 600 }}>
                        🪙 {g.coin_reward} سکه {completed && '• ✓ کامل شد'}
                      </p>
                    </div>
                    <div style={{
                      background: unlocked ? (completed ? colors.done : colors.primary) : '#CFD8DC',
                      color: '#fff', borderRadius: '10px', padding: '8px 14px', fontSize: '12px', fontWeight: 700, whiteSpace: 'nowrap',
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
  );
};

export default BookGames;
