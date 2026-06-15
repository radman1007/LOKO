import React, { useEffect, useRef, useState } from 'react';
import Icon11 from '../../icons/icon11.png';

const clubs = [
  {
    id: 1,
    name: 'ویدیو بسکتبال ببین',
    emoji: '🏀',
    members: 20,
    bg: '#E3F2FD',
  },
  {
    id: 2,
    name: 'چند صفحه فارسی بخون',
    emoji: '📖',
    members: 20,
    bg: '#F3E5F5',
  },
  {
    id: 4,
    name: 'یه نقاشی از درخت بکش',
    emoji: '🎨',
    members: 20,
    bg: '#FFF3E0',
  },
  {
    id: 5,
    name: 'پادکست گوش بده',
    emoji: '🎵',
    members: 20,
    bg: '#FFF8E1',
  },
];

const LukoClubCard = () => {
  const scrollRef = useRef(null);
  const hideTimer = useRef(null);

  const [showArrow, setShowArrow] =
    useState(false);

  const triggerArrow = () => {
    setShowArrow(true);

    clearTimeout(hideTimer.current);

    hideTimer.current = setTimeout(() => {
      setShowArrow(false);
    }, 1800);
  };

  useEffect(() => {
    triggerArrow();
  }, []);

  const scrollCards = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: -150,
        behavior: 'smooth',
      });

      triggerArrow();
    }
  };

  return (
    <div style={styles.wrapper}>
      {/* HEADER */}
      <div style={styles.headerContainer}>
        <div style={styles.header}>
          

       <div>
           <div style={{
            display:"flex"
          }}>
            <img 
            src={Icon11}
            alt="luko club"
            style={styles.headerIcon}
          />
            <h2 style={styles.title}>
              لوکو کلاب
            </h2>

           
          </div><div>
             <p style={styles.subtitle}>
              ماموریت‌های امروز رو کامل کن
            </p>
          </div>
       </div>
        </div>
      </div>

      {/* SLIDER */}
      <div style={styles.sliderWrapper}>
        {/* ARROW */}
        <button
          onClick={scrollCards}
          style={{
            ...styles.arrowButton,

            opacity: showArrow ? 1 : 0,

            pointerEvents: showArrow
              ? 'auto'
              : 'none',

            transform: showArrow
              ? 'translateY(-50%) translateX(0)'
              : 'translateY(-50%) translateX(-10px)',
          }}
        >
          ←
        </button>

        {/* CARDS */}
        <div
          ref={scrollRef}
          style={styles.scroll}
          onScroll={triggerArrow}
          onTouchStart={triggerArrow}
        >
          {clubs.map((club) => (
            <div
              key={club.id}
              style={styles.card}
            >
              {/* EMOJI */}
              <div
                style={{
                  ...styles.emojiBox,
                  background: club.bg,
                }}
              >
                {club.emoji}
              </div>

              {/* NAME */}
              <div style={styles.clubName}>
                {club.name}
              </div>

              {/* POINTS */}
              <div style={styles.points}>
                <span style={styles.dot} />

                <span>
                  {club.members} امتیاز
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    width: '100%',
    direction: 'rtl',

    marginTop: 26,
    marginBottom: 30,
  },

  headerContainer: {
    marginBottom: 16,
    paddingRight: 2,
  },

  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },

  headerIcon: {
    width: 22,
    height: 22,
    
    objectFit: 'contain',

    flexShrink: 0,
  },

  title: {
    margin: 0,

    fontSize: 17,
    fontWeight: 800,

    color: '#1F2544',

    marginBottom: 4,
  },

  subtitle: {
    margin: 0,

    fontSize: 13,
    fontWeight: 500,

    color: '#7B8199',

    lineHeight: '20px',
  },

  sliderWrapper: {
    position: 'relative',
  },

  scroll: {
    display: 'flex',
    gap: 12,

    overflowX: 'auto',

    paddingBottom: 8,

    scrollBehavior: 'smooth',

    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
  },

  card: {
    flex: '0 0 145px',

    background: '#fff',

    borderRadius: 16,

    padding: '12px 10px',

    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',

    boxSizing: 'border-box',

    boxShadow:
      '0 3px 10px rgba(0,0,0,0.06)',
  },

  emojiBox: {
    width: 56,
    height: 56,

    borderRadius: 16,

    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',

    fontSize: 28,

    marginBottom: 10,
  },

  clubName: {
    fontSize: 12,
    fontWeight: 700,

    color: '#222',

    textAlign: 'center',

    lineHeight: '18px',

    minHeight: 36,

    display: '-webkit-box',

    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',

    overflow: 'hidden',

    marginBottom: 8,
  },

  points: {
    fontSize: 10,
    fontWeight: 700,

    color: '#888',

    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },

  dot: {
    width: 6,
    height: 6,

    borderRadius: '50%',

    background: '#4CAF82',
  },

  arrowButton: {
    position: 'absolute',

    left: 6,
    top: '50%',

    width: 34,
    height: 34,

    borderRadius: '50%',

    border: 'none',

    background: 'rgba(255,255,255,0.96)',

    boxShadow:
      '0 4px 14px rgba(0,0,0,0.12)',

    zIndex: 20,

    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',

    cursor: 'pointer',

    transition: 'all .28s ease',

    backdropFilter: 'blur(10px)',

    fontSize: 16,
    fontWeight: 900,
  },
};

export default LukoClubCard;