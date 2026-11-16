import {
  tttCreate,
  tttMove,
  unoCreate,
  playCard,
  publicUnoView,
  hockeyInit,
  hockeyStep,
  clampStriker,
  type HockeySnap,
  scrabbleCreate,
  placeWord,
  publicScrabble,
  simulate,
} from "@avni/shared";
import { randomBytes } from "node:crypto";

export interface Client {
  send: (data: string) => void;
}

interface Room {
  id: string;
  game: string;
  version: number;
  seq: number;
  state: unknown;
  seats: Array<{ userId: number | null; bot: boolean }>;
  clients: Set<Client>;
  lastInput: Array<{ x: number; y: number; seq: number }>;
  lastActive: number;
}

export class RoomHub {
  rooms = new Map<string, Room>();
  byClient = new Map<Client, string>();

  create(game: string): Room {
    const id = randomBytes(8).toString("hex");
    let state: unknown = tttCreate();
    if (game === "uno") state = unoCreate(2);
    if (game === "hockey") state = hockeyInit();
    if (game === "carrom") state = { bodies: [], turn: 0 };
    if (game === "scrabble") state = scrabbleCreate(2);
    const room: Room = {
      id,
      game,
      version: 0,
      seq: 0,
      state,
      seats: [
        { userId: null, bot: false },
        { userId: null, bot: false },
      ],
      clients: new Set(),
      lastInput: [
        { x: 0.5, y: 1.2, seq: 0 },
        { x: 0.5, y: 0.3, seq: 0 },
      ],
      lastActive: Date.now(),
    };
    this.rooms.set(id, room);
    if (game === "hockey") this.loopHockey(room);
    return room;
  }

  attach(client: Client, roomId: string, userId: number) {
    const room = this.rooms.get(roomId);
    if (!room) throw new Error("no_room");
    let seat = room.seats.findIndex((s) => s.userId === userId);
    if (seat < 0) seat = room.seats.findIndex((s) => s.userId === null && !s.bot);
    if (seat < 0) throw new Error("full");
    room.seats[seat] = { userId, bot: false };
    room.clients.add(client);
    this.byClient.set(client, roomId);
    this.broadcast(room, { type: "joined", roomId, seat, seq: room.seq, version: ++room.version });
    return seat;
  }

  drop(client: Client) {
    const id = this.byClient.get(client);
    if (!id) return;
    const room = this.rooms.get(id);
    room?.clients.delete(client);
    this.byClient.delete(client);
  }

  sweep(now = Date.now(), idleMs = 24 * 3600 * 1000) {
    for (const [id, room] of this.rooms) {
      if (now - room.lastActive > idleMs) this.rooms.delete(id);
    }
  }

  handle(msg: Record<string, unknown>, client?: Client) {
    if (msg.type === "create") {
      const room = this.create(String(msg.game ?? "tictactoe"));
      return { type: "created", roomId: room.id, seq: 0, version: 0, game: room.game };
    }
    const room = this.rooms.get(String(msg.roomId ?? ""));
    if (!room) return { error: "no_room" };
    if (msg.type === "join") {
      const payload = msg.payload as { userId?: number } | undefined;
      const seat = this.attach(client ?? { send: () => {} }, room.id, Number(msg.userId ?? payload?.userId ?? 0));
      return { type: "joined", roomId: room.id, seat, seq: room.seq };
    }
    room.lastActive = Date.now();
    if (msg.type === "input" && room.game === "hockey") {
      const seat = Number(msg.seat ?? 0);
      if (seat !== 0 && seat !== 1) return { error: "bad_seat" };
      const x = Number(msg.x);
      const y = Number(msg.y);
      if (!Number.isFinite(x) || !Number.isFinite(y)) return { error: "bad_input" };
      room.lastInput[seat] = { x, y, seq: Number(msg.seq ?? 0) };
      const snap = room.state as HockeySnap;
      snap.strikers[seat] = clampStriker(seat, x, y);
      return { type: "ack", seq: room.lastInput[seat]!.seq };
    }
    if (msg.type === "move" && room.game === "tictactoe") {
      room.state = tttMove(room.state as never, (Number(msg.seat) || 1) as 1 | 2, Number((msg.payload as { cell?: number })?.cell));
      room.seq += 1;
      this.broadcast(room, { type: "state", seq: room.seq, state: room.state });
      return { type: "state", seq: room.seq, state: room.state };
    }
    if (msg.type === "uno_play") {
      playCard(room.state as never, Number(msg.seat ?? 0), String((msg.payload as { cardId?: string })?.cardId), (msg.payload as { color?: "red" })?.color);
      room.seq += 1;
      const view = publicUnoView(room.state as never, Number(msg.seat ?? 0));
      this.broadcast(room, { type: "uno", seq: room.seq, counts: view.counts, top: view.top });
      return { type: "state", view, seq: room.seq };
    }
    if (msg.type === "scrabble_place") {
      room.state = placeWord(room.state as never, (msg.tiles as never) ?? []);
      room.seq += 1;
      return { type: "state", view: publicScrabble(room.state as never, Number(msg.seat ?? 0)), seq: room.seq };
    }
    if (msg.type === "carrom_shot") {
      const bodies = (msg.bodies as never) ?? [];
      const next = simulate(bodies, 120, 1 / 60, 0.5, { w: 1, h: 1 });
      room.state = { bodies: next };
      room.seq += 1;
      this.broadcast(room, { type: "carrom", seq: room.seq, bodies: next });
      return { type: "carrom", seq: room.seq, bodies: next };
    }
    return { error: "unknown" };
  }

  private broadcast(room: Room, payload: unknown) {
    const data = JSON.stringify(payload);
    for (const c of room.clients) {
      try {
        c.send(data);
      } catch (err) {
        console.error("ws send", err);
      }
    }
  }

  private loopHockey(room: Room) {
    const tick = () => {
      if (!this.rooms.has(room.id)) return;
      let snap = room.state as HockeySnap;
      snap.strikers[0] = clampStriker(0, room.lastInput[0]!.x, room.lastInput[0]!.y);
      snap.strikers[1] = clampStriker(1, room.lastInput[1]!.x, room.lastInput[1]!.y);
      snap = hockeyStep(snap, 1 / 60);
      room.state = snap;
      if (snap.seq % 2 === 0) {
        this.broadcast(room, { type: "hockey", snap });
      }
      setTimeout(tick, 16);
    };
    setTimeout(tick, 16);
  }
}
