// src/components/luko-club/WeekStreak.jsx
import React from 'react';
import { HiOutlineFire } from 'react-icons/hi';

/*
  رکورد حضور روزانه — فقط روزهایی که کاربر تسک‌هایش را انجام داده «آتش» می‌گیرند.
  prop weekDays: آرایه‌ای از { name, done, isToday } (داده‌ی واقعی)
  اگر داده‌ای نباشد (مهمان/کاربر جدید)، هیچ روزی آتش نمی‌گیرد.
*/
const DEFAULT_DAYS = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'];

const WeekStreak = ({ weekDays, colors, isMobile }) => {
  // نگاشت روز امروز فارسی
  const jsDay = new Date().getDay();
  const todayIndex = jsDay === 6 ? 0 : jsDay + 1; // شنبه=0 ... جمعه=6

  // اگر داده‌ی واقعی نبود، هفته‌ی خالی (بدون آتش)
  const days = (Array.isArray(weekDays) && weekDays.length)
    ? weekDays.map((d, i) => ({
        name: d.name || DEFAULT_DAYS[i] || '',
        done: !!(d.done || d.isPassed || d.status === 'passed'),
        isToday: !!(d.isToday || d.status === 'today'),
      }))
    : DEFAULT_DAYS.map((name, i) => ({ name, done: false, isToday: i === todayIndex }));

  // شمارش رکورد متوالی از انتها (روزهای پیاپیِ انجام‌شده)
  let streakCount = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].done) streakCount++;
    else if (!days[i].isToday) break;
  }

  return (
    <div style={{ marginTop: '32px' }}>
      <h3 style={{ fontSize: '18px', fontWeight: '700', color: colors.text, marginBottom: '16px' }}>
        رکورد حضور روزانه
      </h3>

      <div style={{ backgroundColor: colors.streakBg, borderRadius: '20px', padding: '20px 16px', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          {days.map((day, idx) => {
            const done = day.done;
            const isToday = day.isToday;

            let dayBgColor = colors.streakOtherBg;
            let borderColor = `${colors.streakBorder}55`;
            let textColor = colors.textSecondary;

            if (done) {
              dayBgColor = colors.streakPassed;   // آتش‌گرفته
              borderColor = colors.streakPassed;
              textColor = 'white';
            } else if (isToday) {
              dayBgColor = colors.streakTodayBg;   // امروزِ انجام‌نشده
              borderColor = colors.primary;
              textColor = colors.text;
            }

            return (
              <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', minWidth: isMobile ? '40px' : '55px' }}>
                <div style={{
                  width: isMobile ? '48px' : '60px',
                  height: isMobile ? '48px' : '60px',
                  borderRadius: '50%',
                  backgroundColor: dayBgColor,
                  border: `2px solid ${borderColor}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: isToday && !done ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.2s ease',
                }}>
                  {done ? (
                    <HiOutlineFire size={isMobile ? 24 : 30} color="white" />
                  ) : (
                    <span style={{ fontSize: isMobile ? '15px' : '18px', fontWeight: isToday ? '700' : '500', color: textColor }}>
                      {day.name.charAt(0)}
                    </span>
                  )}
                </div>
                <span style={{
                  fontSize: isMobile ? '10px' : '12px',
                  fontWeight: isToday ? '700' : '400',
                  color: done ? colors.streakPassed : (isToday ? colors.text : colors.textSecondary),
                  whiteSpace: 'nowrap',
                }}>
                  {day.name}
                </span>
              </div>
            );
          })}
        </div>

        <div style={{ textAlign: 'center', marginTop: '20px', paddingTop: '16px', borderTop: `1px solid ${colors.streakBorder}30` }}>
          <p style={{ fontSize: '13px', color: colors.textSecondary }}>رکورد حضور متوالی</p>
          <p style={{ fontSize: '28px', fontWeight: '700', color: colors.primaryDark }}>
            {streakCount} روز
          </p>
        </div>
      </div>
    </div>
  );
};

export default WeekStreak;
