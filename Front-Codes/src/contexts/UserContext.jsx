// src/contexts/UserContext.jsx
import React, { useState, createContext, useContext, useEffect } from 'react';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
};

// کاربران نمونه
const SAMPLE_USERS = [
  { username: 'abolfazlmodir', password: '1234', role: 'admin', name: 'مدیر تیم', school: null, class: null, isProfileComplete: true },
  { username: 'schoolmanager', password: '1234', role: 'school_manager', name: 'مدیر مدرسه الف', school: 'مدرسه الف', schoolId: 1, isProfileComplete: true },
  { username: 'teacher1', password: '1234', role: 'teacher', name: 'خانم معلمی', school: 'مدرسه الف', schoolId: 1, class: 'پایه چهارم', classId: 101, isProfileComplete: true },
  { username: 'student1', password: '1234', role: 'student', name: 'علی حسینی', school: 'مدرسه الف', schoolId: 1, class: 'پایه چهارم', classId: 101, grade: 'چهارم', xp: 10, isProfileComplete: false }, // false برای رفتن به صفحه انتخاب پروفایل
  { username: 'parent1', password: '1234', role: 'parent', name: 'والد علی', school: 'مدرسه الف', child: 'علی حسینی', isProfileComplete: true }
];

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userXP, setUserXP] = useState(10);
  const [missionCompleted, setMissionCompleted] = useState(false);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [purchasedItems, setPurchasedItems] = useState([]);
  const [dailyStreak, setDailyStreak] = useState(1);
  const [lastVisit, setLastVisit] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('locoUser');
    if (savedUser && savedUser !== 'undefined') {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing user:', error);
        localStorage.removeItem('locoUser');
      }
    }
    
    const savedXP = localStorage.getItem('lukoClubXP');
    if (savedXP) {
      setUserXP(parseInt(savedXP));
    } else {
      setUserXP(10);
    }
    
    const savedMission = localStorage.getItem('missionCompleted');
    if (savedMission) setMissionCompleted(savedMission === 'true');
    
    const savedTasks = localStorage.getItem('lukoClubTasks');
    if (savedTasks) setCompletedTasks(JSON.parse(savedTasks));
    
    const savedPurchased = localStorage.getItem('lukoClubPurchased');
    if (savedPurchased) setPurchasedItems(JSON.parse(savedPurchased));
    
    const savedStreak = localStorage.getItem('lukoClubStreak');
    if (savedStreak) {
      setDailyStreak(parseInt(savedStreak));
    } else {
      setDailyStreak(1);
    }
    
    const savedLastVisit = localStorage.getItem('lukoClubLastVisit');
    if (savedLastVisit) setLastVisit(savedLastVisit);
    
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem('lukoClubXP', userXP);
      localStorage.setItem('missionCompleted', missionCompleted);
      localStorage.setItem('lukoClubTasks', JSON.stringify(completedTasks));
      localStorage.setItem('lukoClubPurchased', JSON.stringify(purchasedItems));
      localStorage.setItem('lukoClubStreak', dailyStreak);
      localStorage.setItem('lukoClubLastVisit', lastVisit || new Date().toDateString());
    }
  }, [userXP, missionCompleted, completedTasks, purchasedItems, dailyStreak, lastVisit, loading]);

  useEffect(() => {
    if (!loading && user) {
      const today = new Date().toDateString();
      if (lastVisit !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (lastVisit === yesterday.toDateString()) {
          setDailyStreak(prev => prev + 1);
        } else {
          setDailyStreak(1);
        }
        setLastVisit(today);
        setUserXP(prev => prev + 5);
      }
    }
  }, [loading, user, lastVisit]);

  const login = (username, password) => {
    const foundUser = SAMPLE_USERS.find(u => u.username === username && u.password === password);
    
    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('locoUser', JSON.stringify(userWithoutPassword));
      return { success: true, user: userWithoutPassword };
    }
    
    return { success: false, error: 'نام کاربری یا رمز عبور اشتباه است' };
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('locoUser', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('locoUser');
  };

  const addXP = (amount) => {
    setUserXP(prev => prev + amount);
  };

  const completeMission = () => {
    if (!missionCompleted) {
      setUserXP(prev => prev + 25);
      setMissionCompleted(true);
      return true;
    }
    return false;
  };

  const completeTask = (taskId, xpAmount) => {
    if (!completedTasks.includes(taskId)) {
      setCompletedTasks(prev => [...prev, taskId]);
      setUserXP(prev => prev + xpAmount);
      return true;
    }
    return false;
  };

  const purchaseItem = (itemId, price) => {
    if (!purchasedItems.includes(itemId) && userXP >= price) {
      setPurchasedItems(prev => [...prev, itemId]);
      setUserXP(prev => prev - price);
      return true;
    }
    return false;
  };

  const resetDailyTasks = () => {
    setCompletedTasks([]);
  };

  return (
    <UserContext.Provider value={{
      user,
      loading,
      userXP,
      missionCompleted,
      completedTasks,
      purchasedItems,
      dailyStreak,
      login,
      logout,
      updateUser,
      addXP,
      completeMission,
      completeTask,
      purchaseItem,
      resetDailyTasks,
      setUserXP
    }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;