// src/contexts/HealthContext.jsx
import React, { useState, createContext, useContext, useEffect } from 'react';
import { moodService, breathingService } from '../services/mood.service';
import { useUser } from './UserContext';

const HealthContext = createContext();

export const useHealth = () => {
  const context = useContext(HealthContext);
  if (!context) {
    throw new Error('useHealth must be used within HealthProvider');
  }
  return context;
};

export const HealthProvider = ({ children }) => {
  const { updateUser, user } = useUser(); // دریافت تابع updateUser
  const guest = !!user?.isGuest;
  const [healthData, setHealthData] = useState({
    lastMoodCheck: null,
    lastMoodTime: null,
    lastModalShownTime: null,
    lastModalDismissTime: null,
    dailyStats: {},
    moodHistory: [],
    breathingHistory: []
  });
  
  const [showMoodReminder, setShowMoodReminder] = useState(false);
  const [reminderDismissed, setReminderDismissed] = useState(false);
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [loading, setLoading] = useState(true);

  // ========== بارگذاری داده‌ها از سرور ==========
  useEffect(() => {
    const loadHealthData = async () => {
      // حالت مهمان: فقط از localStorage استفاده کن، درخواست سرور نزن
      if (guest) {
        const saved = localStorage.getItem('locoHealthData');
        if (saved && saved !== 'undefined') {
          try { setHealthData(JSON.parse(saved)); } catch (e) {}
        }
        setLoading(false);
        return;
      }
      try {
        // دریافت تاریخچه مود از سرور
        const moodHistory = await moodService.getHistory();
        // دریافت تاریخچه تنفس از سرور
        const breathingHistory = await breathingService.getSessions();
        
        setHealthData(prev => ({
          ...prev,
          moodHistory: moodHistory || [],
          breathingHistory: breathingHistory || [],
        }));
        
        // بررسی نیاز به نمایش مودال
        await checkMoodPrompt();
        
      } catch (error) {
        console.error('Error loading health data:', error);
        // اگر خطا خورد، از localStorage استفاده کن
        const saved = localStorage.getItem('locoHealthData');
        if (saved && saved !== 'undefined') {
          try {
            const parsed = JSON.parse(saved);
            setHealthData(parsed);
          } catch(e) {
            console.error('Error parsing health data:', e);
          }
        }
      }
      setLoading(false);
    };

    loadHealthData();
  }, [guest]);

  // ========== ذخیره در localStorage (به عنوان کش) ==========
  useEffect(() => {
    if (!loading && healthData && Object.keys(healthData).length > 0) {
      localStorage.setItem('locoHealthData', JSON.stringify(healthData));
    }
  }, [healthData, loading]);

  // ========== بررسی نیاز به نمایش مودال ==========
  const checkMoodPrompt = async () => {
    if (guest) {
      // حالت مهمان: بررسی محلی بدون سرور
      const now = Date.now();
      const today = new Date().toDateString();
      const fourHours = 4 * 60 * 60 * 1000;
      const lastModalShown = healthData?.lastModalShownTime || 0;
      const lastMoodDate = healthData?.lastMoodCheck ? new Date(healthData.lastMoodCheck).toDateString() : null;
      setShowMoodReminder(now - lastModalShown >= fourHours || lastMoodDate !== today);
      return;
    }
    try {
      const response = await moodService.checkPrompt();
      setShowMoodReminder(response.shouldShow || false);
    } catch (error) {
      console.error('Error checking mood prompt:', error);
      // fallback: بررسی محلی
      const now = Date.now();
      const today = new Date().toDateString();
      const fourHours = 4 * 60 * 60 * 1000;
      
      const lastModalShown = healthData?.lastModalShownTime || 0;
      const lastModalDismiss = healthData?.lastModalDismissTime || 0;
      const lastMoodDate = healthData?.lastMoodCheck ? new Date(healthData.lastMoodCheck).toDateString() : null;
      
      const shouldShow = (now - lastModalShown >= fourHours || 
                          now - lastModalDismiss >= fourHours || 
                          lastMoodDate !== today);
      
      setShowMoodReminder(shouldShow);
    }
  };

  // ========== ثبت وضعیت روحی ==========
  const recordMood = async (mood) => {
    try {
      // در حالت مهمان فقط محلی ذخیره می‌شود
      if (!guest) {
        await moodService.checkin({ mood });
        if (updateUser) {
          await updateUser();
        }
      }

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
      
    } catch (error) {
      console.error('Error recording mood:', error);
    }
  };

  // ========== ثبت جلسه تنفس ==========
  const recordBreathing = async (duration, count) => {
    try {
      // در حالت مهمان فقط محلی ذخیره می‌شود
      if (!guest) {
        await breathingService.createSession({ duration, count });
        if (updateUser) {
          await updateUser();
        }
      }

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
      
    } catch (error) {
      console.error('Error recording breathing:', error);
    }
  };

  // ========== دریافت آمار امروز ==========
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

  // ========== دریافت آمار هفتگی ==========
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

  // ========== درصد پیشرفت ==========
  const getProgressPercentage = () => {
    const weeklyStats = getWeeklyStats();
    const currentWeekAvg = weeklyStats.slice(0, 7).reduce((sum, day) => sum + day.focusScore, 0) / 7;
    return Math.round(Math.min(currentWeekAvg, 100));
  };

  // ========== رد کردن یادآوری ==========
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

  // ========== رد کردن پیشنهاد تنفس ==========
  const dismissSuggestion = () => {
    setShowSuggestion(false);
  };

  return (
    <HealthContext.Provider
      value={{
        healthData,
        showMoodReminder,
        showSuggestion,
        loading,
        recordMood,
        recordBreathing,
        getTodayStats,
        getWeeklyStats,
        getProgressPercentage,
        dismissReminder,
        dismissSuggestion,
        checkMoodPrompt,
      }}
    >
      {children}
    </HealthContext.Provider>
  );
};

export default HealthContext;