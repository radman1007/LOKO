import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { 
  HiOutlineHome, 
  HiOutlineUser,
  HiOutlineFire,
  HiOutlinePlay,
  HiOutlineHeart,
  HiOutlineCog
} from 'react-icons/hi';

// ایمپورت آیکون‌ها
import Icon42 from '../icons/icon42.png';
import Icon43 from '../icons/icon43.png';
import Icon44 from '../icons/icon44.png';
import Icon45 from '../icons/icon45.png';
import Icon46 from '../icons/icon46.png';
import Icon47 from '../icons/icon47.png';
import Icon48 from '../icons/icon48.png';

// ایمپورت کامپوننت‌های جدید
import SecretsSection from '../components/luko-health/SecretsSection';
import MoodReminderModal from '../components/luko-health/MoodReminderModal';

const LukoHealth = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('لوکو سلامت');
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathPhase, setBreathPhase] = useState('rest');
  const [breathCount, setBreathCount] = useState(0);
  const [progress, setProgress] = useState(0);
  const [selectedGardenAction, setSelectedGardenAction] = useState(null);
  const [showMessage, setShowMessage] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  
  // Stateهای جدید برای مودال
  const [showMoodModal, setShowMoodModal] = useState(false);
  const [todayMood, setTodayMood] = useState(null);
  
  const phaseInterval = useRef(null);
  const progressInterval = useRef(null);
  const animationTimeout = useRef(null);
  const messageTimeout = useRef(null);

  const colors = {
    primary: '#E0F2F1',
    secondary: '#F3E5F5',
    accent: '#E1F5FE',
    warm: '#FFFDE0',
    text: '#455A64',
    cardBg: '#F1FBFA',
    white: '#FFFFFF',
    purple: '#BA68C8',
    blue: '#4DB6AC',
    podcastBg: '#FBE7CC',
    podcastBtn: '#C57948'
  };

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // چک کردن مودال هر ۴ ساعت
  const checkMoodReminder = useCallback(() => {
    const lastMood = localStorage.getItem('luko_last_mood_time');
    const savedTodayMood = localStorage.getItem('luko_today_mood');
    
    if (savedTodayMood) {
      setTodayMood(savedTodayMood);
    }
    
    if (!lastMood) {
      setShowMoodModal(true);
      return;
    }
    
    const lastTime = parseInt(lastMood);
    const now = Date.now();
    const fourHours = 4 * 60 * 60 * 1000;
    
    if (now - lastTime >= fourHours) {
      setShowMoodModal(true);
    }
  }, []);

  // ثبت مود
  const handleMoodSelect = (mood) => {
    const now = Date.now();
    localStorage.setItem('luko_last_mood_time', now);
    localStorage.setItem('luko_last_mood', mood);
    
    const today = new Date().toDateString();
    const savedTodayMood = localStorage.getItem(`luko_mood_${today}`);
    if (!savedTodayMood) {
      localStorage.setItem(`luko_mood_${today}`, mood);
      setTodayMood(mood);
    }
  };

  useEffect(() => {
    checkMoodReminder();
    
    const interval = setInterval(() => {
      const lastMood = localStorage.getItem('luko_last_mood_time');
      if (lastMood) {
        const lastTime = parseInt(lastMood);
        const now = Date.now();
        const fourHours = 4 * 60 * 60 * 1000;
        if (now - lastTime >= fourHours && !showMoodModal) {
          setShowMoodModal(true);
        }
      }
    }, 60000);
    
    return () => clearInterval(interval);
  }, [checkMoodReminder, showMoodModal]);

  const isMobile = windowWidth < 768;
  const isDesktop = windowWidth >= 1024;

  // انیمیشن پیشرفت نوار وضعیت
  useEffect(() => {
    if (isBreathing) {
      let p = 0;
      progressInterval.current = setInterval(() => {
        p += 2.5;
        if (p >= 100) {
          p = 0;
        }
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
    animationTimeout.current = setTimeout(() => {
      setIsAnimating(false);
    }, 2000);
    
    if (messageTimeout.current) clearTimeout(messageTimeout.current);
    messageTimeout.current = setTimeout(() => {
      setShowMessage('');
    }, 3000);
  };

  const gardenActions = [
    { id: 'seed', icon: Icon46, label: 'دانه', message: 'دانه کاشتی! باغچه تو امروز سبزتر شد' },
    { id: 'water', icon: Icon47, label: 'آب', message: 'به گیاهات آب دادی! باغچه تو امروز شاداب شد' },
    { id: 'care', icon: Icon48, label: 'کود', message: 'به باغچه ات کود دادی! باغچه تو امروز قشنگ رشد کرد' }
  ];

  const navItems = useMemo(() => [
    { id: 'لوکو کلاب', name: 'کلاب', icon: HiOutlineFire, path: '/luko-club' },
    { id: 'لوکو تلویزیون', name: 'تلویزیون', icon: HiOutlinePlay, path: '/entertainment' },
    { id: 'خانه', name: 'خانه', icon: HiOutlineHome, path: '/' },
    { id: 'لوکو سلامت', name: 'سلامت', icon: HiOutlineHeart, path: '/luko-health' },
    { id: 'پروفایل', name: 'پروفایل', icon: HiOutlineUser, path: '/profile' }
  ], []);

  const getProgressColor = () => {
    const hue = (Date.now() / 50) % 360;
    return `hsl(${hue}, 70%, 55%)`;
  };

  return (
    <div style={{
      minHeight: '100vh',
      fontFamily: "'Shoor', 'Shoor Rounded', sans-serif",
      direction: 'rtl',
      paddingBottom: '80px',
      background: `linear-gradient(180deg, ${colors.accent} 0%, ${colors.primary} 100%)`
    }}>
      
      {/* Header */}
      <div style={{
        height: "150px",
        position: 'relative',
        overflow: 'hidden',
        direction: "ltr",
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url(${Icon42})`,
          backgroundSize: "cover",
          backgroundPosition: 'center'
        }} />
        
        <div style={{
          position: 'relative',
          zIndex: 2,
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 16px'
        }}>
          <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-start' }}>
            <div
              onClick={() => navigate('/settings')}
              style={{
                cursor: 'pointer',
                background: 'rgba(255,255,255,0.3)',
                backdropFilter: 'blur(8px)',
                borderRadius: '50%',
                padding: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <HiOutlineCog size={22} color={colors.text} />
            </div>
          </div>
          
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{
              background: 'rgba(255,255,255,0.3)',
              backdropFilter: 'blur(8px)',
              borderRadius: '40px',
              padding: '8px 20px',
              display: 'inline-block',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}>
              <h1 style={{ fontSize: isMobile ? '18px' : '22px', fontWeight: '700', color: colors.text }}>
                سلامت لوکو
              </h1>
            </div>
          </div>
          
          <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
            <div
              onClick={() => navigate('/profile')}
              style={{ cursor: 'pointer', transition: 'transform 0.2s ease' }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <div style={{
                width: isMobile ? '44px' : '50px',
                height: isMobile ? '44px' : '50px',
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${colors.blue}, ${colors.purple})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                border: '2px solid white',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}>
                {user?.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt="avatar" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                ) : (
                  <HiOutlineUser size={24} color="white" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{
        borderTopLeftRadius: '32px',
        borderTopRightRadius: '32px',
        backgroundColor: colors.cardBg,
        marginTop: '-20px',
        position: 'relative',
        zIndex: 10,
        padding: isMobile ? '28px 20px' : '40px 32px',
        minHeight: 'calc(100vh - 150px)',
        boxShadow: '0 -10px 30px rgba(0,0,0,0.05)'
      }}>
        
        {/* Breathing Exercise Section */}
        <div style={{
          background: `linear-gradient(135deg, ${colors.secondary}, ${colors.accent})`,
          borderRadius: '32px',
          padding: '32px 24px',
          textAlign: 'center',
          boxShadow: '0 12px 30px rgba(0,0,0,0.08)',
          position: 'relative',
          overflow: 'hidden',
          marginBottom: '24px'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(77,182,172,0.08), rgba(186,104,200,0.08), rgba(255,193,7,0.05))',
            animation: 'rgbFlow 8s ease infinite'
          }} />
          
          <h3 style={{
            fontSize: isMobile ? '20px' : '24px',
            fontWeight: '700',
            color: colors.text,
            marginBottom: '12px',
            position: 'relative',
            zIndex: 2
          }}>
            بیا باهم نفس بکشیم
          </h3>
          <p style={{
            fontSize: '14px',
            color: colors.textSecondary,
            marginBottom: '40px',
            position: 'relative',
            zIndex: 2
          }}>
            اگر آماده بودی روی روباه بزن تا شروع کنیم
          </p>
          
          <div
            onClick={!isBreathing ? startBreathing : undefined}
            style={{
              cursor: !isBreathing ? 'pointer' : 'default',
              display: 'inline-block',
              position: 'relative',
              marginBottom: '24px'
            }}
          >
            <svg width={isMobile ? "180" : "220"} height={isMobile ? "180" : "220"} viewBox="0 0 240 240">
              <circle
                cx="120"
                cy="120"
                r="100"
                fill="none"
                stroke={`${colors.primary}80`}
                strokeWidth="8"
              />
              {isBreathing && (
                <circle
                  cx="120"
                  cy="120"
                  r="100"
                  fill="none"
                  stroke={getProgressColor()}
                  strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 100}`}
                  strokeDashoffset={`${2 * Math.PI * 100 * (1 - progress / 100)}`}
                  strokeLinecap="round"
                  transform="rotate(-90 120 120)"
                  style={{
                    transition: 'stroke-dashoffset 0.1s linear',
                    filter: 'drop-shadow(0 0 12px rgba(77,182,172,0.5))'
                  }}
                />
              )}
            </svg>
            
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: isMobile ? '100px' : '130px',
              height: isMobile ? '100px' : '130px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <img 
                src={Icon44} 
                alt="fox" 
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
                }} 
              />
            </div>
          </div>
          
          {isBreathing && (
            <div style={{
              marginTop: '16px',
              position: 'relative',
              zIndex: 2
            }}>
              <div style={{
                fontSize: isMobile ? '18px' : '20px',
                fontWeight: '700',
                color: breathPhase === 'inhale' ? colors.blue : colors.purple,
                marginBottom: '8px'
              }}>
                {breathPhase === 'inhale' ? 'نفس بگیر...' : 'نفس بده بیرون...'}
              </div>
              <div style={{
                fontSize: isMobile ? '32px' : '40px',
                fontWeight: 'bold',
                color: breathPhase === 'inhale' ? colors.blue : colors.purple
              }}>
                {breathCount}
              </div>
              <div style={{
                fontSize: '13px',
                color: colors.textSecondary
              }}>
                از 5
              </div>
            </div>
          )}
          
          {!isBreathing && (
            <div style={{
              marginTop: '24px',
              fontSize: '14px',
              color: colors.blue,
              opacity: 0.8,
              position: 'relative',
              zIndex: 2,
              animation: 'pulseText 1.5s infinite'
            }}>
              روی روباه بزن
            </div>
          )}
        </div>

{/* Podcast Section */}
<div style={{
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '16px'
}}>
  <h3 style={{
    fontSize: isMobile ? '16px' : '18px',
    fontWeight: '700',
    color: colors.text
  }}>
    پادکست گوش بده
  </h3>
  <button
    onClick={() => navigate('/luko-podcast')}
    style={{
      background: 'transparent',
      border: 'none',
      color: colors.blue,
      fontSize: '13px',
      fontWeight: '500',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      transition: 'opacity 0.2s ease'
    }}
    onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
    onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
  >
    مشاهده همه
    <span style={{ fontSize: '14px' }}>›</span>
  </button>
</div>

<div style={{
  backgroundColor: colors.podcastBg,
  borderRadius: '24px',
  padding: isMobile ? '20px' : '24px',
  boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  marginBottom: '24px',
  cursor: 'pointer'
}}
onClick={() => navigate('/luko-podcast')}
onMouseEnter={(e) => {
  e.currentTarget.style.transform = 'translateY(-5px)';
  e.currentTarget.style.boxShadow = '0 15px 35px rgba(0,0,0,0.15)';
}}
onMouseLeave={(e) => {
  e.currentTarget.style.transform = 'translateY(0)';
  e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
}}>
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '20px',
    flexWrap: isMobile ? 'wrap' : 'nowrap'
  }}>
    <div style={{
      flexShrink: 0,
      width: isMobile ? '70px' : '85px',
      height: isMobile ? '70px' : '85px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <img 
        src={Icon45} 
        alt="podcast" 
        style={{ 
          width: '100%', 
          height: '100%', 
          objectFit: 'contain'
        }} 
      />
    </div>
    
    <div style={{
      flex: 1,
      textAlign: 'left',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '16px',
      direction:"ltr",
      flexWrap: isMobile ? 'wrap' : 'nowrap'
    }}>
      <div>
        <h4 style={{
          fontSize: isMobile ? '14px' : '16px',
          fontWeight: '600',
          color: colors.text,
          marginBottom: '4px'
        }}>
          داستان‌های آرامش‌بخش
        </h4>
        <p style={{
          fontSize: '11px',
          color: colors.textSecondary
        }}>
          گوش دادن به این پادکست بهت ۲۵ XP میده
        </p>
      </div>
      
      <div style={{
        backgroundColor: colors.podcastBtn,
        borderRadius: '40px',
        padding: isMobile ? '8px 20px' : '10px 24px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        cursor: 'pointer',
        transition: 'transform 0.2s ease, background 0.2s ease',
        boxShadow: '0 4px 12px rgba(197,121,72,0.3)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.05)';
        e.currentTarget.style.backgroundColor = '#B86438';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.backgroundColor = colors.podcastBtn;
      }}>
        <HiOutlinePlay size={18} color="white" />
        <span style={{
          fontSize: isMobile ? '12px' : '13px',
          fontWeight: '600',
          color: 'white'
        }}>
          گوش بده
        </span>
      </div>
    </div>
  </div>
</div>

        {/* Garden Section */}
        <div style={{
          marginBottom: '24px'
        }}>
          <h3 style={{
            fontSize: isMobile ? '16px' : '18px',
            fontWeight: '700',
            color: colors.text,
            marginBottom: '16px'
          }}>
            باغچه تو امروز سبز کن
          </h3>
          
          {warningMessage && (
            <div style={{
              backgroundColor: '#FFECB3',
              borderRadius: '20px',
              padding: '10px 16px',
              marginBottom: '16px',
              fontSize: '13px',
              color: '#E65100',
              textAlign: 'center',
              animation: 'fadeInUp 0.3s ease',
              borderRight: '4px solid #FF9800'
            }}>
              {warningMessage}
            </div>
          )}
          
          <div style={{
            position: 'relative',
            borderRadius: '28px',
            overflow: 'hidden',
            boxShadow: '0 12px 30px rgba(0,0,0,0.12), 0 4px 10px rgba(0,0,0,0.05)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            backgroundImage: `url(${Icon43})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            minHeight: isMobile ? '380px' : '420px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.12)';
          }}>
            
            {isAnimating && (
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '100%',
                background: 'linear-gradient(180deg, rgba(76,175,80,0) 0%, rgba(76,175,80,0.5) 100%)',
                animation: 'greenFlash 2s ease-out forwards',
                zIndex: 1
              }} />
            )}
            
            {isAnimating && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                pointerEvents: 'none',
                zIndex: 2
              }}>
                {[...Array(30)].map((_, i) => (
                  <div
                    key={i}
                    style={{
                      position: 'absolute',
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: '#4CAF50',
                      opacity: 1,
                      animation: `particleFly ${Math.random() * 1 + 0.8}s ease-out forwards`
                    }}
                  />
                ))}
              </div>
            )}
            
            {showMessage && isAnimating && (
              <div style={{
                position: 'absolute',
                top: '20%',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: 'rgba(255,255,255,0.9)',
                backdropFilter: 'blur(10px)',
                borderRadius: '20px',
                padding: '12px 20px',
                fontSize: '14px',
                color: colors.text,
                textAlign: 'center',
                fontWeight: '600',
                whiteSpace: 'nowrap',
                zIndex: 10,
                animation: 'fadeInUp 0.3s ease'
              }}>
                {showMessage}
              </div>
            )}
            
            <div style={{
              position: 'relative',
              zIndex: 3,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              minHeight: isMobile ? '380px' : '420px',
              padding: '24px'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '30px',
                padding: '16px'
              }}>
                {gardenActions.map((action) => {
                  const isSelected = selectedGardenAction === action.id;
                  const isDisabled = selectedGardenAction !== null && !isSelected;
                  
                  return (
                    <button
                      key={action.id}
                      onClick={() => !isSelected && handleGardenAction(action.id, action.message)}
                      disabled={isSelected}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: isSelected ? 'default' : 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px',
                        borderRadius: '50%',
                        transition: 'all 0.3s ease',
                        opacity: isSelected ? 1 : (isDisabled ? 0.4 : 1),
                        filter: isSelected 
                          ? 'drop-shadow(0 0 16px rgba(76,175,80,0.9))' 
                          : 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
                        transform: isSelected ? 'scale(1.08)' : 'scale(1)'
                      }}
                    >
                      <img 
                        src={action.icon} 
                        alt={action.label} 
                        style={{ 
                          width: '55px', 
                          height: '55px', 
                          objectFit: 'contain',
                          transition: 'transform 0.3s ease'
                        }} 
                      />
                      <span style={{
                        fontSize: '12px',
                        fontWeight: '500',
                        color: 'white',
                        textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                        backgroundColor: 'rgba(0,0,0,0.3)',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        backdropFilter: 'blur(4px)'
                      }}>
                        {action.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* بخش رازهای من - کامپوننت جدید */}
        <SecretsSection colors={colors} isMobile={isMobile} />
        
      </div>

      {/* Navigation Bar */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        right: 0,
        left: 0,
        background: 'white',
        boxShadow: '0 -2px 20px rgba(0,0,0,0.08)',
        borderRadius: '28px 28px 0 0',
        padding: isMobile ? '10px 12px' : '12px 20px',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        zIndex: 100,
        maxWidth: isDesktop ? '1200px' : '100%',
        margin: '0 auto'
      }}>
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.id;
          return (
            <div
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                navigate(item.path);
              }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer',
                transition: 'transform 0.05s linear'
              }}
              onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.92)'}
              onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <IconComponent 
                size={isMobile ? 20 : 22} 
                color={isActive ? colors.blue : '#999'}
              />
              <span style={{
                fontSize: isMobile ? '9px' : '10px',
                color: isActive ? colors.blue : '#999',
                fontWeight: isActive ? '600' : '400'
              }}>
                {item.name}
              </span>
              {isActive && (
                <div style={{
                  width: '4px',
                  height: '4px',
                  borderRadius: '2px',
                  background: colors.blue,
                  marginTop: '2px'
                }} />
              )}
            </div>
          );
        })}
      </div>

      {/* مودال انتخاب مود هر ۴ ساعت */}
      <MoodReminderModal
        isOpen={showMoodModal}
        onClose={() => setShowMoodModal(false)}
        onMoodSelect={handleMoodSelect}
      />

      <style>{`
        @keyframes rgbFlow {
          0% {
            background: linear-gradient(135deg, rgba(77,182,172,0.08), rgba(186,104,200,0.05), rgba(255,193,7,0.03));
          }
          33% {
            background: linear-gradient(135deg, rgba(186,104,200,0.08), rgba(255,193,7,0.05), rgba(77,182,172,0.03));
          }
          66% {
            background: linear-gradient(135deg, rgba(255,193,7,0.08), rgba(77,182,172,0.05), rgba(186,104,200,0.03));
          }
          100% {
            background: linear-gradient(135deg, rgba(77,182,172,0.08), rgba(186,104,200,0.05), rgba(255,193,7,0.03));
          }
        }
        
        @keyframes pulseText {
          0%, 100% { opacity: 0.5; transform: translateY(0); }
          50% { opacity: 1; transform: translateY(-3px); }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes greenFlash {
          0% {
            opacity: 0;
            transform: translateY(100%);
          }
          30% {
            opacity: 1;
            transform: translateY(0);
          }
          100% {
            opacity: 0;
            transform: translateY(0);
          }
        }
        
        @keyframes particleFly {
          0% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(-60px) scale(0.3);
          }
        }
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          -webkit-tap-highlight-color: transparent;
        }
        div { user-select: none; }
        button { font-family: inherit; }
      `}</style>
    </div>
  );
};

export default LukoHealth;