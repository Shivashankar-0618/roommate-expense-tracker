import { describe, it, expect } from 'vitest';
import {
  addMonths, currentMonthKey, firstDayOfMonth, formatDate, formatMonth, formatMonthShort,
  lastDayOfMonth, monthKeyOf, monthRange, todayISO,
} from './dates';

describe('dates', () => {
  it('identifies the month from a date, across month/year transitions', () => {
    expect(currentMonthKey(new Date(2026, 10, 30, 23, 59))).toBe('2026-11');
    expect(currentMonthKey(new Date(2026, 11, 1, 0, 0))).toBe('2026-12');
    expect(currentMonthKey(new Date(2027, 0, 1, 0, 0))).toBe('2027-01');
    expect(todayISO(new Date(2026, 0, 5))).toBe('2026-01-05');
  });
  it('addMonths crosses year boundaries', () => {
    expect(addMonths('2026-01', -1)).toBe('2025-12');
    expect(addMonths('2026-12', 1)).toBe('2027-01');
    expect(addMonths('2026-11', -23)).toBe('2024-12');
    expect(addMonths('2026-11', 0)).toBe('2026-11');
  });
  it('labels', () => {
    expect(formatMonth('2026-11')).toBe('November 2026');
    expect(formatMonthShort('2026-02')).toBe('Feb 26');
    expect(formatDate('2026-11-06')).toBe('06 Nov 2026');
  });
  it('month bounds', () => {
    expect(firstDayOfMonth('2026-12')).toBe('2026-12-01');
    expect(lastDayOfMonth('2026-11')).toBe('2026-11-30');
    expect(lastDayOfMonth('2026-02')).toBe('2026-02-28');
    expect(lastDayOfMonth('2028-02')).toBe('2028-02-29');
    expect(monthKeyOf('2026-11-30')).toBe('2026-11');
    expect(monthKeyOf('2026-12-01')).toBe('2026-12');
  });
  it('monthRange is inclusive and ascending', () => {
    expect(monthRange('2026-02', '2026-04')).toEqual(['2026-02', '2026-03', '2026-04']);
  });
});
