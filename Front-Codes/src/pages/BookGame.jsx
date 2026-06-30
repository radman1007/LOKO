import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HiOutlineArrowRight } from 'react-icons/hi';
import { bookService } from '../services/book.service';
import { clubService } from '../services/task.service';

const colors = {
  primary: '#4DB6AC', bg: '#E8F5E9', cardBg: '#FFFFFF',
  text: '#455A64', coin: '#F6B100',
};

const BookGame = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [game, setGame] = useState(null);
  const [coins, setCoins] = useState(0);
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState('playing'); // playing | finishing | reward
  const [reward, setReward] = useState(null);

  const load = useCallback(async (bookId) => {
    setLoading(true);
    setPhase('playing');
    setReward(null);
    try {
      const [gameRes, coinsRes] = await Promise.allSettled([
        bookService.getBookGame(bookId),
        clubService.getCoins(),
      ]);
      if (gameRes.status === 'fulfilled' && gameRes.value?.success) {
        setGame(gameRes.value.data);
      } else {
        setGame(null);
      }
      if (coinsRes.status === 'fulfilled' && coinsRes.value?.success) {
        setCoins(coinsRes.value.data?.coins ?? 0);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(id); }, [id, load]);

  const handleFinish = async () => {
    if (phase !== 'playing') return;
    setPhase('finishing');
    try {
      const res = await bookService.completeGame(id, { score: 100 });
      if (res?.success) {
        const data = res.data;
        setCoins(data.coinBalance ?? coins);
        setReward(data);
        setPhase('reward');
      } else {
        setPhase('playing');
      }
    } catch (e) {
      setPhase('playing');
    }
  };

  const goNext = () => {
    if (reward?.nextBook?.id) {
      navigate(`/book/${reward.nextBook.id}`);
    } else {
      navigate('/books');
    }
  };

  if (loading) {
    return (
      <div style={wrap}>
        <p style={{ color: colors.text }}>در حال بارگذاری بازی...</p>
      </div>
    );
  }

  return (
    <div style={{ ...wrap, flexDirection: 'column', padding: 0 }}>
      {/* هدر */}
      <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: colors.cardBg, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <button onClick={() => navigate('/books')} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: colors.text, cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}>
          <HiOutlineArrowRight size={20} /> بازگشت
        </button>
        <span style={{ fontWeight: 700, color: colors.text }}>{game?.title || 'بازی'}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: colors.coin + '22', padding: '6px 12px', borderRadius: 999 }}>
          <span style={{ fontSize: 18 }}>🪙</span>
          <span style={{ fontWeight: 700, color: colors.text }}>{coins}</span>
        </div>
      </div>

      {/* بدنه بازی */}
      <div style={{ flex: 1, width: '100%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {game?.gameUrl ? (
          <iframe
            title={game.title}
            src={game.gameUrl}
            style={{ width: '100%', height: '100%', border: 'none' }}
            allow="autoplay; fullscreen"
          />
        ) : (
          <div style={{ textAlign: 'center', color: colors.text, padding: 24 }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🎮</div>
            <p style={{ fontSize: 16, fontWeight: 600 }}>{game?.title || 'بازی این کتاب'}</p>
            <p style={{ fontSize: 13, color: '#90A4AE', marginTop: 8 }}>
              بازی این کتاب به‌زودی اضافه می‌شود. برای دریافت سکه، بازی را به پایان برسان.
            </p>
          </div>
        )}

        {/* انیمیشن جایزه */}
        {phase === 'reward' && reward && (
          <div style={overlay}>
            <div style={{ ...rewardCard, animation: 'pop .35s ease' }}>
              <div style={{ fontSize: 56 }}>🎉</div>
              <p style={{ fontSize: 18, fontWeight: 700, color: colors.text, margin: '8px 0' }}>آفرین!</p>
              <p style={{ fontSize: 15, color: colors.coin, fontWeight: 700 }}>+{reward.coinsAwarded} 🪙 سکه گرفتی</p>
              <p style={{ fontSize: 13, color: colors.text, marginTop: 4 }}>مجموع سکه‌ها: {reward.coinBalance}</p>
              <button onClick={goNext} style={nextBtn}>
                {reward.nextBook ? `بازی بعدی: ${reward.nextBook.title} ←` : 'بازگشت به کتاب‌ها'}
              </button>
            </div>
            <style>{`@keyframes pop { 0% { transform: scale(.7); opacity: 0 } 100% { transform: scale(1); opacity: 1 } }`}</style>
          </div>
        )}
      </div>

      {/* دکمه پایان بازی */}
      {phase !== 'reward' && (
        <div style={{ width: '100%', padding: '14px 18px', background: colors.cardBg, boxShadow: '0 -2px 10px rgba(0,0,0,0.05)' }}>
          <button onClick={handleFinish} disabled={phase === 'finishing'} style={{ ...nextBtn, width: '100%', opacity: phase === 'finishing' ? 0.6 : 1 }}>
            {phase === 'finishing' ? 'در حال ثبت...' : 'پایان بازی و دریافت سکه'}
          </button>
        </div>
      )}
    </div>
  );
};

const wrap = { minHeight: '100vh', background: colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', direction: 'rtl', fontFamily: "'Shoor', sans-serif" };
const overlay = { position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 };
const rewardCard = { background: '#fff', borderRadius: 24, padding: '28px 24px', textAlign: 'center', maxWidth: 320, width: '85%', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' };
const nextBtn = { marginTop: 16, padding: '12px 20px', background: colors.primary, color: '#fff', border: 'none', borderRadius: 16, fontSize: 15, fontWeight: 700, cursor: 'pointer' };

export default BookGame;
