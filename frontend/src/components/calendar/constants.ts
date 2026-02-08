import { CalendarEvent } from './types';
import { addDays, startOfWeek, setHours, setMinutes } from 'date-fns';

// Configuration
export const START_HOUR = 7; // 7 AM
export const TOTAL_HOURS = 24; // 24 hours (7 AM -> 6 AM next day)
export const HOUR_HEIGHT = 80;

// Generate 24h labels starting from START_HOUR
export const HOURS = Array.from({ length: TOTAL_HOURS }, (_, i) => {
    const hour = (START_HOUR + i) % 24;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour} ${ampm}`;
});

// Helper to create date relative to the start of the CURRENT week
const getWeeklyDate = (dayOffset: number, hour: number, minute: number = 0) => {
    const today = new Date();
    const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 }); // Monday

    let date = addDays(startOfCurrentWeek, dayOffset);
    date = setHours(date, hour);
    date = setMinutes(date, minute);

    // If hour < START_HOUR, it belongs to the next calendar day logically (early morning)
    // But physically in Date object it is correct.
    // Our View logic handles position.

    return date;
};

export const MOCK_EVENTS: CalendarEvent[] = [
    {
        id: '1',
        title: 'Deep Tissue Massage',
        start: getWeeklyDate(0, 10, 0), // Mon 10:00
        end: getWeeklyDate(0, 11, 30), // Mon 11:30
        type: 'appointment',
        color: '#dbeafe', // blue-100
        client: 'John Doe',
        clientInitials: 'JD',
        isVip: false,
    },
    {
        id: '2',
        title: 'Consultation',
        start: getWeeklyDate(1, 9, 30), // Tue 09:30
        end: getWeeklyDate(1, 10, 30), // Tue 10:30
        type: 'appointment',
        color: '#dcfce7', // green-100
        icon: 'clock',
    },
    {
        id: '3',
        title: 'Facial Treatment',
        start: getWeeklyDate(1, 12, 30), // Tue 12:30
        end: getWeeklyDate(1, 13, 30), // Tue 13:30
        type: 'appointment',
        color: '#f3e8ff', // purple-100
    },
    {
        id: '4',
        title: 'Staff Meeting',
        start: getWeeklyDate(1, 12, 45), // Tue 12:45
        end: getWeeklyDate(1, 13, 45), // Tue 13:45
        type: 'blocking',
        color: '#fee2e2', // red-100
        icon: 'alert-triangle',
    },
    {
        id: '5',
        title: 'Hair Styling',
        start: getWeeklyDate(2, 14, 0), // Wed 14:00
        end: getWeeklyDate(2, 15, 15), // Wed 15:15
        type: 'appointment',
        color: '#ffedd5', // orange-100
        icon: 'star',
    },
    {
        id: '6',
        title: 'Maintenance Day',
        start: getWeeklyDate(3, 8, 0), // Thu 08:00
        end: getWeeklyDate(3, 18, 0), // Thu 18:00
        type: 'maintenance',
        color: '#f3f4f6', // gray-100
    },
    {
        id: '7',
        title: 'Full Body Spa',
        start: getWeeklyDate(4, 9, 30), // Fri 09:30
        end: getWeeklyDate(4, 11, 30), // Fri 11:30
        type: 'appointment',
        color: '#dbeafe', // blue-100
        isVip: true,
        badges: ['VIP'],
    },
    {
        id: '8',
        title: 'Manicure',
        start: getWeeklyDate(4, 15, 0), // Fri 15:00
        end: getWeeklyDate(4, 16, 0), // Fri 16:00
        type: 'appointment',
        color: '#ccfbf1', // teal-100
    },
    {
        id: '9',
        title: 'Bridal Trial',
        start: getWeeklyDate(5, 11, 30), // Sat 11:30
        end: getWeeklyDate(5, 13, 0), // Sat 13:00
        type: 'appointment',
        color: '#f3e8ff', // violet-100
    },
];

