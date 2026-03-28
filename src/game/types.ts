/** The four arithmetic operators available in Summle. */
export type Operator = '+' | '-' | '×' | '÷';

/**
 * A completed equation in the game: two operands and an operator, producing a result.
 * Once completed, the result becomes a "subtotal" tile available for use in future steps.
 */
export interface Equation {
  operand1: number;
  operator: Operator;
  operand2: number;
  result: number;
}

/**
 * A candidate move: a valid arithmetic equation that could be played next,
 * given the current game state.
 */
export type Move = Equation;

/**
 * The full state of a Summle game at any point in time.
 *
 * - `target`: the number the player is trying to reach.
 * - `availableNumbers`: the pool of numbers currently available to use as
 *   operands. This starts as the six original tile values and is updated after
 *   each step – used tiles are removed and the step's subtotal is added.
 * - `completedEquations`: the sequence of equations played so far (max 5).
 * - `maxSteps`: the maximum number of equations allowed (default 5).
 */
export interface GameState {
  target: number;
  availableNumbers: number[];
  completedEquations: Equation[];
  maxSteps: number;
}
