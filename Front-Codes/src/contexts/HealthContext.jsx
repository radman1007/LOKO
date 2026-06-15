import React, { useState, createContext, useContext, useEffect } from 'react';

const HealthContext = createContext();

export const useHealth = () => {
  const context = useContext(HealthContext);
  if (!context) {
    throw new Error('useHealth must be used within HealthProvider');
  }
  return context;
};

export const HealthProvider = ({ children }) => {
  // بارگذاری اولیه از localStorage
  const loadInitialData = () => {
    const saved = localStorage.getItem('locoHealthData');
    if (saved && saved !== 'undefined') {
      try {
        return JSON.parse(saved);
      } catch(e) {
        console.error('Error parsing health data:', e);
      }
    }
    return {
      lastMoodCheck: null,
      lastMoodTime: null,
      lastModalShownTime: null,
      lastModalDismissTime: null,
      dailyStats: {},
      moodHistory: [],
      breathingHistory: []
    };
  };

  const [healthData, setHealthData] = useState(loadInitialData);
  const [showMoodReminder, setShowMoodReminder] = useState(false);
  const [reminderDismissed, setReminderDismissed] = useState(false);
  const [showSuggestion, setShowSuggestion] = useState(false);

  // ذخیره در localStorage هر بار که healthData تغییر کند
  useEffect(() => {
    if (healthData && Object.keys(healthData).length > 0) {
      localStorage.setItem('locoHealthData', JSON.stringify(healthData));
      console.log('Saved to localStorage:', healthData);
    }
  }, [healthData]);

  // بارگذاری وضعیت ریمایندر
  useEffect(() => {
    const savedReminder = localStorage.getItem('locoReminderStatus');
    if (savedReminder && savedReminder !== 'undefined') {
      try {
        const parsed = JSON.parse(savedReminder);
        setReminderDismissed(parsed.dismissed || false);
      } catch(e) { console.error(e); }
    }
  }, []);

  // ذخیره وضعیت ریمایندر
  useEffect(() => {
    localStorage.setItem('locoReminderStatus', JSON.stringify({ dismissed: reminderDismissed }));
  }, [reminderDismissed]);

  // بررسی نمایش مودال
  useEffect(() => {
    const now = Date.now();
    const today = new Date().toDateString();
    const fourHours = 4 * 60 * 60 * 1000;
    
    const lastModalShown = healthData?.lastModalShownTime || 0;
    const lastModalDismiss = healthData?.lastModalDismissTime || 0;
    const lastMoodDate = healthData?.lastMoodCheck ? new Date(healthData.lastMoodCheck).toDateString() : null;
    
    const timeSinceLastShown = now - lastModalShown;
    const timeSinceLastDismiss = now - lastModalDismiss;
    
    const shouldShow = (timeSinceLastShown >= fourHours || 
                        timeSinceLastDismiss >= fourHours || 
                        lastMoodDate !== today);
    
    setShowMoodReminder(shouldShow);
    
    // پیشنهاد تنفس
    const todayStats = healthData?.dailyStats?.[today] || {};
    if (!todayStats.breathingSessions?.length && reminderDismissed && lastMoodDate === today && !showSuggestion) {
      setShowSuggestion(true);
    }
  }, [healthData, reminderDismissed]);

  const recordMood = (mood) => {
    const now = Date.now();
    const nowDate = new Date();
    const today = nowDate.toDateString();
    
    const newMoodEntry = {
      date: nowDate.toISOString(),
      mood: mood,
      timestamp: now
    };
    
    setHealthData(prev => {
      const currentDailyStats = prev?.dailyStats || {};
      const newData = {
        ...prev,
        lastMoodCheck: nowDate.toISOString(),
        lastMoodTime: now,
        lastModalShownTime: now,
        moodHistory: [...(prev?.moodHistory || []), newMoodEntry],
        dailyStats: {
          ...currentDailyStats,
          [today]: {
            ...(currentDailyStats[today] || {}),
            moods: [...(currentDailyStats[today]?.moods || []), mood],
            lastMood: mood,
            lastMoodTime: now
          }
        }
      };
      return newData;
    });
    
    setShowMoodReminder(false);
    setReminderDismissed(false);
    setShowSuggestion(false);
  };

  const recordBreathing = (duration, count) => {
    const nowDate = new Date();
    const today = nowDate.toDateString();
    const now = Date.now();
    
    const newBreathingEntry = {
      date: nowDate.toISOString(),
      duration: duration,
      count: count,
      timestamp: now
    };
    
    setHealthData(prev => {
      const currentDailyStats = prev?.dailyStats || {};
      const currentTodayStats = currentDailyStats[today] || {};
      
      const newData = {
        ...prev,
        lastBreathingSession: nowDate.toISOString(),
        breathingHistory: [...(prev?.breathingHistory || []), newBreathingEntry],
        dailyStats: {
          ...currentDailyStats,
          [today]: {
            ...currentTodayStats,
            breathingSessions: [...(currentTodayStats.breathingSessions || []), { duration, count }],
            totalBreathingTime: (currentTodayStats.totalBreathingTime || 0) + duration,
            totalBreaths: (currentTodayStats.totalBreaths || 0) + count
          }
        }
      };
      return newData;
    });
    
    setShowSuggestion(false);
  };

  const getTodayStats = () => {
    const today = new Date().toDateString();
    const stats = healthData?.dailyStats?.[today] || {
      moods: [],
      breathingSessions: [],
      totalBreathingTime: 0,
      totalBreaths: 0,
      lastMood: null
    };
    
    let focusScore = 0;
    if (stats.totalBreathingTime > 0) {
      focusScore = Math.min(Math.floor((stats.totalBreathingTime / 60) * 20 + (stats.totalBreaths / 5)), 100);
    } else if (stats.moods && stats.moods.length > 0) {
      const moodValue = stats.lastMood === 'good' ? 60 : (stats.lastMood === 'normal' ? 40 : 20);
      focusScore = moodValue;
    }
    
    return {
      ...stats,
      focusScore,
      hasMoodToday: stats.moods && stats.moods.length > 0,
      lastMood: stats.lastMood
    };
  };

  const getWeeklyStats = () => {
    const weeklyStats = [];
    const days = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStr = date.toDateString();
      const stats = healthData?.dailyStats?.[dayStr] || {};
      
      let focusScore = 0;
      if (stats.totalBreathingTime > 0) {
        focusScore = Math.min(Math.floor((stats.totalBreathingTime / 60) * 20 + (stats.totalBreaths / 5)), 100);
      } else if (stats.moods && stats.moods.length > 0) {
        const moodValue = stats.lastMood === 'good' ? 60 : (stats.lastMood === 'normal' ? 40 : 20);
        focusScore = moodValue;
      }
      
      weeklyStats.push({
        day: days[date.getDay()],
        date: dayStr,
        hasMood: stats.moods && stats.moods.length > 0,
        focusScore: focusScore,
        totalBreathingTime: stats.totalBreathingTime || 0,
        totalBreaths: stats.totalBreaths || 0,
        lastMood: stats.lastMood
      });
    }
    
    return weeklyStats;
  };

  const getProgressPercentage = () => {
    const weeklyStats = getWeeklyStats();
    const currentWeekAvg = weeklyStats.slice(0, 7).reduce((sum, day) => sum + day.focusScore, 0) / 7;
    return Math.round(Math.min(currentWeekAvg, 100));
  };

  const dismissReminder = () => {
    const now = Date.now();
    
    setShowMoodReminder(false);
    setReminderDismissed(true);
    
    setHealthData(prev => ({
      ...prev,
      lastModalDismissTime: now
    }));
    
    const todayStats = getTodayStats();
    if (!todayStats.breathingSessions?.length && !showSuggestion) {
      setShowSuggestion(true);
    }
  };

  const dismissSuggestion = () => {
    setShowSuggestion(false);
  };

  return (
    <HealthContext.Provider value={{
      healthData,
      showMoodReminder,
      showSuggestion,
      recordMood,
      recordBreathing,
      getTodayStats,
      getWeeklyStats,
      getProgressPercentage,
      dismissReminder,
      dismissSuggestion
    }}>
      {children}
    </HealthContext.Provider>
  );
};