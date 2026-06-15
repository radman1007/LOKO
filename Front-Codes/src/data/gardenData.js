// src/data/gardenData.js

// انواع گلها
export const FLOWERS = {
  1: { id: 1, name: 'گل آفتابگردان', icon: '🌻', stages: ['🌱', '🌿', '🌻'], xpNeeded: 50 },
  2: { id: 2, name: 'گل لاله', icon: '🌷', stages: ['🌱', '🌿', '🌷'], xpNeeded: 100 },
  3: { id: 3, name: 'گل رز', icon: '🌹', stages: ['🌱', '🌿', '🌹'], xpNeeded: 150 },
  4: { id: 4, name: 'گل نیلوفر', icon: '🌸', stages: ['🌱', '🌿', '🌸'], xpNeeded: 200 },
  5: { id: 5, name: 'گل زنبق', icon: '💐', stages: ['🌱', '🌿', '💐'], xpNeeded: 300 }
};

// بارگذاری باغچه از localStorage
export const loadGarden = () => {
  const saved = localStorage.getItem('luko_garden');
  if (saved) {
    return JSON.parse(saved);
  }
  // باغچه پیش‌فرض با 3 جای خالی
  return {
    slots: [
      { id: 1, flowerId: null, stage: 0, plantedAt: null, xpEarned: 0 },
      { id: 2, flowerId: null, stage: 0, plantedAt: null, xpEarned: 0 },
      { id: 3, flowerId: null, stage: 0, plantedAt: null, xpEarned: 0 }
    ],
    totalFlowers: 0,
    lastWatered: null
  };
};

// ذخیره باغچه
export const saveGarden = (garden) => {
  localStorage.setItem('luko_garden', JSON.stringify(garden));
};

// کاشت گل جدید
export const plantFlower = (garden, slotId, flowerId, currentXP) => {
  const flower = FLOWERS[flowerId];
  if (!flower) return { success: false, error: 'گل وجود ندارد' };
  
  if (currentXP < flower.xpNeeded) {
    return { success: false, error: `برای کاشت ${flower.name} به ${flower.xpNeeded} XP نیاز دارید` };
  }
  
  const slot = garden.slots.find(s => s.id === slotId);
  if (!slot) return { success: false, error: 'جایگاه نامعتبر' };
  if (slot.flowerId !== null) return { success: false, error: 'این جایگاه قبلاً پر شده است' };
  
  slot.flowerId = flowerId;
  slot.stage = 0;
  slot.plantedAt = Date.now();
  slot.xpEarned = 0;
  
  garden.totalFlowers++;
  saveGarden(garden);
  
  return { success: true, garden, usedXP: flower.xpNeeded };
};

// آبیاری گل (پیشرفت در تسک‌ها)
export const waterFlower = (garden, slotId, xpGained) => {
  const slot = garden.slots.find(s => s.id === slotId);
  if (!slot || slot.flowerId === null) return { success: false, error: 'گلی در این جایگاه وجود ندارد' };
  
  const flower = FLOWERS[slot.flowerId];
  slot.xpEarned += xpGained;
  
  // محاسبه مرحله جدید
  const progressPerStage = flower.xpNeeded / 3;
  const newStage = Math.min(2, Math.floor(slot.xpEarned / progressPerStage));
  
  const stageChanged = newStage > slot.stage;
  slot.stage = newStage;
  
  saveGarden(garden);
  
  return { 
    success: true, 
    garden, 
    stageChanged, 
    isComplete: slot.stage === 2,
    flowerName: flower.name,
    stageIcon: flower.stages[slot.stage]
  };
};

// برداشت گل تکمیل شده
export const harvestFlower = (garden, slotId) => {
  const slot = garden.slots.find(s => s.id === slotId);
  if (!slot || slot.flowerId === null) return { success: false, error: 'گلی در این جایگاه وجود ندارد' };
  
  const flower = FLOWERS[slot.flowerId];
  if (slot.stage < 2) return { success: false, error: 'گل هنوز کامل نشده است' };
  
  const rewardXP = flower.xpNeeded;
  
  // پاک کردن جایگاه
  slot.flowerId = null;
  slot.stage = 0;
  slot.plantedAt = null;
  slot.xpEarned = 0;
  
  saveGarden(garden);
  
  return { success: true, garden, rewardXP, flowerName: flower.name };
};

// دریافت وضعیت باغچه برای نمایش
export const getGardenStatus = (garden, currentXP) => {
  return garden.slots.map(slot => {
    if (slot.flowerId === null) {
      return { isEmpty: true, flower: null, stage: -1, progress: 0 };
    }
    const flower = FLOWERS[slot.flowerId];
    const progressPercent = (slot.xpEarned / flower.xpNeeded) * 100;
    return {
      isEmpty: false,
      flower,
      stage: slot.stage,
      stageIcon: flower.stages[slot.stage],
      progress: progressPercent,
      isComplete: slot.stage === 2,
      xpEarned: slot.xpEarned,
      xpNeeded: flower.xpNeeded
    };
  });
};

// گزینه‌های قابل کاشت بر اساس XP کاربر
export const getAvailableFlowers = (currentXP) => {
  return Object.values(FLOWERS).filter(flower => currentXP >= flower.xpNeeded);
};