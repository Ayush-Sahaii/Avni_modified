import { unoCreate, playCard, drawOne, publicUnoView, type UnoState } from "@avni/shared";

const games = new Map<number, UnoState>();

export function startUno(chatId: number) {
  const st = unoCreate(2);
  games.set(chatId, st);
  return publicUnoView(st, 0);
}

export function unoCallback(chatId: number, data: string) {
  const st = games.get(chatId);
  if (!st) return { text: "No UNO game in this chat." };
  if (data === "draw") {
    drawOne(st, st.current);
  } else if (data.startsWith("play:")) {
    try {
      playCard(st, st.current, data.slice(5), "red");
    } catch (e) {
      return { text: "That card cannot be played now." };
    }
  }
  const v = publicUnoView(st, 0);
  return {
    text: `UNO · colour ${v.currentColor} · top ${v.top.value} · cards ${v.counts.join("/")}`,
    cards: v.hand,
  };
}
