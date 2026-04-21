import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TickerOptions, TickerDirection } from '../src/core/types';
import { 
  validateDuration, 
  validateDirection, 
  validatePauseOnHover,
  createEmptyTickerState 
} from '../src/core/state';

describe('ticker core', () => {
  describe('validateDuration', () => {
    it('returns default for invalid input', () => {
      expect(validateDuration(undefined)).toBe(20);
      expect(validateDuration(null)).toBe(20);
      expect(validateDuration('invalid')).toBe(20);
      expect(validateDuration(0)).toBe(20);
      expect(validateDuration(-5)).toBe(20);
    });

    it('returns valid duration', () => {
      expect(validateDuration(10)).toBe(10);
      expect(validateDuration(30.5)).toBe(30.5);
      expect(validateDuration('15')).toBe(15);
    });
  });

  describe('validateDirection', () => {
    it('returns left for invalid input', () => {
      expect(validateDirection(undefined)).toBe('left');
      expect(validateDirection('up')).toBe('left');
    });

    it('returns right for right direction', () => {
      expect(validateDirection('right')).toBe('right');
    });

    it('returns left for left direction', () => {
      expect(validateDirection('left')).toBe('left');
    });
  });

  describe('validatePauseOnHover', () => {
    it('returns false for invalid input', () => {
      expect(validatePauseOnHover(undefined)).toBe(false);
      expect(validatePauseOnHover(null)).toBe(false);
      expect(validatePauseOnHover(false)).toBe(false);
      expect(validatePauseOnHover('false')).toBe(false);
    });

    it('returns true for true', () => {
      expect(validatePauseOnHover(true)).toBe(true);
    });
  });

  describe('createEmptyTickerState', () => {
    it('creates empty state', () => {
      const state = createEmptyTickerState();
      expect(state.clones).toEqual([]);
      expect(state.frameId).toBe(0);
      expect(state.resizeTimeout).toBeNull();
      expect(state.resizeObserver).toBeNull();
      expect(state.intersectionObserver).toBeNull();
    });
  });
});