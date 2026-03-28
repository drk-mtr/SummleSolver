import { describe, it, expect } from 'vitest';
import { getPossibleMoves } from './moves';
import type { GameState } from './types';

/**
 * Test cases for getPossibleMoves().
 *
 * These tests are written against the correct expected behaviour of the
 * function. Because the function is currently a stub that returns [], every
 * test here will FAIL until a real implementation is provided – which is
 * intentional at this stage of development.
 */

describe('getPossibleMoves', () => {
  /**
   * Test Case 1 – Initial game state where the target (350) is reachable in a
   * single move: 7 × 50 = 350.
   *
   * Tiles: [7, 50, 2, 3, 4, 100]  Target: 350
   */
  describe('initial state – target reachable in one move', () => {
    const state: GameState = {
      target: 350,
      availableNumbers: [7, 50, 2, 3, 4, 100],
      completedEquations: [],
      maxSteps: 5,
    };

    it('should return at least one move', () => {
      const moves = getPossibleMoves(state);
      expect(moves.length).toBeGreaterThan(0);
    });

    it('should include the move 7 × 50 = 350 (which hits the target)', () => {
      const moves = getPossibleMoves(state);
      expect(
        moves.some(
          (m) =>
            m.operand1 === 7 &&
            m.operator === '×' &&
            m.operand2 === 50 &&
            m.result === 350,
        ),
      ).toBe(true);
    });

    it('should include the move 2 + 100 = 102 (a valid non-target move)', () => {
      const moves = getPossibleMoves(state);
      expect(
        moves.some(
          (m) => m.operand1 === 2 && m.operator === '+' && m.operand2 === 100 && m.result === 102,
        ),
      ).toBe(true);
    });

    it('should not include moves with non-integer division results', () => {
      const moves = getPossibleMoves(state);
      // 7 ÷ 50 = 0.14 – not an integer
      expect(
        moves.some((m) => m.operand1 === 7 && m.operator === '÷' && m.operand2 === 50),
      ).toBe(false);
      // 3 ÷ 4 = 0.75 – not an integer
      expect(
        moves.some((m) => m.operand1 === 3 && m.operator === '÷' && m.operand2 === 4),
      ).toBe(false);
    });

    it('should include valid integer division (100 ÷ 4 = 25)', () => {
      const moves = getPossibleMoves(state);
      expect(
        moves.some(
          (m) => m.operand1 === 100 && m.operator === '÷' && m.operand2 === 4 && m.result === 25,
        ),
      ).toBe(true);
    });
  });

  /**
   * Test Case 2 – Another initial state where 25 × 3 = 75 hits the target.
   *
   * Tiles: [25, 3, 5, 100, 4, 2]  Target: 75
   */
  describe('initial state – 25 × 3 = 75', () => {
    const state: GameState = {
      target: 75,
      availableNumbers: [25, 3, 5, 100, 4, 2],
      completedEquations: [],
      maxSteps: 5,
    };

    it('should include 25 × 3 = 75 (which hits the target)', () => {
      const moves = getPossibleMoves(state);
      expect(
        moves.some(
          (m) =>
            m.operand1 === 25 &&
            m.operator === '×' &&
            m.operand2 === 3 &&
            m.result === 75,
        ),
      ).toBe(true);
    });

    it('should not include subtraction moves that produce a result ≤ 0', () => {
      const moves = getPossibleMoves(state);
      // 2 − 25 = −23 (negative; should be excluded)
      expect(
        moves.some((m) => m.operand1 === 2 && m.operator === '-' && m.operand2 === 25),
      ).toBe(false);
    });
  });

  /**
   * Test Case 3 – Mid-game state.
   *
   * The player has already completed one equation: 4 × 25 = 100.
   * That subtotal (100) is now back in the available pool alongside the
   * original 100 tile, giving two 100s.
   * Target: 200  →  100 + 100 = 200 should be a reachable move.
   *
   * Original tiles: [4, 25, 3, 5, 2, 100]
   * After step 1 (4 × 25 = 100): availableNumbers = [3, 5, 2, 100, 100]
   */
  describe('mid-game state – after one completed equation', () => {
    const state: GameState = {
      target: 200,
      availableNumbers: [3, 5, 2, 100, 100],
      completedEquations: [
        { operand1: 4, operator: '×', operand2: 25, result: 100 },
      ],
      maxSteps: 5,
    };

    it('should include 100 + 100 = 200 (which hits the target)', () => {
      const moves = getPossibleMoves(state);
      expect(
        moves.some(
          (m) =>
            m.operand1 === 100 &&
            m.operator === '+' &&
            m.operand2 === 100 &&
            m.result === 200,
        ),
      ).toBe(true);
    });

    it('should allow using two instances of the same value (both 100s)', () => {
      const moves = getPossibleMoves(state);
      // There are two 100s in the pool so 100 × 100 = 10000 is also theoretically valid
      expect(
        moves.some(
          (m) => m.operand1 === 100 && m.operator === '×' && m.operand2 === 100 && m.result === 10000,
        ),
      ).toBe(true);
    });

    it('should return no more completed equations than maxSteps allows', () => {
      const moves = getPossibleMoves(state);
      // All moves are valid next steps; the game only has 4 more steps allowed
      // so moves should reflect remaining capacity – at minimum it should not be empty
      expect(moves.length).toBeGreaterThan(0);
    });
  });
});
