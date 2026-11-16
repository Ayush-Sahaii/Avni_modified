import { NavLink, Route, Routes } from "react-router-dom";
import { useMemo, useState } from "react";
import { POSTERS } from "../posters";
import { Hockey } from "./games/Hockey";
import { LudoBoard } from "./games/LudoBoard";
import { CarromTable } from "./games/CarromTable";
import { ChessBoard } from "./games/ChessBoard";
import { UnoTable } from "./games/UnoTable";
import { ScramblePlay } from "./games/ScramblePlay";
import { ScrabbleBoard } from "./games/ScrabbleBoard";
import { GroupDashboard } from "./GroupDashboard";

function Home() {
  return (
    <div>
      <h1 style={{ letterSpacing: "-0.03em" }}>Good evening</h1>
      <p style={{ color: "var(--muted)" }}>Continue a match or open a group.</p>
      <div className="row">
        <NavLink className="btn btn-primary" to="/app/games">Play</NavLink>
        <NavLink className="btn btn-ghost" to="/app/groups">Manage groups</NavLink>
      </div>
    </div>
  );
}

function Games() {
  return (
    <div>
      <h1>Games</h1>
      <div className="grid">
        {POSTERS.map((g) => (
          <NavLink key={g.id} to={`/app/play/${g.id}`} className="poster">
            <img src={g.src} alt={g.title} />
          </NavLink>
        ))}
      </div>
    </div>
  );
}

function Ttt() {
  const [board, setBoard] = useState<(0 | 1 | 2)[]>(Array(9).fill(0));
  const [turn, setTurn] = useState<1 | 2>(1);
  const winner = useMemo(() => {
    const L = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    for (const [a,b,c] of L) if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
    if (board.every(Boolean)) return 3;
    return 0;
  }, [board]);
  return (
    <div>
      <h1>Tic-Tac-Toe</h1>
      <p>{winner ? (winner === 3 ? "Draw" : `Seat ${winner} wins`) : `Seat ${turn}`}</p>
      <div className="board">
        {board.map((v, i) => (
          <button
            className="cell"
            key={i}
            aria-label={`cell ${i}`}
            onClick={() => {
              if (winner || v) return;
              const next = board.slice() as (0 | 1 | 2)[];
              next[i] = turn;
              setBoard(next);
              setTurn(turn === 1 ? 2 : 1);
            }}
          >
            {v === 1 ? "X" : v === 2 ? "O" : ""}
          </button>
        ))}
      </div>
    </div>
  );
}

function Groups() {
  return <GroupDashboard />;
  );
}

function Profile() {
  return (
    <div>
      <h1>Profile</h1>
      <article className="glass card"><h3>Level 1</h3><p>0 coins · status alive</p></article>
    </div>
  );
}

function More() {
  return (
    <div>
      <h1>More</h1>
      <p>Theme, sound, reduced effects, about.</p>
    </div>
  );
}

export function MiniApp() {
  return (
    <div className="app">
      <main>
        <Routes>
          <Route index element={<Home />} />
          <Route path="games" element={<Games />} />
          <Route path="ttt" element={<Ttt />} />
          <Route path="play/tictactoe" element={<Ttt />} />
          <Route path="play/icehockey" element={<Hockey />} />
          <Route path="play/ludo" element={<LudoBoard />} />
          <Route path="play/carrom" element={<CarromTable />} />
          <Route path="play/chess" element={<ChessBoard />} />
          <Route path="play/uno" element={<UnoTable />} />
          <Route path="play/scramble" element={<ScramblePlay />} />
          <Route path="play/scrabble" element={<ScrabbleBoard />} />
          <Route path="groups" element={<Groups />} />
          <Route path="profile" element={<Profile />} />
          <Route path="more" element={<More />} />
        </Routes>
      </main>
      <nav className="bottom">
        <NavLink to="/app" end className={({ isActive }) => (isActive ? "active" : "")}>Home</NavLink>
        <NavLink to="/app/games" className={({ isActive }) => (isActive ? "active" : "")}>Games</NavLink>
        <NavLink to="/app/groups" className={({ isActive }) => (isActive ? "active" : "")}>Groups</NavLink>
        <NavLink to="/app/profile" className={({ isActive }) => (isActive ? "active" : "")}>Profile</NavLink>
        <NavLink to="/app/more" className={({ isActive }) => (isActive ? "active" : "")}>More</NavLink>
      </nav>
    </div>
  );
}
