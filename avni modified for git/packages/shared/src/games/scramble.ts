export const WORD_LIST = [
  "planet", "garden", "bridge", "castle", "forest", "river", "mountain", "orange",
  "silver", "purple", "window", "button", "circle", "square", "travel", "market",
  "school", "friend", "family", "music", "guitar", "piano", "camera", "pencil",
  "paper", "bottle", "coffee", "cookie", "banana", "tomato", "pepper", "onion",
  "bread", "cheese", "butter", "honey", "sugar", "water", "cloud", "storm",
  "thunder", "rainbow", "summer", "winter", "spring", "autumn", "night", "morning",
  "shadow", "light", "candle", "lantern", "compass", "anchor", "sailor", "island",
  "desert", "canyon", "valley", "meadow", "flower", "petal", "leaf", "branch",
  "eagle", "tiger", "lion", "panda", "whale", "dolphin", "otter", "rabbit",
  "kitten", "puppy", "horse", "zebra", "camel", "llama", "goose", "swan",
  "apple", "grape", "melon", "berry", "peach", "mango", "lemon", "cherry",
  "table", "chair", "sofa", "lamp", "clock", "watch", "phone", "laptop",
  "server", "client", "packet", "socket", "thread", "memory", "binary", "logic",
  "puzzle", "riddle", "secret", "letter", "number", "digit", "count", "score",
  "winner", "player", "team", "match", "round", "turn", "move", "draw",
];

export function scrambleWord(word: string, rng = Math.random): string {
  const chars = word.split("");
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [chars[i], chars[j]] = [chars[j]!, chars[i]!];
  }
  const out = chars.join("");
  if (out === word) return scrambleWord(word, rng);
  return out;
}

export function pickWord(rng = Math.random): string {
  return WORD_LIST[Math.floor(rng() * WORD_LIST.length)]!;
}

export function checkGuess(secret: string, guess: string): boolean {
  return secret.toLowerCase().trim() === guess.toLowerCase().trim();
}
