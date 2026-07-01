// src/pages/BookGame.jsx — پخش یک بازی مستقل در نمای کامل (full-viewport)
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HiOutlineArrowRight } from 'react-icons/hi';
import { useUser } from '../contexts/UserContext';
import { bookService } from '../services/book.service';
import { clubService } from '../services/task.service';
import {
  isGuest, findGuestGame, isGuestGameUnlocked,
  getGuestCoins, addGuestCoins, markGuestCompleted,
} from '../data/guestData';

const colors = {
  primary: '#4DB6AC', bg: '#0f1720', cardBg: '#FFFFFF',
  text: '#455A64', coin: '#F6B100',
};

const BookGame = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();

  const [game, setGame] = useState(null);
  const [bookId, setBookId] = useState(null);
  const [coins, setCoins] = useState(0);
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState('playing'); // playing | finishing | reward
  const [reward, setReward] = useState(null);

  const load = useCallback(async (gid) => {
    setLoading(true);
    setPhase('playing');
    setReward(null);

    // ─── حالت مهمان ───
    if (isGuest()) {
      const found = findGuestGame(gid);
      if (!found) { setGame(null); setLoading(false); return; }
      // گارد قفل: اگر بازی قفل است به لیست بازی‌ها برگرد
      if (!isGuestGameUnlocked(found.book.id, gid)) {
        navigate(`/book/${found.book.id}`, { replace: true });
        return;
      }
      setGame({ id: found.game.id, title: found.game.title, gameUrl: found.game.gameUrl, coinReward: found.game.coin_reward });
      setBookId(found.book.id);
      setCoins(getGuestCoins());
      setLoading(false);
      return;
    }

    // ─── حالت واقعی ───
    try {
      const [gameRes, coinsRes] = await Promise.allSettled([
        bookService.getGame(gid),
        clubService.getCoins(),
      ]);
      if (gameRes.status === 'fulfilled' && gameRes.value?.success) {
        const g = gameRes.value.data;
        setGame(g);
        setBookId(g.bookId);
        // گارد قفل بر اساس وضعیت بازی‌های کتاب
        try {
          const listRes = await bookService.getBookGames(g.bookId);
          if (listRes?.success) {
            const list = listRes.data.games || [];
            const idx = list.findIndex((x) => String(x.id) === String(gid));
            const unlocked = idx === 0 || (idx > 0 && !!list[idx - 1]?.completed);
            if (!unlocked) { navigate(`/book/${g.bookId}`, { replace: true }); return; }
          }
        } catch (e) { /* در صورت خطا اجازه پخش می‌دهیم */ }
      } else {
        setGame(null);
      }
      if (coinsRes.status === 'fulfilled' && coinsRes.value?.success) {
        setCoins(coinsRes.value.data?.coins ?? 0);
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => { load(gameId); }, [gameId, load]);

  const handleFinish = async () => {
    if (phase !== 'playing') return;
    setPhase('finishing');

    // ─── حالت مهمان ───
    if (isGuest()) {
      const found = findGuestGame(gameId);
      const award = found?.game?.coin_reward ?? 10;
      const balance = addGuestCoins(award);
      markGuestCompleted(gameId);
      const next = found?.nextGame || null;
      setCoins(balance);
      setReward({
        coinsAwarded: award,
        coinBalance: balance,
        nextGame: next ? { id: next.id, title: next.title } : null,
      });
      setPhase('reward');
      return;
    }

    // ─── حالت واقعی ───
    try {
      const res = await bookService.completeGame(gameId, { score: 100 });
      if (res?.success) {
        setCoins(res.data.coinBalance ?? coins);
        setReward(res.data);
        setPhase('reward');
      } else {
        setPhase('playing');
      }
    } catch (e) {
      setPhase('playing');
    }
  };

  const goNext = () => {
    if (reward?.nextGame?.id) {
      navigate(`/game/${reward.nextGame.id}`);
    } else {
      navigate(bookId ? `/book/${bookId}` : '/books');
    }
  };

  const goBack = () => navigate(bookId ? `/book/${bookId}` : '/books');

  if (loading) {
    return (
      <div style={fullCenter}>
        <p style={{ color: '#fff' }}>در حال بارگذاری بازی...</p>
      </div>
    );
  }

  if (!game) {
    return (
      <div style={fullCenter}>
        <div style={{ textAlign: 'center', color: '#fff' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🎮</div>
          <p style={{ fontSize: 16, fontWeight: 600 }}>بازی پیدا نشد</p>
          <button onClick={goBack} style={{ ...btn, marginTop: 16 }}>بازگشت</button>
        </div>
      </div>
    );
  }

  return (
    // نمای کامل صفحه: بازی خودش تمام صفحه را می‌گیرد (layout مستقل و صحیح)
    <div style={{ position: 'fixed', inset: 0, background: '#000', direction: 'rtl', overflow: 'hidden' }}>
      {/* بازی در iframe تمام‌صفحه — کاملاً ایزوله و در سایز صحیح خودش */}
      {game.gameUrl ? (
        <iframe
          title={game.title}
          src={game.gameUrl}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none', display: 'block' }}
          allow="autoplay; fullscreen; gamepad; microphone"
        />
      ) : (
        <div style={fullCenter}>
          <div style={{ textAlign: 'center', color: '#fff', padding: 24 }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🎮</div>
            <p style={{ fontSize: 16, fontWeight: 600 }}>{game.title}</p>
            <p style={{ fontSize: 13, color: '#B0BEC5', marginTop: 8 }}>فایل بازی این مورد هنوز بارگذاری نشده است.</p>
          </div>
        </div>
      )}

      {/* نوار شناور بالا — بازگشت + سکه (روی بازی) */}
      <div style={floatingBar}>
        <button onClick={goBack} style={floatBtn}>
          <HiOutlineArrowRight size={18} /> خروج
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,0,0,0.55)', color: '#fff', padding: '6px 12px', borderRadius: 999, fontSize: 13, fontWeight: 700 }}>
          🪙 {coins}
        </div>
      </div>

      {/* دکمه شناور پایان بازی */}
      {phase !== 'reward' && (
        <button
          onClick={handleFinish}
          disabled={phase === 'finishing'}
          style={finishBtn}
        >
          {phase === 'finishing' ? 'در حال ثبت...' : '✓ پایان بازی و دریافت سکه'}
        </button>
      )}

      {/* انیمیشن جایزه */}
      {phase === 'reward' && reward && (
        <div style={overlay}>
          <div style={{ ...rewardCard, animation: 'pop .35s ease' }}>
            <div style={{ fontSize: 56 }}>🎉</div>
            <p style={{ fontSize: 18, fontWeight: 700, color: colors.text, margin: '8px 0' }}>آفرین!</p>
            <p style={{ fontSize: 15, color: colors.coin, fontWeight: 700 }}>+{reward.coinsAwarded} 🪙 سکه گرفتی</p>
            <p style={{ fontSize: 13, color: colors.text, marginTop: 4 }}>مجموع سکه‌ها: {reward.coinBalance}</p>
            <button onClick={goNext} style={btn}>
              {reward.nextGame ? `بازی بعدی: ${reward.nextGame.title} ←` : 'بازگشت به لیست بازی‌ها'}
            </button>
          </div>
          <style>{`@keyframes pop { 0% { transform: scale(.7); opacity: 0 } 100% { transform: scale(1); opacity: 1 } }`}</style>
        </div>
      )}
    </div>
  );
};

const fullCenter = { position: 'fixed', inset: 0, background: colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', direction: 'rtl', fontFamily: "'Shoor', sans-serif" };
const floatingBar = { position: 'absolute', top: 10, left: 10, right: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 20, pointerEvents: 'none' };
const floatBtn = { display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,0,0,0.55)', color: '#fff', border: 'none', borderRadius: 999, padding: '8px 14px', fontSize: 13, fontWeight: 700, cursor: 'pointer', pointerEvents: 'auto' };
const finishBtn = { position: 'absolute', bottom: 18, left: '50%', transform: 'translateX(-50%)', zIndex: 20, background: colors.primary, color: '#fff', border: 'none', borderRadius: 16, padding: '13px 26px', fontSize: 15, fontWeight: 800, cursor: 'pointer', boxShadow: '0 8px 24px rgba(0,0,0,0.35)' };
const overlay = { position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 30 };
const rewardCard = { background: '#fff', borderRadius: 24, padding: '28px 24px', textAlign: 'center', maxWidth: 320, width: '85%', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' };
const btn = { marginTop: 16, padding: '12px 20px', background: colors.primary, color: '#fff', border: 'none', borderRadius: 16, fontSize: 15, fontWeight: 700, cursor: 'pointer' };

export default BookGame;
