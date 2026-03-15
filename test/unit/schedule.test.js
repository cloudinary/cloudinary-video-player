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
        weekly: [{ day: 'monday', start: '09:00', end: '17:00' }]
      };
      expect(isWithinSchedule(schedule, monday9am)).toBe(true);
    });

    it('returns false when date is outside all slots', () => {
      const monday8am = new Date(2025, 2, 10, 8, 0);
      const schedule = {
        weekly: [{ day: 'monday', start: '09:00', end: '17:00' }]
      };
      expect(isWithinSchedule(schedule, monday8am)).toBe(false);
    });

    it('handles boundary times (start inclusive, end exclusive)', () => {
      const monday9am = new Date(2025, 2, 10, 9, 0);
      const monday5pm = new Date(2025, 2, 10, 17, 0);
      const schedule = {
        weekly: [{ day: 'monday', start: '09:00', end: '17:00' }]
      };
      expect(isWithinSchedule(schedule, monday9am)).toBe(true);
      expect(isWithinSchedule(schedule, monday5pm)).toBe(false);
    });

    it('checks multiple slots', () => {
      const wednesday2pm = new Date(2025, 2, 12, 14, 0);
      const schedule = {
        weekly: [
          { day: 'monday', start: '09:00', end: '17:00' },
          { day: 'wednesday', start: '12:00', end: '18:00' }
        ]
      };
      expect(isWithinSchedule(schedule, wednesday2pm)).toBe(true);
    });
  });
});
