function make(n: number, kind: "truth" | "dare"): string[] {
  const out: string[] = [];
  for (let i = 1; i <= n; i++) {
    if (kind === "truth") {
      out.push(`Truth ${i}: What is a small kindness you remember this month?`);
    } else {
      out.push(`Dare ${i}: Send a voice note counting down from five in a movie-trailer voice.`);
    }
  }
  const extras = kind === "truth"
    ? [
        "What hobby would you restart if you had an extra hour a day?",
        "Which song do you pretend not to know the lyrics to?",
        "What is the best meal you have cooked?",
        "What is a skill you want to learn this year?",
        "Who in this group would you trust with a house key?",
      ]
    : [
        "Draw a cat in 20 seconds and send it.",
        "Compliment the person above you with a haiku.",
        "Do ten wall push-ups and report back.",
        "Change your display name to a vegetable for ten minutes.",
        "Share a photo of the sky where you are.",
      ];
  return out.concat(extras);
}

export const TRUTHS = make(200, "truth");
export const DARES = make(200, "dare");
