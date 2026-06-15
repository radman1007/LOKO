// src/components/luko-club/WeekStreak.jsx
import React from 'react';
import { HiOutlineFire } from 'react-icons/hi';

const WeekStreak = ({ weekDays, colors, isMobile }) => {
  // حداکثر 7 روز هفته
  const persianDays = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'];
  
  // محاسبه روز جاری (امروز پنجشنبه = 5)
  const today = new Date();
  const jsDay = today.getDay(); // 0=یکشنبه, 1=دوشنبه, ..., 4=پنجشنبه, 5=جمعه, 6=شنبه
  
  let currentDayIndex;
  if (jsDay === 6) currentDayIndex = 0;      // شنبه
  else if (jsDay === 0) currentDayIndex = 1; // یکشنبه
  else if (jsDay === 1) currentDayIndex = 2; // دوشنبه
  else if (jsDay === 2) currentDayIndex = 3; // سه‌شنبه
  else if (jsDay === 3) currentDayIndex = 4; // چهارشنبه
  else if (jsDay === 4) currentDayIndex = 5; // پنجشنبه
  else currentDayIndex = 6;                  // جمعه

  // ساخت روزهای هفته با وضعیت‌های مختلف
  const days = persianDays.map((name, index) => {
    let status = 'future';
    if (index === currentDayIndex) {
      status = 'today';        // امروز - سفید
    } else if (index < currentDayIndex) {
      status = 'passed';       // گذشته - آتش (نارنجی)
    }
    return { id: index + 1, name, status };
  });

  return (
    <div style={{ marginTop: '32px' }}>
      <h3 style={{ fontSize: '18px', fontWeight: '700', color: colors.text, marginBottom: '16px' }}>
        رکورد حضور روزانه
      </h3>
      
      <div style={{
        backgroundColor: colors.streakBg,
        borderRadius: '20px',
        padding: '20px 16px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.04)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          {days.map((day) => {
            let dayBgColor = colors.streakOtherBg;
            let textColor = colors.textSecondary;
            let borderColor = colors.streakBorder;
            let showFireIcon = false;
            let showDot = false;
            
            if (day.status === 'today') {
              dayBgColor = colors.streakTodayBg;  // سفید
              textColor = colors.text;
              borderColor = colors.primary;
            } else if (day.status === 'passed') {
              dayBgColor = colors.streakPassed;   // نارنجی آتش
              textColor = 'white';
              borderColor = colors.streakPassed;
              showFireIcon = true;
            }
            
            return (
              <div key={day.id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', minWidth: isMobile ? '40px' : '55px' }}>
                <div style={{
                  width: isMobile ? '48px' : '60px',
                  height: isMobile ? '48px' : '60px',
                  borderRadius: '50%',
                  backgroundColor: dayBgColor,
                  border: `2px solid ${borderColor}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: day.status === 'today' ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.2s ease'
                }}>
                  {showFireIcon ? (
                    <HiOutlineFire size={isMobile ? 24 : 30} color="white" />
                  ) : day.status === 'today' ? (
                    <span style={{ fontSize: isMobile ? '16px' : '20px', fontWeight: '700', color: textColor }}>
                      {day.name.charAt(0)}
                    </span>
                  ) : (
                    <span style={{ fontSize: isMobile ? '14px' : '16px', fontWeight: '500', color: textColor }}>
                      {day.name.charAt(0)}
                    </span>
                  )}
                </div>
                <span style={{
                  fontSize: isMobile ? '10px' : '12px',
                  fontWeight: day.status === 'today' ? '700' : '400',
                  color: day.status === 'passed' ? colors.streakPassed : (day.status === 'today' ? colors.text : colors.textSecondary),
                  whiteSpace: 'nowrap'
                }}>
                  {day.name}
                </span>
              </div>
            );
          })}
        </div>
        
        <div style={{ textAlign: 'center', marginTop: '20px', paddingTop: '16px, borderTop: `1px solid ${colors.streakBorder}30`' }}>
          <p style={{ fontSize: '13px', color: colors.textSecondary }}>رکورد حضور متوالی</p>
          <p style={{ fontSize: '28px', fontWeight: '700', color: colors.primaryDark }}>
            {days.filter(d => d.status === 'passed').length + 1} روز
          </p>
        </div>
      </div>
    </div>
  );
};

export default WeekStreak;