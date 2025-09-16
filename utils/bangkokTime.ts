
export const getBangkokTime = (): Date => {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  return new Date(utc + (7 * 3600000)); // UTC+7 for Bangkok
};

export const getBangkokDateForDay = (day: number): string => {
  const bangkokTime = getBangkokTime();
  const targetDate = new Date(bangkokTime.getFullYear(), bangkokTime.getMonth(), day);
  const year = targetDate.getFullYear();
  const month = String(targetDate.getMonth() + 1).padStart(2, '0');
  const dayStr = String(targetDate.getDate()).padStart(2, '0');
  
  const isoDate = `${year}-${month}-${dayStr}`;
  
  return isoDate;
};

export const getCurrentBangkokDay = (): number => {
  return getBangkokTime().getDate();
};

export const formatBangkokTime = (date?: Date): string => {
  const bangkokTime = date || getBangkokTime();
  return bangkokTime.toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

export const getTodayBangkokDate = (): string => {
  const bangkokTime = getBangkokTime();
  const y = bangkokTime.getFullYear();
  const m = String(bangkokTime.getMonth() + 1).padStart(2, '0');
  const d = String(bangkokTime.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};
