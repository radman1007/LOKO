import React, { useEffect, useRef, useState } from 'react';
import { HiOutlinePlay } from 'react-icons/hi';
import Icon11 from '../../icons/icon11.png';

const LukoClubCard = ({ 
  missions = [], 
  completedTasks = [], 
  hasWatchedVideoToday, 
  onCardClick // پراپ جدید برای هدایت
}) => {
  const scrollRef = useRef(null);
  const hideTimer = useRef(null);
  const [showArrow, setShowArrow] = useState(false);
  const [pressedItem, setPressedItem] = useState(null);

  const triggerArrow = () => {
    setShowArrow(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setShowArrow(false), 1800);
  };

  useEffect(() => { triggerArrow(); }, []);

  const scrollCards = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -150, behavior: 'smooth' });
      triggerArrow();
    }
  };

  return (
    <div style={{ width: '100%', direction: 'rtl', marginTop: 26, marginBottom: 24 }}>
      <div style={{ display: 'flex', flexDirection: 'column', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <img src={Icon11} alt="luko club" style={{ width: 22, height: 22, objectFit: 'contain', flexShrink: 0 }} />
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#1F2544' }}>ماموریت های امروز</h3>
        </div>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: '#7B8199', paddingRight: 30 }}>
        ماموریت های روزانه
        </p>
      </div>

      <div style={{ position: 'relative' }}>
        <button onClick={scrollCards} style={{ position: 'absolute', left: 6, top: '50%', transform: showArrow ? 'translateY(-50%) translateX(0)' : 'translateY(-50%) translateX(-10px)', opacity: showArrow ? 1 : 0, pointerEvents: showArrow ? 'auto' : 'none', width: 34, height: 34, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.96)', boxShadow: '0 4px 14px rgba(0,0,0,0.12)', zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all .28s ease', backdropFilter: 'blur(10px)', fontSize: 16, fontWeight: 900 }}>←</button>

        <div ref={scrollRef} onScroll={triggerArrow} onTouchStart={triggerArrow} style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8, scrollBehavior: 'smooth', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {missions.map((mission) => {
            const isCompleted = completedTasks.includes(mission.id);
            const alreadyWatched = hasWatchedVideoToday?.(mission.videoTitle);
            const isDisabled = isCompleted || alreadyWatched;

            return (
              <div
                key={mission.id}
                onClick={() => onCardClick()} // هر جای کارت کلیک بشه میره لوکو کلاب
                onMouseDown={() => setPressedItem(`mission_${mission.id}`)}
                onMouseUp={() => setTimeout(() => setPressedItem(null), 100)}
                onMouseLeave={() => setPressedItem(null)}
                style={{
                  flex: '0 0 145px', background: '#fff', borderRadius: 16, padding: '12px 10px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', boxSizing: 'border-box',
                  boxShadow: '0 3px 10px rgba(0,0,0,0.06)', cursor: 'pointer', 
                  opacity: isDisabled ? 0.6 : 1, transition: 'transform .08s ease',
                  transform: pressedItem === `mission_${mission.id}` ? 'scale(0.96)' : 'scale(1)'
                }}
              >
                <div style={{ width: 56, height: 56, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10, background: mission.bgColor || '#E3F2FD', position: 'relative' }}>
                  <img src={mission.iconSrc} alt={mission.title} style={{ width: 34, height: 34, objectFit: 'contain' }} />
                  
                  {!isDisabled && (
                    <div style={{ position: 'absolute', bottom: -4, right: -4, backgroundColor: '#FF5252', borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(255,82,82,0.4)' }}>
                      <HiOutlinePlay size={9} color="white" style={{ marginLeft: 1 }} />
                    </div>
                  )}
                </div>

                <div style={{ fontSize: 12, fontWeight: 700, color: '#222', textAlign: 'center', lineHeight: '18px', minHeight: 36, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: 8 }}>
                  {mission.title}
                </div>

                <div style={{ fontSize: 10, fontWeight: 700, color: isDisabled ? '#888' : '#4CAF82', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: isDisabled ? '#ccc' : '#4CAF82' }} />
                  <span>{isCompleted ? 'انجام شد' : (alreadyWatched ? 'در انتظار' : `+${mission.xp} امتیاز`)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LukoClubCard;