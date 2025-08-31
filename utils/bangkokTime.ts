/**
 * Bangkok Timezone Utility Functions
 * สำหรับการจัดการเวลาและวันที่ในเขตเวลาไทย (UTC+7)
 */

/**
 * Get current Bangkok time
 */
export const getBangkokTime = (): Date => {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  return new Date(utc + (7 * 3600000)); // UTC+7 for Bangkok
};

/**
 * Get Bangkok date for specific day
 */
export const getBangkokDateForDay = (day: number): string => {
  const bangkokTime = getBangkokTime();
  const targetDate = new Date(bangkokTime.getFullYear(), bangkokTime.getMonth(), day);
  const year = targetDate.getFullYear();
  const month = String(targetDate.getMonth() + 1).padStart(2, '0');
  const dayStr = String(targetDate.getDate()).padStart(2, '0');
  
  const isoDate = `${year}-${month}-${dayStr}`;
  
  return isoDate;
};

/**
 * Get current day in Bangkok timezone
 */
export const getCurrentBangkokDay = (): number => {
  return getBangkokTime().getDate();
};

/**
 * Format Bangkok time to Thai locale
 */
export const formatBangkokTime = (date?: Date): string => {
  const bangkokTime = date || getBangkokTime();
  return bangkokTime.toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

/**
 * Get Bangkok date in YYYY-MM-DD format for today
 */
export const getTodayBangkokDate = (): string => {
  const bangkokTime = getBangkokTime();
  // Format using local components to avoid UTC shift from toISOString
  const y = bangkokTime.getFullYear();
  const m = String(bangkokTime.getMonth() + 1).padStart(2, '0');
  const d = String(bangkokTime.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};
