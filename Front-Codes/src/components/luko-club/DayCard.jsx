// src/components/luko-club/DayCard.jsx
import React from 'react';
import Icon11 from '../../icons/icon11.png';

const DayCard = ({ 
  currentDay, 
  currentDayName, 
  tasksCompletedCount,
  totalTasksCount,
  progressPercent, 
  localMissionCompleted, 
  mainMissionData, 
  onCompleteMainMission,
  colors,
  isMobile 
}) => {
  return (
    <div style={{
      backgroundColor: colors.primaryDark,
      borderRadius: '28px',
      padding: '28px 24px',
      marginBottom: '24px',
      boxShadow: '0 12px 30px rgba(0,0,0,0.25)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
        <div style={{
          width: isMobile ? '80px' : '100px',
          height: isMobile ? '80px' : '100px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.2))'
        }}>
          <img src={Icon11} alt="club" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
      </div>

      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <p style={{ fontSize: '13px', fontWeight: '500', color: colors.text }}>پیشرفت {currentDayName}</p>
          <p style={{ fontSize: '13px', fontWeight: '600', color: colors.text }}>{Math.round(progressPercent)}%</p>
        </div>
        <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '12px', height: '10px', overflow: 'hidden' }}>
          <div style={{
            width: `${progressPercent}%`,
            background: colors.text,
            height: '100%',
            borderRadius: '12px',
            transition: 'width 0.3s ease'
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
          <p style={{ fontSize: '11px', color: colors.text }}>{tasksCompletedCount} / {totalTasksCount} تسک</p>
          <p style={{ fontSize: '11px', color: colors.text }}>روز بعد: {currentDay + 1}</p>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={onCompleteMainMission}
          disabled={localMissionCompleted}
          style={{
            width: '180px',
            padding: isMobile ? '10px 16px' : '12px 20px',
            background: localMissionCompleted ? '#E0E0E0' : 'white',
            border: 'none',
            borderRadius: '30px',
            cursor: localMissionCompleted ? 'not-allowed' : 'pointer',
            opacity: localMissionCompleted ? 0.7 : 1,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
        >
          <span style={{
            fontSize: isMobile ? '12px' : '13px',
            fontWeight: '600',
            color: colors.text,
            display: 'block',
            textAlign: 'center'
          }}>
            {localMissionCompleted 
              ? (mainMissionData ? `${mainMissionData.title} انجام شد` : 'ماموریت امروز انجام شد') 
              : (mainMissionData ? mainMissionData.title : 'ماموریت امروز رو کامل کن')}
          </span>
        </button>
      </div>
    </div>
  );
};

export default DayCard;