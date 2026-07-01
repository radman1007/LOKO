const { query } = require('../database/connection');
const gardenEngine = require('../engines/garden.engine');

const MOOD_SCORE = { good: 100, normal: 60, bad: 25 };
const PERSIAN_DAYS = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه'];
const PERSIAN_MONTHS = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];

const dateKey = (d) => d.toISOString().split('T')[0];

// امتیاز تمرکز یک روز بر اساس داده‌ی واقعی حال و تنفس آن روز
function focusScoreForDay(day) {
  if (day.breathingSeconds > 0) {
    return Math.min(100, Math.round((day.breathingSeconds / 60) * 20 + (day.breaths / 5)));
  }
  if (day.moodScore != null) {
    // نگاشت 25/60/100 به مقیاس امتیاز تمرکز
    if (day.moodScore >= 100) return 60;
    if (day.moodScore >= 60) return 40;
    return 20;
  }
  return 0;
}

/**
 * آمار کامل سلامت کاربر بر اساس داده‌ی واقعی:
 * today / weekly(7) / monthly(30) / yearly(12) + شاخص سلامت روان
 */
async function getHealthStats(userId) {
  // حال ۱۲ ماه اخیر
  const moods = await query(
    `SELECT mc.checkin_date AS d, m.slug AS slug
     FROM mood_checkins mc JOIN moods m ON m.id = mc.mood_id
     WHERE mc.user_id = :userId AND mc.checkin_date >= DATE_SUB(CURDATE(), INTERVAL 365 DAY)`,
    { userId }
  );

  // جلسات تنفس ۱۲ ماه اخیر
  const breaths = await query(
    `SELECT DATE(started_at) AS d, duration_seconds AS dur, cycle_count AS cyc
     FROM breathing_sessions
     WHERE user_id = :userId AND started_at >= DATE_SUB(NOW(), INTERVAL 365 DAY)`,
    { userId }
  );

  // سطل‌بندی بر اساس روز
  const days = {}; // key -> { moodScore, moodCount, breathingSeconds, breaths }
  const ensure = (k) => (days[k] || (days[k] = { moodScore: null, moodSum: 0, moodCount: 0, breathingSeconds: 0, breaths: 0 }));

  for (const r of moods) {
    const k = dateKey(new Date(r.d));
    const b = ensure(k);
    const sc = MOOD_SCORE[r.slug] ?? 60;
    b.moodSum += sc;
    b.moodCount += 1;
    b.moodScore = b.moodSum / b.moodCount; // میانگین حال روز
  }
  for (const r of breaths) {
    const k = dateKey(new Date(r.d));
    const b = ensure(k);
    b.breathingSeconds += r.dur || 0;
    b.breaths += r.cyc || 0;
  }

  const dayData = (dateObj) => days[dateKey(dateObj)] || { moodScore: null, breathingSeconds: 0, breaths: 0 };

  // ─── امروز ───
  const todayObj = new Date();
  const td = dayData(todayObj);
  const today = {
    focusScore: focusScoreForDay(td),
    hasMood: td.moodScore != null,
    totalBreathingTime: td.breathingSeconds,
    totalBreaths: td.breaths,
  };

  // ─── هفتگی (۷ روز اخیر) ───
  const weekly = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dd = dayData(d);
    weekly.push({
      day: PERSIAN_DAYS[d.getDay()],
      date: dateKey(d),
      focusScore: focusScoreForDay(dd),
      hasMood: dd.moodScore != null,
    });
  }

  // ─── ماهانه (۳۰ روز اخیر) ───
  const monthly = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dd = dayData(d);
    monthly.push({
      day: String(30 - i),
      date: dateKey(d),
      focusScore: focusScoreForDay(dd),
      hasMood: dd.moodScore != null,
    });
  }

  // ─── سالانه (۱۲ ماه اخیر، میانگین امتیاز هر ماه) ───
  const monthBuckets = {}; // 'YYYY-M' -> { sum, count, hasMood }
  Object.keys(days).forEach((k) => {
    const d = new Date(k);
    const mk = `${d.getFullYear()}-${d.getMonth()}`;
    const fs = focusScoreForDay(days[k]);
    const mb = monthBuckets[mk] || (monthBuckets[mk] = { sum: 0, count: 0, hasMood: false });
    mb.sum += fs;
    mb.count += 1;
    if (days[k].moodScore != null) mb.hasMood = true;
  });
  const yearly = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const mk = `${d.getFullYear()}-${d.getMonth()}`;
    const mb = monthBuckets[mk];
    yearly.push({
      day: PERSIAN_MONTHS[d.getMonth()],
      focusScore: mb && mb.count ? Math.round(mb.sum / mb.count) : 0,
      hasMood: !!(mb && mb.hasMood),
    });
  }

  // ─── شاخص سلامت روان ───
  let wellbeing = null;
  try {
    wellbeing = await gardenEngine.getWellbeing(userId);
  } catch (e) { wellbeing = null; }

  return { today, weekly, monthly, yearly, wellbeing };
}

module.exports = { getHealthStats };
