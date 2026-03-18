import { parseDay, isWithinSchedule } from '../../src/utils/schedule';

describe('schedule utils', () => {
  describe('parseDay', () => {
    it('parses full day names (case-insensitive)', () => {
      expect(parseDay('sunday')).toBe(0);
      expect(parseDay('monday')).toBe(1);
      expect(parseDay('tuesday')).toBe(2);
      expect(parseDay('wednesday')).toBe(3);
      expect(parseDay('thursday')).toBe(4);
      expect(parseDay('friday')).toBe(5);
      expect(parseDay('saturday')).toBe(6);
      expect(parseDay('SUNDAY')).toBe(0);
      expect(parseDay('Monday')).toBe(1);
    });

    it('parses abbreviated day names', () => {
      expect(parseDay('sun')).toBe(0);
      expect(parseDay('mon')).toBe(1);
      expect(parseDay('tue')).toBe(2);
      expect(parseDay('wed')).toBe(3);
      expect(parseDay('thu')).toBe(4);
      expect(parseDay('fri')).toBe(5);
      expect(parseDay('sat')).toBe(6);
    });

    it('returns null for invalid input', () => {
      expect(parseDay('invalid')).toBeNull();
      expect(parseDay('')).toBeNull();
      expect(parseDay(null)).toBeNull();
      expect(parseDay(123)).toBeNull();
    });

    it('trims whitespace', () => {
      expect(parseDay('  monday  ')).toBe(1);
    });
  });

  describe('isWithinSchedule', () => {
    it('returns true when weekly is empty or missing', () => {
      expect(isWithinSchedule({}, new Date())).toBe(true);
      expect(isWithinSchedule({ weekly: [] }, new Date())).toBe(true);
      expect(isWithinSchedule({ weekly: null }, new Date())).toBe(true);
    });

    it('returns true when date falls within a slot', () => {
      const monday9am = new Date(2025, 2, 10, 9, 30);
      const schedule = {
        weekly: [{ day: 'monday', start: '09:00', duration: 8 }]
      };
      expect(isWithinSchedule(schedule, monday9am)).toBe(true);
    });

    it('returns false when date is outside all slots', () => {
      const monday8am = new Date(2025, 2, 10, 8, 0);
      const schedule = {
        weekly: [{ day: 'monday', start: '09:00', duration: 8 }]
      };
      expect(isWithinSchedule(schedule, monday8am)).toBe(false);
    });

    it('handles boundary times (start inclusive, end exclusive)', () => {
      const monday9am = new Date(2025, 2, 10, 9, 0);
      const monday5pm = new Date(2025, 2, 10, 17, 0);
      const schedule = {
        weekly: [{ day: 'monday', start: '09:00', duration: 8 }]
      };
      expect(isWithinSchedule(schedule, monday9am)).toBe(true);
      expect(isWithinSchedule(schedule, monday5pm)).toBe(false);
    });

    it('checks multiple slots', () => {
      const wednesday2pm = new Date(2025, 2, 12, 14, 0);
      const schedule = {
        weekly: [
          { day: 'monday', start: '09:00', duration: 8 },
          { day: 'wednesday', start: '12:00', duration: 6 }
        ]
      };
      expect(isWithinSchedule(schedule, wednesday2pm)).toBe(true);
    });

    it('handles slot that crosses midnight into the next day', () => {
      const schedule = {
        weekly: [{ day: 'monday', start: '22:00', duration: 8 }]
      };
      // Monday 23:00 - within slot on start day
      const monday11pm = new Date(2025, 2, 10, 23, 0);
      expect(isWithinSchedule(schedule, monday11pm)).toBe(true);

      // Tuesday 03:00 - within slot on next day
      const tuesday3am = new Date(2025, 2, 11, 3, 0);
      expect(isWithinSchedule(schedule, tuesday3am)).toBe(true);

      // Tuesday 07:00 - outside slot (ends at 06:00)
      const tuesday7am = new Date(2025, 2, 11, 7, 0);
      expect(isWithinSchedule(schedule, tuesday7am)).toBe(false);
    });

    it('handles cross-midnight slot wrapping Saturday to Sunday', () => {
      const schedule = {
        weekly: [{ day: 'saturday', start: '23:00', duration: 4 }]
      };
      // Sunday 02:00 - within slot
      const sunday2am = new Date(2025, 2, 9, 2, 0);
      expect(isWithinSchedule(schedule, sunday2am)).toBe(true);
    });
  });
});
