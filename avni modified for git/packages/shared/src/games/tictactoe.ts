export type Cell = 0 | 1 | 2;
export interface TttState {
  board: Cell[];
  turn: 1 | 2;
  winner: 0 | 1 | 2 | 3;
}

export function tttCreate(): TttState {
  return { board: Array(9).fill(0) as Cell[], turn: 1, winner: 0 };
}

const LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

export function tttWinner(board: Cell[]): 0 | 1 | 2 | 3 {
  for (const [a, b, c] of LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a] as 1 | 2;
  }
  if (board.every((x) => x !== 0)) return 3;
  return 0;
}

export function tttMove(state: TttState, seat: 1 | 2, cell: number): TttState {
  if (state.winner) throw new Error("game over");
  if (seat !== state.turn) throw new Error("not your turn");
  if (cell < 0 || cell > 8 || state.board[cell] !== 0) throw new Error("illegal move");
  const board = state.board.slice() as Cell[];
  board[cell] = seat;
  const winner = tttWinner(board);
  return { board, turn: seat === 1 ? 2 : 1, winner };
}

export function tttBotMove(state: TttState, level: number): number {
  const empty = state.board.map((v, i) => (v === 0 ? i : -1)).filter((i) => i >= 0);
  if (!empty.length) throw new Error("no moves");
  if (level <= 1) return empty[Math.floor(Math.random() * empty.length)]!;
  const me = state.turn;
  const opp = me === 1 ? 2 : 1;
  for (const i of empty) {
    const b = state.board.slice() as Cell[];
    b[i] = me;
    if (tttWinner(b) === me) return i;
  }
  for (const i of empty) {
    const b = state.board.slice() as Cell[];
    b[i] = opp as Cell;
    if (tttWinner(b) === opp) return i;
  }
  if (empty.includes(4)) return 4;
  return empty[0]!;
}
