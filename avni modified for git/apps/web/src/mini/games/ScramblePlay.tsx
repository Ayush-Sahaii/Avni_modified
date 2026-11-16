import { useMemo, useState } from "react";
import { pickWord, scrambleWord, checkGuess } from "@avni/shared";

export function ScramblePlay() {
  const secret = useMemo(() => pickWord(), []);
  const shown = useMemo(() => scrambleWord(secret), [secret]);
  const [guess, setGuess] = useState("");
  const [ok, setOk] = useState<boolean | null>(null);
  return (
    <div>
      <h1>Scramble</h1>
      <p style={{ fontSize: 28, letterSpacing: "0.2em" }}>{shown.toUpperCase()}</p>
      <input value={guess} onChange={(e) => setGuess(e.target.value)} placeholder="Your guess" />
      <button
        className="btn btn-primary"
        type="button"
        style={{ marginTop: 12 }}
        onClick={() => setOk(checkGuess(secret, guess))}
      >
        Check
      </button>
      {ok !== null && <p>{ok ? "Correct" : "Try again"}</p>}
    </div>
  );
}
