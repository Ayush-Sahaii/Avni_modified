export type CommandScope = "private" | "group" | "both";
export type Permission =
  | "everyone"
  | "group_admin"
  | "dev"
  | "group_admin_or_dev";

export interface CommandDef {
  name: string;
  aliases: string[];
  prefixes: Array<"/" | "!" | ".">;
  scope: CommandScope;
  permission: Permission;
  botRights: string[];
  usage: string;
  help: string;
  category: "basics" | "moderation" | "fun" | "family" | "games" | "custom" | "dev";
}

function c(
  name: string,
  rest: Partial<CommandDef> & Pick<CommandDef, "help" | "category">,
): CommandDef {
  return {
    name,
    aliases: rest.aliases ?? [],
    prefixes: rest.prefixes ?? ["/", "!"],
    scope: rest.scope ?? "both",
    permission: rest.permission ?? "everyone",
    botRights: rest.botRights ?? [],
    usage: rest.usage ?? `/${name}`,
    help: rest.help,
    category: rest.category,
  };
}

export const COMMANDS: CommandDef[] = [
  c("start", { help: "Start the bot and open the Mini App.", category: "basics", scope: "private" }),
  c("help", { aliases: [], prefixes: ["/", "!", "."], help: "Show commands.", category: "basics" }),
  c("id", { help: "Show your Telegram user ID and chat ID.", category: "basics" }),
  c("reset", { help: "Clear AI memory for this chat.", category: "basics" }),
  c("admin", { help: "List group administrators.", category: "basics", scope: "group" }),
  c("webapp", {
    aliases: ["miniapp", "dashboard", "panel", "manage"],
    help: "Open the Mini App.",
    category: "basics",
  }),
  c("kick", { help: "Remove a member.", category: "moderation", permission: "group_admin", scope: "group", botRights: ["can_restrict_members"], usage: "/kick <user>" }),
  c("ban", { help: "Ban a member.", category: "moderation", permission: "group_admin", scope: "group", botRights: ["can_restrict_members"], usage: "/ban <user> [reason]" }),
  c("unban", { help: "Unban a member.", category: "moderation", permission: "group_admin", scope: "group", botRights: ["can_restrict_members"] }),
  c("mute", { help: "Mute a member.", category: "moderation", permission: "group_admin", scope: "group", botRights: ["can_restrict_members"], usage: "/mute <user> [duration]" }),
  c("unmute", { help: "Unmute a member.", category: "moderation", permission: "group_admin", scope: "group", botRights: ["can_restrict_members"] }),
  c("warn", { help: "Warn a member.", category: "moderation", permission: "group_admin", scope: "group" }),
  c("warns", { help: "Show warnings.", category: "moderation", scope: "group" }),
  c("unwarn", { help: "Remove one warning.", category: "moderation", permission: "group_admin", scope: "group" }),
  c("clearwarns", { help: "Clear all warnings.", category: "moderation", permission: "group_admin", scope: "group" }),
  c("dmute", { help: "Delete the replied message and mute.", category: "moderation", permission: "group_admin", scope: "group", botRights: ["can_delete_messages", "can_restrict_members"] }),
  c("dban", { help: "Delete the replied message and ban.", category: "moderation", permission: "group_admin", scope: "group", botRights: ["can_delete_messages", "can_restrict_members"] }),
  c("dwarn", { help: "Delete the replied message and warn.", category: "moderation", permission: "group_admin", scope: "group", botRights: ["can_delete_messages"] }),
  c("del", { prefixes: ["/", "!", "."], help: "Delete a message.", category: "moderation", permission: "group_admin", scope: "group", botRights: ["can_delete_messages"] }),
  c("pin", { help: "Pin a message.", category: "moderation", permission: "group_admin", scope: "group", botRights: ["can_pin_messages"] }),
  c("promote", { help: "Promote with standard rights.", category: "moderation", permission: "group_admin", scope: "group", botRights: ["can_promote_members"] }),
  c("promote1", { help: "Promote with a limited rights set.", category: "moderation", permission: "group_admin", scope: "group", botRights: ["can_promote_members"] }),
  c("demote", { help: "Demote an admin this bot promoted.", category: "moderation", permission: "group_admin", scope: "group", botRights: ["can_promote_members"] }),
  c("lock", { help: "Enable a lock category.", category: "moderation", permission: "group_admin", scope: "group", usage: "/lock <category> [action]" }),
  c("unlock", { help: "Disable a lock category.", category: "moderation", permission: "group_admin", scope: "group" }),
  c("locks", { help: "List lock state.", category: "moderation", scope: "group" }),
  c("approve", { help: "Approve a member for a lock category.", category: "moderation", permission: "group_admin", scope: "group" }),
  c("unapprove", { help: "Remove an approval.", category: "moderation", permission: "group_admin", scope: "group" }),
  c("approved", { help: "List approvals.", category: "moderation", scope: "group" }),
  c("chatoff", { help: "Disable AI chat in this group.", category: "moderation", permission: "group_admin", scope: "group" }),
  c("chaton", { help: "Enable AI chat in this group.", category: "moderation", permission: "group_admin", scope: "group" }),
  c("chat", { help: "Set AI chat on or off.", category: "moderation", permission: "group_admin", scope: "group", usage: "/chat on|off" }),
  c("rules", { help: "Show group rules.", category: "moderation", scope: "group" }),
  c("setrules", { help: "Set group rules.", category: "moderation", permission: "group_admin", scope: "group" }),
  c("clearrules", { help: "Clear group rules.", category: "moderation", permission: "group_admin", scope: "group" }),
  c("filter", { help: "Add a keyword filter.", category: "moderation", permission: "group_admin", scope: "group" }),
  c("filters", { help: "List filters.", category: "moderation", scope: "group" }),
  c("stop", { help: "Remove a filter.", category: "moderation", permission: "group_admin", scope: "group" }),
  c("stopall", { help: "Remove all filters.", category: "moderation", permission: "group_admin", scope: "group" }),
  c("welcome", { help: "Show welcome message.", category: "moderation", scope: "group" }),
  c("setwelcome", { help: "Set welcome message.", category: "moderation", permission: "group_admin", scope: "group" }),
  c("resetwelcome", { help: "Reset welcome.", category: "moderation", permission: "group_admin", scope: "group" }),
  c("goodbye", { help: "Show goodbye message.", category: "moderation", scope: "group" }),
  c("setgoodbye", { help: "Set goodbye message.", category: "moderation", permission: "group_admin", scope: "group" }),
  c("resetgoodbye", { help: "Reset goodbye.", category: "moderation", permission: "group_admin", scope: "group" }),
  c("open", { help: "Open the group (unmute all).", category: "moderation", permission: "group_admin", scope: "group" }),
  c("close", { help: "Close the group (mute all members).", category: "moderation", permission: "group_admin", scope: "group" }),
  c("kiss", { help: "Send a kiss action.", category: "fun" }),
  c("hug", { help: "Send a hug action.", category: "fun" }),
  c("slap", { help: "Send a slap action.", category: "fun" }),
  c("punch", { help: "Send a punch action.", category: "fun" }),
  c("crush", { help: "Pick a random crush in the group.", category: "fun", scope: "group" }),
  c("couple", { help: "Pick a random couple.", category: "fun", scope: "group" }),
  c("truth", { help: "Get a truth question.", category: "fun" }),
  c("dare", { help: "Get a dare.", category: "fun" }),
  c("coins", { aliases: ["balance", "bal", "points"], help: "Show coin balance.", category: "fun" }),
  c("give", { help: "Give coins to a user.", category: "fun" }),
  c("level", { aliases: ["lvl", "rank", "xp"], help: "Show XP and level.", category: "fun" }),
  c("top", { aliases: ["richest", "leaderboard"], help: "Show leaderboards.", category: "fun" }),
  c("kill", { help: "Knock out a player in the kill game.", category: "fun" }),
  c("revive", { help: "Revive a player.", category: "fun" }),
  c("protect", { help: "Protect yourself from kill/rob.", category: "fun" }),
  c("rob", { help: "Attempt to rob coins.", category: "fun" }),
  c("family", { help: "Show family tree.", category: "family" }),
  c("husband", { help: "Propose husband relation.", category: "family" }),
  c("wife", { help: "Propose wife relation.", category: "family" }),
  c("boyfriend", { aliases: ["bf"], help: "Propose boyfriend relation.", category: "family" }),
  c("girlfriend", { aliases: ["gf"], help: "Propose girlfriend relation.", category: "family" }),
  c("father", { aliases: ["dad"], help: "Set father relation.", category: "family" }),
  c("mother", { aliases: ["mom"], help: "Set mother relation.", category: "family" }),
  c("son", { help: "Set son relation.", category: "family" }),
  c("daughter", { help: "Set daughter relation.", category: "family" }),
  c("brother", { aliases: ["bro"], help: "Set brother relation.", category: "family" }),
  c("sister", { aliases: ["sis"], help: "Set sister relation.", category: "family" }),
  c("friend", { help: "Add a friend relation.", category: "family" }),
  c("bestie", { help: "Add a bestie relation.", category: "family" }),
  c("enemy", { help: "Add an enemy relation.", category: "family" }),
  c("divorce", { aliases: ["breakup", "clearrelation", "removefamily"], help: "Clear a relation.", category: "family" }),
  c("setrelation", { help: "Dev: force a relation.", category: "family", permission: "dev" }),
  c("games", { help: "List games.", category: "games" }),
  c("uno", { help: "Start or join UNO.", category: "games" }),
  c("chess", { help: "Start chess.", category: "games" }),
  c("tictactoe", { aliases: ["ttt"], help: "Start tic-tac-toe.", category: "games" }),
  c("scramble", { aliases: ["wordguess"], help: "Start word scramble.", category: "games" }),
  c("truthdare", { help: "Truth or dare.", category: "games" }),
  c("ludo", { help: "Open Ludo in the Mini App.", category: "games" }),
  c("carrom", { help: "Open Carrom in the Mini App.", category: "games" }),
  c("icehockey", { help: "Open Ice Hockey in the Mini App.", category: "games" }),
  c("scrabble", { help: "Open Scrabble in the Mini App.", category: "games" }),
  c("makebutton", { help: "Build a custom button message.", category: "custom", permission: "group_admin" }),
  c("cpost", { help: "Post a custom message.", category: "custom", permission: "group_admin" }),
  c("cmsg", { help: "Save a custom message.", category: "custom", permission: "group_admin" }),
  c("cdel", { help: "Delete a custom message.", category: "custom", permission: "group_admin" }),
  c("mycustom", { help: "List your custom messages.", category: "custom" }),
  c("custom", { help: "Custom message tools.", category: "custom" }),
  c("adddev", { aliases: ["addowner"], help: "Add a developer.", category: "dev", permission: "dev", prefixes: ["!"] }),
  c("removedev", { aliases: ["removeowner"], help: "Remove a developer.", category: "dev", permission: "dev", prefixes: ["!"] }),
  c("devlist", { aliases: ["ownerlist"], help: "List developers.", category: "dev", permission: "dev", prefixes: ["!"] }),
  c("devhelp", { aliases: ["ownerhelp"], help: "Developer help.", category: "dev", permission: "dev", prefixes: ["!"] }),
  c("clink", { aliases: ["community", "communitylink", "setcommunity", "setclink", "setlink"], help: "Set community link.", category: "dev", permission: "dev", prefixes: ["!"] }),
  c("maintenance", { help: "Toggle maintenance.", category: "dev", permission: "dev", prefixes: ["!"], usage: "!maintenance on|off" }),
  c("feedback", { help: "Toggle or view feedback.", category: "dev", permission: "dev", prefixes: ["!"] }),
  c("gcast", { help: "Broadcast to groups.", category: "dev", permission: "dev", prefixes: ["!"] }),
  c("ucast", { help: "Broadcast to users.", category: "dev", permission: "dev", prefixes: ["!"] }),
  c("groups", { aliases: ["mygroups"], help: "List known groups.", category: "dev", permission: "dev", prefixes: ["!"] }),
  c("users", { aliases: ["myusers"], help: "User count.", category: "dev", permission: "dev", prefixes: ["!"] }),
  c("stats", { help: "Platform stats.", category: "dev", permission: "dev", prefixes: ["!"] }),
  c("reloadpersonality", { help: "Reload the personality file.", category: "dev", permission: "dev", prefixes: ["!"] }),
  c("notifytest", { help: "Send a test developer notification.", category: "dev", permission: "dev", prefixes: ["!"] }),
  c("lockstatus", { help: "Show lock readiness.", category: "dev", permission: "dev", prefixes: ["!"] }),
  c("givecoins", { help: "Grant coins.", category: "dev", permission: "dev", prefixes: ["!"] }),
  c("setunosticker", { help: "Reply to a sticker to bind it to a UNO card code.", category: "dev", permission: "dev", prefixes: ["!"] }),
];

const byName = new Map<string, CommandDef>();
for (const cmd of COMMANDS) {
  byName.set(cmd.name, cmd);
  for (const a of cmd.aliases) byName.set(a, cmd);
}

export function resolveCommand(raw: string, botUsername: string): CommandDef | null {
  const text = raw.trim();
  const m = text.match(/^([/!.])([A-Za-z0-9_]+)(?:@([A-Za-z0-9_]+))?(\s|$)/);
  if (!m) return null;
  const prefix = m[1] as "/" | "!" | ".";
  const uname = m[3];
  if (uname && uname.toLowerCase() !== botUsername.toLowerCase()) return null;
  const key = m[2].toLowerCase();
  const cmd = byName.get(key);
  if (!cmd) return null;
  if (!cmd.prefixes.includes(prefix)) return null;
  return cmd;
}

export function helpText(): string {
  const groups = new Map<string, CommandDef[]>();
  for (const cmd of COMMANDS) {
    const list = groups.get(cmd.category) ?? [];
    list.push(cmd);
    groups.set(cmd.category, list);
  }
  const lines = ["Avni command guide"];
  for (const [cat, list] of groups) {
    lines.push("", cat.toUpperCase());
    for (const cmd of list) {
      lines.push(`/${cmd.name} — ${cmd.help}`);
    }
  }
  return lines.join("\n");
}
