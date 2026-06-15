import React from 'react';
import { HiOutlinePlay } from 'react-icons/hi';

const DailyMissions = ({ 
  missions, 
  completedTasks, 
  hasWatchedVideoToday, 
  onVideoClick, 
  onNonVideoClick, 
  colors, 
  isMobile, 
  pressedItem, 
  setPressedItem 
}) => {
  return (
    <div>
      <h3 style={{ fontSize: '18px', fontWeight: '700', color: colors.text, marginBottom: '16px' }}>
        ماموریت‌های روزانه
      </h3>
      
      <div style={{
        display: 'flex',
        overflowX: 'auto',
        gap: '16px',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        paddingBottom: '8px'
      }}>
        {missions.map((mission) => {
          const isCompleted = completedTasks.includes(mission.id);
          const isVideoMission = mission.type === 'video';
          const alreadyWatched = isVideoMission ? hasWatchedVideoToday(mission.videoTitle) : false;
          
          return (
            <div
              key={mission.id}
              onClick={() => {
                if (!isCompleted && !alreadyWatched) {
                  if (isVideoMission && mission.videoSrc) {
                    onVideoClick(mission.id, mission.videoSrc, mission.videoTitle, mission.xp);
                  } else {
                    onNonVideoClick(mission.id, mission.xp);
                  }
                } else if (alreadyWatched && !isCompleted) {
                  alert('شما این ویدیو را امروز تماشا کرده‌اید');
                }
              }}
              style={{
                minWidth: isMobile ? '110px' : '120px',
                width: isMobile ? '110px' : '120px',
                cursor: (isCompleted || alreadyWatched) ? 'default' : 'pointer',
                opacity: (isCompleted || alreadyWatched) ? 0.6 : 1,
                transition: 'transform 0.08s linear',
                transform: pressedItem === `mission_${mission.id}` ? 'scale(0.97)' : 'scale(1)',
                backgroundColor: colors.cardBg,
                borderRadius: '20px',
                padding: '12px 8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
              }}
              onMouseDown={() => !isCompleted && !alreadyWatched && setPressedItem(`mission_${mission.id}`)}
              onMouseUp={() => setTimeout(() => setPressedItem(null), 100)}
            >
              <div style={{
                width: '65px',
                height: '65px',
                margin: '0 auto 8px auto',
                backgroundColor: colors.iconBg,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}>
                <img src={mission.iconSrc} alt={mission.title} style={{ width: '38px', height: '38px', objectFit: 'contain' }} />
                {isVideoMission && !isCompleted && !alreadyWatched && (
                  <div style={{
                    position: 'absolute',
                    bottom: -5,
                    right: -5,
                    backgroundColor: colors.primary,
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <HiOutlinePlay size={10} color="white" />
                  </div>
                )}
              </div>
              
              <p style={{ fontSize: '11px', fontWeight: '600', color: colors.text, textAlign: 'center', marginBottom: '8px', lineHeight: 1.3 }}>
                {mission.title}
              </p>
              
              <div style={{
                backgroundColor: (isCompleted || alreadyWatched) ? '#E0E0E0' : colors.xpBg,
                borderRadius: '16px',
                padding: '4px 8px',
                textAlign: 'center'
              }}>
                <span style={{
                  fontSize: '10px',
                  fontWeight: 'bold',
                  color: (isCompleted || alreadyWatched) ? '#888' : colors.text
                }}>
                  {isCompleted ? 'انجام شد' : (alreadyWatched ? 'در انتظار' : `+${mission.xp} XP`)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DailyMissions;