// LukoHealth.jsx — بازطراحی هماهنگ با صفحه اصلی (تم پریمیوم، RTL، فونت Shoor)
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import {
  HiOutlineHome, HiOutlineUser, HiOutlineFire, HiOutlinePlay, HiOutlineHeart,
  HiOutlineCog, HiOutlineChevronLeft, HiOutlineSparkles,
} from 'react-icons/hi';

import Header from '../components/common/Header';
import SecretsSection from '../components/luko-health/SecretsSection';
import MoodReminderModal from '../components/luko-health/MoodReminderModal';
import Icon43 from '../icons/icon43.png';
import Icon44 from '../icons/icon44.png';
import Icon45 from '../icons/icon45.png';
import Icon46 from '../icons/icon46.png';
import Icon47 from '../icons/icon47.png';
import Icon48 from '../icons/icon48.png';

const LukoHealth = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const isMobile = true;

  const [activeTab, setActiveTab] = useState('لوکو سلامت');
  const [pressedItem, setPressedItem] = useState(null);
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathPhase, setBreathPhase] = useState('rest');
  const [breathCount, setBreathCount] = useState(0);
  const [progress, setProgress] = useState(0);
  const [selectedGardenAction, setSelectedGardenAction] = useState(null);
  const [showMessage, setShowMessage] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [showMoodModal, setShowMoodModal] = useState(false);

  const phaseInterval = useRef(null);
  const progressInterval = useRef(null);
  const animationTimeout = useRef(null);
  const messageTimeout = useRef(null);

  // پالت هماهنگ با صفحه اصلی + کلیدهای موردنیاز SecretsSection (بدون تغییر آن کامپوننت)
  const colors = {
    primary: '#E0F2F1', primaryLight: '#E0F2F1', primaryDark: '#2E9E93',
    blue: '#4DB6AC', purple: '#BA68C8', amber: '#F6B100',
    bg: '#EEF4F3', cardBg: '#FFFFFF', text: '#37474F', textSecondary: '#78909C', textSoft: '#78909C',
  };
  const TEAL = '#4DB6AC';

  const checkMoodReminder = useCallback(() => {
    const lastMood = localStorage.getItem('luko_last_mood_time');
    if (!lastMood) { setShowMoodModal(true); return; }
    if (Date.now() - parseInt(lastMood, 10) >= 4 * 60 * 60 * 1000) { setShowMoodModal(true); }
  }, []);

  const handleMoodSelect = (mood) => {
    const now = Date.now();
    localStorage.setItem('luko_last_mood_time', now);
    localStorage.setItem('luko_last_mood', mood);
    const today = new Date().toDateString();
    if (!localStorage.getItem(`luko_mood_${today}`)) {
      localStorage.setItem(`luko_mood_${today}`, mood);
    }
  };

  useEffect(() => {
    checkMoodReminder();
    const interval = setInterval(() => {
      const lastMood = localStorage.getItem('luko_last_mood_time');
      if (lastMood && Date.now() - parseInt(lastMood, 10) >= 4 * 60 * 60 * 1000 && !showMoodModal) {
        setShowMoodModal(true);
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [checkMoodReminder, showMoodModal]);

  useEffect(() => {
    if (isBreathing) {
      let p = 0;
      progressInterval.current = setInterval(() => {
        p += 2.5;
        if (p >= 100) p = 0;
        setProgress(p);
      }, 100);
    } else {
      setProgress(0);
    }
    return () => clearInterval(progressInterval.current);
  }, [isBreathing]);

  const startBreathing = useCallback(() => {
    if (phaseInterval.current) clearInterval(phaseInterval.current);
    setIsBreathing(true);
    setBreathPhase('inhale');
    setBreathCount(1);
    setProgress(0);

    let count = 1;
    let currentPhase = 'inhale';

    phaseInterval.current = setInterval(() => {
      if (currentPhase === 'inhale') {
        currentPhase = 'exhale';
        setBreathPhase('exhale');
      } else {
        currentPhase = 'inhale';
        setBreathPhase('inhale');
        count++;
        setBreathCount(count);

        if (count > 5) {
          clearInterval(phaseInterval.current);
          clearInterval(progressInterval.current);
          setIsBreathing(false);
          setBreathPhase('rest');
          setBreathCount(0);
          setProgress(0);
        }
      }
    }, 4000);
  }, []);

  const handleGardenAction = (action, message) => {
    if (selectedGardenAction) {
      setWarningMessage('عزیز دلم اگه این کار رو کنیم باغچه خراب میشه');
      setTimeout(() => setWarningMessage(''), 3000);
      return;
    }
    if (isAnimating) return;

    setSelectedGardenAction(action);
    setShowMessage(message);
    setIsAnimating(true);

    if (animationTimeout.current) clearTimeout(animationTimeout.current);
    animationTimeout.current = setTimeout(() => setIsAnimating(false), 2000);

    if (messageTimeout.current) clearTimeout(messageTimeout.current);
    messageTimeout.current = setTimeout(() => setShowMessage(''), 3000);
  };

  const gardenActions = [
    { id: 'seed', icon: Icon46, label: 'دانه', message: 'دانه کاشتی! باغچه تو امروز سبزتر شد' },
    { id: 'water', icon: Icon47, label: 'آب', message: 'به گیاهات آب دادی! باغچه تو شاداب شد' },
    { id: 'care', icon: Icon48, label: 'کود', message: 'به باغچه ات کود دادی! قشنگ رشد کرد' },
  ];

  const navItems = useMemo(() => [
    { id: 'لوکو کلاب', name: 'کلاب', icon: HiOutlineFire, path: '/luko-club' },
    { id: 'لوکو تلویزیون', name: 'تلویزیون', icon: HiOutlinePlay, path: '/entertainment' },
    { id: 'خانه', name: 'خانه', icon: HiOutlineHome, path: '/' },
    { id: 'لوکو سلامت', name: 'سلامت', icon: HiOutlineHeart, path: '/luko-health' },
    { id: 'پروفایل', name: 'پروفایل', icon: HiOutlineUser, path: '/profile' },
  ], []);

  const go = (path, id) => { setPressedItem(id); setTimeout(() => { setPressedItem(null); navigate(path); }, 110); };
  const scale = (id) => (pressedItem === id ? 'scale(0.97)' : 'scale(1)');
  const pressable = (path, id, label) => ({
    role: 'button', tabIndex: 0, 'aria-label': label,
    onClick: () => go(path, id),
    onKeyDown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(path, id); } },
    style: { cursor: 'pointer', outline: 'none' },
  });

  return (
    <div style={{ minHeight: '100vh', background: colors.bg, fontFamily: "'Shoor', 'Shoor Rounded', sans-serif", direction: 'rtl', paddingBottom: '90px', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 'min(600px, 100%)', position: 'relative' }}>

        <Header
          title="لوکو سلامت"
          user={user}
          showGreeting={false}
          onProfileClick={() => navigate('/profile')}
          rightAction={
            <div
              role="button" tabIndex={0} aria-label="تنظیمات"
              onClick={() => navigate('/profile')}
              style={{ width: 52, height: 52, borderRadius: 18, background: 'linear-gradient(180deg,#FFFFFF 0%,#F8FAFF 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 20px rgba(0,0,0,0.06)', cursor: 'pointer' }}
            >
              <HiOutlineCog size={24} color="#202540" />
            </div>
          }
        />

        <div style={{ padding: '4px clamp(12px, 3vw, 16px) 20px', display: 'flex', flexDirection: 'column', gap: 22 }}>

          {/* ===== BREATHING ===== */}
          <section
            className="loko-anim"
            style={{ position: 'relative', overflow: 'hidden', borderRadius: 28, background: 'linear-gradient(160deg, #E4F5F3 0%, #FFFFFF 62%)', padding: '20px 18px 24px', textAlign: 'center', boxShadow: '0 14px 34px rgba(46,158,147,0.12)' }}
          >
            <div style={{ position: 'absolute', width: 180, height: 180, borderRadius: '50%', background: 'rgba(77,182,172,0.10)', top: -80, right: -50 }} />
            <div style={{ position: 'absolute', width: 120, height: 120, borderRadius: '50%', background: 'rgba(186,104,200,0.08)', bottom: -50, left: -30 }} />

            <div style={{ position: 'relative' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(77,182,172,0.14)', color: colors.primaryDark, padding: '5px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700 }}>
                <HiOutlineSparkles size={14} /> لحظه‌ی آرامش
              </span>
              <h2 style={{ color: colors.text, margin: '12px 0 4px' }}>بیا با هم نفس بکشیم</h2>
              <p style={{ margin: 0, fontSize: 13, color: colors.textSecondary, fontWeight: 600 }}>اگر آماده‌ای روی روباه بزن تا شروع کنیم</p>

              <div
                {...(!isBreathing ? { role: 'button', tabIndex: 0, 'aria-label': 'شروع تمرین تنفس', onClick: startBreathing, onKeyDown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); startBreathing(); } } } : {})}
                style={{ cursor: !isBreathing ? 'pointer' : 'default', position: 'relative', margin: '18px auto 6px', width: 'clamp(180px, 52vw, 230px)', height: 'clamp(180px, 52vw, 230px)', outline: 'none' }}
              >
                <svg width="100%" height="100%" viewBox="0 0 240 240">
                  <circle cx="120" cy="120" r="100" fill="none" stroke="rgba(77,182,172,0.20)" strokeWidth="9" />
                  {isBreathing && (
                    <circle
                      cx="120" cy="120" r="100" fill="none"
                      stroke={TEAL}
                      strokeWidth="9"
                      strokeDasharray={`${2 * Math.PI * 100}`}
                      strokeDashoffset={`${2 * Math.PI * 100 * (1 - progress / 100)}`}
                      strokeLinecap="round"
                      transform="rotate(-90 120 120)"
                      style={{ transition: 'stroke-dashoffset 0.1s linear', filter: 'drop-shadow(0 0 10px rgba(77,182,172,0.5))' }}
                    />
                  )}
                </svg>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: `translate(-50%, -50%) ${isBreathing && breathPhase === 'inhale' ? 'scale(1.06)' : 'scale(1)'}`, width: 'clamp(96px, 30vw, 140px)', height: 'clamp(96px, 30vw, 140px)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 3.6s ease-in-out' }}>
                  <img src={Icon44} alt="روباه تمرین تنفس" style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.12))' }} />
                </div>
              </div>

              {isBreathing ? (
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: breathPhase === 'inhale' ? colors.blue : colors.purple, marginBottom: 2 }}>
                    {breathPhase === 'inhale' ? 'نفس بگیر...' : 'نفس بده بیرون...'}
                  </div>
                  <div style={{ fontSize: 34, fontWeight: 900, color: breathPhase === 'inhale' ? colors.blue : colors.purple, lineHeight: 1 }}>{breathCount}</div>
                  <div style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>از ۵</div>
                </div>
              ) : (
                <div style={{ marginTop: 10, fontSize: 13, fontWeight: 700, color: colors.blue, animation: 'pulseText 1.6s infinite' }}>
                  👆 روی روباه بزن
                </div>
              )}
            </div>
          </section>

          {/* ===== PODCAST (هماهنگ با صفحه اصلی) ===== */}
<section>
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '4px 2px 12px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
      <div style={{ width: 34, height: 34, borderRadius: 12, background: 'linear-gradient(135deg,#8E6BE0,#6A48B0)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 6px 14px rgba(106,72,176,0.3)' }}>
        <span style={{ fontSize: 16 }} aria-hidden>🎧</span>
      </div>
      <div style={{ minWidth: 0 }}>
        <h2 style={{ color: colors.text, margin: 0 }}>پادکست آرامش‌بخش</h2>
        <p style={{ margin: '1px 0 0', fontSize: 11.5, color: colors.textSoft, fontWeight: 600 }}>گوش بده و آروم شو</p>
      </div>
    </div>
    <button
      {...pressable('/luko-podcast', 'pod_all', 'مشاهده همه پادکست‌ها')}
      style={{ display: 'flex', alignItems: 'center', gap: 2, background: 'transparent', border: 'none', color: '#7E57C2', fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 }}
    >
      مشاهده همه <HiOutlineChevronLeft size={14} />
    </button>
  </div>

  <div
    {...pressable('/luko-podcast', 'podcast_card', 'پخش پادکست داستان‌های آرامش‌بخش')}
    className="loko-anim"
    style={{ position: 'relative', overflow: 'hidden', borderRadius: 24, background: 'linear-gradient(135deg, #8E6BE0 0%, #7B57E8 50%, #6A48B0 100%)', minHeight: 128, padding: '16px 18px', color: '#fff', boxShadow: '0 16px 34px rgba(106,72,176,0.30)', transform: scale('podcast_card'), transition: 'transform .12s ease' }}
  >
    <div style={{ position: 'absolute', width: 170, height: 170, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', top: -80, right: -40 }} />
    <div style={{ position: 'absolute', width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', bottom: -50, left: 30 }} />

    <img src={Icon45} alt="" aria-hidden className="loko-float" style={{ position: 'absolute', bottom: -4, left: 8, width: 104, objectFit: 'contain', zIndex: 2, pointerEvents: 'none', filter: 'drop-shadow(0 12px 20px rgba(50,20,100,0.28))' }} />

    <div style={{ position: 'relative', zIndex: 3, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', textAlign: 'right', height: '100%', justifyContent: 'flex-end', gap: 10 }}>
      <div style={{ width: '100%', display: 'flex', direction: 'ltr', justifyContent: 'flex-end' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.20)', padding: '5px 12px', borderRadius: 999, fontSize: 11.5, fontWeight: 700, backdropFilter: 'blur(6px)' }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#fff', boxShadow: '0 0 8px #fff' }} /> پادکست ویژه
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, width: '100%' }}>
        <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(180deg,#FFFFFF,#F5EEFF)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 8px 20px rgba(60,30,120,0.28)' }}>
          <HiOutlinePlay size={22} color="#7B57E8" style={{ marginRight: -2 }} />
        </div>
        <div style={{ flex: 1, textAlign: 'right' }}>
          <h3 style={{ margin: 0, color: '#fff' }}>داستان‌های آرامش‌بخش</h3>
          <p style={{ margin: '4px 0 0', fontSize: 12.5, fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>🪙 گوش بده و ۲۵ امتیاز بگیر</p>
        </div>
      </div>
    </div>
  </div>
</section>

          {/* ===== GARDEN ===== */}
          <section>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '4px 2px 12px' }}>
              <div style={{ width: 34, height: 34, borderRadius: 12, background: 'linear-gradient(135deg,#66BB6A,#43A047)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 6px 14px rgba(67,160,71,0.28)' }}>
                <span style={{ fontSize: 16 }} aria-hidden>🌱</span>
              </div>
              <div>
                <h2 style={{ color: colors.text, margin: 0 }}>باغچه‌ی تو</h2>
                <p style={{ margin: '1px 0 0', fontSize: 11.5, color: colors.textSoft, fontWeight: 600 }}>امروز به باغچه‌ات برس و سبزش کن</p>
              </div>
            </div>

            {warningMessage && (
              <div style={{ backgroundColor: '#FFF3D6', borderRadius: 16, padding: '10px 14px', marginBottom: 12, fontSize: 13, color: '#E65100', textAlign: 'center', animation: 'fadeInUp 0.3s ease', borderRight: '4px solid #FF9800', fontWeight: 600 }}>
                {warningMessage}
              </div>
            )}

            <div
              style={{ position: 'relative', borderRadius: 24, overflow: 'hidden', boxShadow: '0 14px 32px rgba(0,0,0,0.10)', backgroundImage: `url(${Icon43})`, backgroundSize: 'cover', backgroundPosition: 'center', minHeight: 'clamp(220px, 60vw, 360px)' }}
            >
              {isAnimating && (
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '100%', background: 'linear-gradient(180deg, rgba(76,175,80,0) 0%, rgba(76,175,80,0.5) 100%)', animation: 'greenFlash 2s ease-out forwards', zIndex: 1 }} />
              )}
              {isAnimating && (
                <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2 }}>
                  {[...Array(30)].map((_, i) => (
                    <div key={i} style={{ position: 'absolute', left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, width: 6, height: 6, borderRadius: '50%', backgroundColor: '#4CAF50', animation: `particleFly ${Math.random() * 1 + 0.8}s ease-out forwards` }} />
                  ))}
                </div>
              )}
              {showMessage && isAnimating && (
                <div style={{ position: 'absolute', top: '14%', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(10px)', borderRadius: 16, padding: '8px 16px', fontSize: 13, color: colors.text, textAlign: 'center', fontWeight: 700, whiteSpace: 'nowrap', zIndex: 10, animation: 'fadeInUp 0.3s ease', maxWidth: '90%', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {showMessage}
                </div>
              )}

              <div style={{ position: 'relative', zIndex: 3, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', minHeight: 'clamp(220px, 60vw, 360px)', padding: 'clamp(14px, 3vw, 24px)' }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 'clamp(20px, 8vw, 40px)' }}>
                  {gardenActions.map((action) => {
                    const isSelected = selectedGardenAction === action.id;
                    const isDisabled = selectedGardenAction !== null && !isSelected;
                    return (
                      <button
                        key={action.id}
                        onClick={() => !isSelected && handleGardenAction(action.id, action.message)}
                        disabled={isSelected}
                        aria-label={action.label}
                        style={{
                          background: 'transparent', border: 'none', cursor: isSelected ? 'default' : 'pointer',
                          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: 6, borderRadius: '50%',
                          transition: 'all 0.3s ease',
                          opacity: isSelected ? 1 : (isDisabled ? 0.4 : 1),
                          filter: isSelected ? 'drop-shadow(0 0 16px rgba(76,175,80,0.9))' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
                          transform: isSelected ? 'scale(1.08)' : 'scale(1)',
                        }}
                      >
                        <img src={action.icon} alt={action.label} style={{ width: 'clamp(45px, 14vw, 60px)', height: 'clamp(45px, 14vw, 60px)', objectFit: 'contain' }} />
                        <span style={{ fontSize: 12, fontWeight: 600, color: 'white', textShadow: '0 1px 2px rgba(0,0,0,0.3)', backgroundColor: 'rgba(0,0,0,0.3)', padding: '3px 10px', borderRadius: 20, backdropFilter: 'blur(4px)' }}>
                          {action.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* ===== SECRETS (کامپوننت بدون تغییر) ===== */}
          <SecretsSection colors={colors} isMobile={true} />
        </div>
      </div>

      {/* منوی پایین — استاندارد و هماهنگ با بقیه صفحات */}
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 'min(600px, 100%)', background: colors.cardBg, boxShadow: '0 -2px 20px rgba(0,0,0,0.08)', borderRadius: '28px 28px 0 0', padding: isMobile ? '10px 12px' : '12px 20px', display: 'flex', justifyContent: 'space-around', alignItems: 'center', zIndex: 100 }}>
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.id;
          return (
            <div
              key={item.id}
              onClick={() => { setActiveTab(item.id); navigate(item.path); }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
            >
              <IconComponent size={isMobile ? 20 : 22} color={isActive ? colors.blue : '#999'} />
              <span style={{ fontSize: isMobile ? '9px' : '10px', color: isActive ? colors.blue : '#999', fontWeight: isActive ? '600' : '400' }}>{item.name}</span>
              {isActive && <div style={{ width: '4px', height: '4px', borderRadius: '2px', background: colors.blue, marginTop: '2px' }} />}
            </div>
          );
        })}
      </div>

      <MoodReminderModal isOpen={showMoodModal} onClose={() => setShowMoodModal(false)} onMoodSelect={handleMoodSelect} />

      <style>{`
        @keyframes homeFadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes homeFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-7px); } }
        @keyframes pulseText { 0%, 100% { opacity: 0.55; transform: translateY(0); } 50% { opacity: 1; transform: translateY(-3px); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translate(-50%, 10px); } to { opacity: 1; transform: translate(-50%, 0); } }
        @keyframes greenFlash { 0% { opacity: 0; transform: translateY(100%); } 30% { opacity: 1; transform: translateY(0); } 100% { opacity: 0; transform: translateY(0); } }
        @keyframes particleFly { 0% { opacity: 1; transform: translateY(0) scale(1); } 100% { opacity: 0; transform: translateY(-60px) scale(0.3); } }
        .loko-anim { animation: homeFadeUp .45s ease both; }
        .loko-float { animation: homeFloat 3.4s ease-in-out infinite; }
        ::-webkit-scrollbar { display: none; }
        * { margin: 0; padding: 0; box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        div { user-select: none; } button { font-family: inherit; } input { user-select: text; }
      `}</style>
    </div>
  );
};

export default LukoHealth;