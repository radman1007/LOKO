// ذخیره‌سازی امن دیتاهای سلامت
export const saveHealthData = (data) => {
  try {
    localStorage.setItem('locoHealthData', JSON.stringify(data));
    console.log('Health data saved successfully');
    return true;
  } catch (e) {
    console.error('Save failed:', e);
    return false;
  }
};

export const loadHealthData = () => {
  try {
    const saved = localStorage.getItem('locoHealthData');
    if (saved) {
      const parsed = JSON.parse(saved);
      console.log('Health data loaded successfully');
      return parsed;
    }
  } catch (e) {
    console.error('Load failed:', e);
  }
  return null;
};