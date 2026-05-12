// Configuration
export const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const START_HOUR = 7; // 7 AM
export const TOTAL_HOURS = 24; // 24 hours (7 AM -> 6 AM next day)
export const HOUR_HEIGHT = 120;

// Generate 24h labels starting from START_HOUR
export const HOURS = Array.from({ length: TOTAL_HOURS }, (_, i) => {
    const hour = (START_HOUR + i) % 24;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour} ${ampm}`;
});

