// src/data/dailyMissionsData.js

export const WEEKLY_MISSIONS = {
  0: {
    missions: [
      { id: 1, title: 'ویدیو آموزشی ببین', xp: 20, icon: 'Icon12', link: '/entertainment', type: 'video', videoTitle: 'کاپیتان' },
      { id: 2, title: 'پادکست گوش بده', xp: 20, icon: 'Icon13', link: '/podcast', type: 'audio' },
      { id: 3, title: 'درس بخون', xp: 20, icon: 'Icon14', link: '/books', type: 'study' },
      { id: 4, title: 'تمرین ریاضی', xp: 25, icon: 'Icon15', link: '/math', type: 'quiz' }
    ],
    mainMission: { title: 'تماشای ۲ ویدیو', xp: 50 }
  },
  1: {
    missions: [
      { id: 1, title: 'فیلم علمی ببین', xp: 25, icon: 'Icon11', link: '/entertainment', type: 'video', videoTitle: 'شبیه ساز' },
      { id: 2, title: 'مطالعه کتاب', xp: 20, icon: 'Icon20', link: '/books', type: 'study' },
      { id: 3, title: 'بازی آموزشی', xp: 15, icon: 'Icon19', link: '/games', type: 'game' },
      { id: 4, title: 'نوشتن خلاق', xp: 20, icon: 'Icon16', link: '/writing', type: 'creative' }
    ],
    mainMission: { title: 'تماشای فیلم علمی', xp: 50 }
  },
  2: {
    missions: [
      { id: 1, title: 'ویدیو هنری ببین', xp: 20, icon: 'Icon17', link: '/entertainment', type: 'video', videoTitle: 'واده آخر' },
      { id: 2, title: 'تمرین زبان', xp: 25, icon: 'Icon18', link: '/language', type: 'study' },
      { id: 3, title: 'پادکست انگیزشی', xp: 15, icon: 'Icon13', link: '/podcast', type: 'audio' },
      { id: 4, title: 'حل مسئله', xp: 20, icon: 'Icon14', link: '/puzzle', type: 'quiz' }
    ],
    mainMission: { title: 'انجام ۳ ماموریت', xp: 60 }
  },
  3: {
    missions: [
      { id: 1, title: 'مستند طبیعت ببین', xp: 25, icon: 'Icon11', link: '/entertainment', type: 'video', videoTitle: 'کاپیتان' },
      { id: 2, title: 'خواندن داستان', xp: 20, icon: 'Icon20', link: '/books', type: 'study' },
      { id: 3, title: 'بازی فکری', xp: 20, icon: 'Icon19', link: '/games', type: 'game' },
      { id: 4, title: 'نقاشی کشیدن', xp: 15, icon: 'Icon17', link: '/art', type: 'creative' }
    ],
    mainMission: { title: 'تماشای مستند', xp: 50 }
  },
  4: {
    missions: [
      { id: 1, title: 'ویدیو برنامه‌نویسی ببین', xp: 30, icon: 'Icon12', link: '/entertainment', type: 'video', videoTitle: 'شبیه ساز' },
      { id: 2, title: 'تمرین علوم', xp: 25, icon: 'Icon16', link: '/science', type: 'study' },
      { id: 3, title: 'پادکست علمی', xp: 20, icon: 'Icon13', link: '/podcast', type: 'audio' },
      { id: 4, title: 'پروژه کوچک', xp: 30, icon: 'Icon15', link: '/project', type: 'creative' }
    ],
    mainMission: { title: 'تماشای ویدیو برنامه‌نویسی', xp: 70 }
  },
  5: {
    missions: [
      { id: 1, title: 'فیلم آموزشی ببین', xp: 20, icon: 'Icon11', link: '/entertainment', type: 'video', videoTitle: 'واده آخر' },
      { id: 2, title: 'مرور دروس', xp: 25, icon: 'Icon14', link: '/review', type: 'study' },
      { id: 3, title: 'پادکست گوش بده', xp: 15, icon: 'Icon13', link: '/podcast', type: 'audio' },
      { id: 4, title: 'بازی گروهی', xp: 20, icon: 'Icon19', link: '/multiplayer', type: 'game' }
    ],
    mainMission: { title: 'مرور هفتگی', xp: 60 }
  },
  6: {
    missions: [
      { id: 1, title: 'فیلم بلند ببین', xp: 35, icon: 'Icon11', link: '/entertainment', type: 'video', videoTitle: 'کاپیتان' },
      { id: 2, title: 'کتابخوانی', xp: 25, icon: 'Icon20', link: '/books', type: 'study' },
      { id: 3, title: 'بازی ویژه', xp: 25, icon: 'Icon19', link: '/games', type: 'game' },
      { id: 4, title: 'خلاقیت آزاد', xp: 20, icon: 'Icon17', link: '/creative', type: 'creative' }
    ],
    mainMission: { title: 'تماشای فیلم بلند', xp: 80 }
  }
};

export const getTodayMissions = () => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const persianDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  return WEEKLY_MISSIONS[persianDay] || WEEKLY_MISSIONS[0];
};

export const shouldResetMissions = () => {
  const lastReset = localStorage.getItem('luko_last_mission_reset');
  const today = new Date().toDateString();
  
  if (lastReset !== today) {
    localStorage.setItem('luko_last_mission_reset', today);
    return true;
  }
  return false;
};

export const saveCompletedMissions = (completedIds) => {
  const today = new Date().toDateString();
  localStorage.setItem(`luko_missions_${today}`, JSON.stringify(completedIds));
};

export const getCompletedMissions = () => {
  const today = new Date().toDateString();
  const saved = localStorage.getItem(`luko_missions_${today}`);
  return saved ? JSON.parse(saved) : [];
};

export const registerVideoWatch = (videoTitle, xpAmount) => {
  const today = new Date().toDateString();
  const watchedVideos = JSON.parse(localStorage.getItem(`luko_watched_videos_${today}`) || '[]');
  
  if (watchedVideos.some(v => v.title === videoTitle)) {
    return false;
  }
  
  watchedVideos.push({ title: videoTitle, xp: xpAmount, time: new Date().toISOString() });
  localStorage.setItem(`luko_watched_videos_${today}`, JSON.stringify(watchedVideos));
  return true;
};

export const hasWatchedVideoToday = (videoTitle) => {
  const today = new Date().toDateString();
  const watchedVideos = JSON.parse(localStorage.getItem(`luko_watched_videos_${today}`) || '[]');
  return watchedVideos.some(v => v.title === videoTitle);
};

export const getTodayVideoMission = () => {
  const todayMissions = getTodayMissions();
  const videoMission = todayMissions.missions.find(m => m.type === 'video');
  return videoMission || null;
};