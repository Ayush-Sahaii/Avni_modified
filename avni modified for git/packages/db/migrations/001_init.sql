-- Avni schema — PostgreSQL

CREATE TABLE users (
  telegram_id BIGINT PRIMARY KEY,
  first_name TEXT NOT NULL DEFAULT '',
  last_name TEXT,
  username TEXT,
  language TEXT,
  is_bot_known BOOLEAN NOT NULL DEFAULT TRUE,
  first_seen TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE chats (
  chat_id BIGINT PRIMARY KEY,
  type TEXT NOT NULL,
  title TEXT,
  username TEXT,
  migrated_to BIGINT,
  bot_status TEXT,
  bot_rights JSONB NOT NULL DEFAULT '{}',
  added_by BIGINT,
  added_at TIMESTAMPTZ,
  left_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE chat_members_seen (
  chat_id BIGINT NOT NULL REFERENCES chats(chat_id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(telegram_id) ON DELETE CASCADE,
  last_seen TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (chat_id, user_id)
);

CREATE TABLE devs (
  user_id BIGINT PRIMARY KEY REFERENCES users(telegram_id) ON DELETE CASCADE,
  added_by BIGINT,
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE chat_settings (
  chat_id BIGINT PRIMARY KEY REFERENCES chats(chat_id) ON DELETE CASCADE,
  ai_chat BOOLEAN NOT NULL DEFAULT TRUE,
  kill_system BOOLEAN NOT NULL DEFAULT TRUE,
  warn_limit INT NOT NULL DEFAULT 3,
  warn_action TEXT NOT NULL DEFAULT 'mute',
  warn_action_duration INT NOT NULL DEFAULT 3600,
  antiflood_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  antiflood_window INT NOT NULL DEFAULT 10,
  antiflood_limit INT NOT NULL DEFAULT 8,
  antiflood_action TEXT NOT NULL DEFAULT 'mute',
  antiflood_duration INT NOT NULL DEFAULT 3600,
  promotion_scope TEXT NOT NULL DEFAULT 'bots_only',
  locks_apply_to_channel_senders BOOLEAN NOT NULL DEFAULT FALSE,
  welcome_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  welcome_text TEXT,
  welcome_buttons JSONB,
  goodbye_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  goodbye_text TEXT,
  goodbye_buttons JSONB,
  rules_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE lock_rules (
  chat_id BIGINT NOT NULL REFERENCES chats(chat_id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT FALSE,
  action TEXT NOT NULL DEFAULT 'delete',
  mute_seconds INT NOT NULL DEFAULT 3600,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (chat_id, category),
  CONSTRAINT lock_action_chk CHECK (action IN ('delete','mute','kick','ban'))
);

CREATE TABLE approvals (
  chat_id BIGINT NOT NULL REFERENCES chats(chat_id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(telegram_id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (chat_id, user_id, category),
  CONSTRAINT approval_cat_chk CHECK (category IN ('text','link','sticker','photo','video','file','gif','voice','media','biolink','promotion'))
);

CREATE TABLE promotion_allowlist (
  chat_id BIGINT NOT NULL REFERENCES chats(chat_id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('bot','domain')),
  value TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (chat_id, kind, value)
);

CREATE TABLE force_sub_config (
  chat_id BIGINT PRIMARY KEY REFERENCES chats(chat_id) ON DELETE CASCADE,
  channel_id BIGINT,
  channel_username TEXT,
  invite_link TEXT,
  enabled BOOLEAN NOT NULL DEFAULT FALSE,
  action TEXT NOT NULL DEFAULT 'delete',
  mute_seconds INT NOT NULL DEFAULT 3600,
  fail_policy TEXT NOT NULL DEFAULT 'open',
  check_on_join BOOLEAN NOT NULL DEFAULT TRUE,
  notice_mode TEXT NOT NULL DEFAULT 'once',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE force_sub_exempt (
  chat_id BIGINT NOT NULL REFERENCES chats(chat_id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL,
  PRIMARY KEY (chat_id, user_id)
);

CREATE TABLE filters (
  id BIGSERIAL PRIMARY KEY,
  chat_id BIGINT NOT NULL REFERENCES chats(chat_id) ON DELETE CASCADE,
  keyword TEXT NOT NULL,
  match_mode TEXT NOT NULL DEFAULT 'contains',
  kind TEXT NOT NULL DEFAULT 'text',
  payload TEXT,
  caption TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE warnings (
  chat_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  count INT NOT NULL DEFAULT 0 CHECK (count >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (chat_id, user_id)
);

CREATE TABLE mutes (
  chat_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  until TIMESTAMPTZ NOT NULL,
  reason TEXT,
  source TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (chat_id, user_id)
);
CREATE INDEX mutes_until_idx ON mutes (until);

CREATE TABLE audit_log (
  id BIGSERIAL PRIMARY KEY,
  chat_id BIGINT,
  actor_id BIGINT,
  target_id BIGINT,
  action TEXT NOT NULL,
  category TEXT,
  source TEXT,
  message_id BIGINT,
  result TEXT,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX audit_chat_idx ON audit_log (chat_id, created_at DESC);

CREATE TABLE wallets (
  user_id BIGINT PRIMARY KEY REFERENCES users(telegram_id) ON DELETE CASCADE,
  balance BIGINT NOT NULL DEFAULT 0,
  infinite BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT wallet_balance_chk CHECK (infinite OR balance >= 0)
);

CREATE TABLE ledger (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(telegram_id) ON DELETE CASCADE,
  delta BIGINT NOT NULL,
  reason TEXT NOT NULL,
  ref TEXT,
  idempotency_key TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE xp (
  user_id BIGINT PRIMARY KEY REFERENCES users(telegram_id) ON DELETE CASCADE,
  xp BIGINT NOT NULL DEFAULT 0 CHECK (xp >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE kill_state (
  user_id BIGINT PRIMARY KEY,
  dead_until TIMESTAMPTZ,
  protected_until TIMESTAMPTZ,
  rob_jail_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE family_relations (
  user_id BIGINT NOT NULL,
  relation TEXT NOT NULL,
  relative_id BIGINT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX family_single_slot ON family_relations (user_id, relation)
  WHERE relation IN ('husband','wife','boyfriend','girlfriend','father','mother');

CREATE TABLE family_proposals (
  id BIGSERIAL PRIMARY KEY,
  from_id BIGINT NOT NULL,
  to_id BIGINT NOT NULL,
  relation TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE whispers (
  id TEXT PRIMARY KEY,
  sender_id BIGINT NOT NULL,
  recipient_id BIGINT,
  recipient_username TEXT,
  chat_id BIGINT,
  content_encrypted TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'unread',
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE game_rooms (
  id TEXT PRIMARY KEY,
  game TEXT NOT NULL,
  host_id BIGINT NOT NULL,
  status TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '{}',
  invite_token TEXT UNIQUE NOT NULL,
  origin_chat_id BIGINT,
  origin_message_id BIGINT,
  version INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ
);

CREATE TABLE room_players (
  room_id TEXT NOT NULL REFERENCES game_rooms(id) ON DELETE CASCADE,
  seat INT NOT NULL,
  user_id BIGINT,
  is_bot BOOLEAN NOT NULL DEFAULT FALSE,
  bot_level INT,
  status TEXT NOT NULL DEFAULT 'empty',
  joined_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (room_id, seat)
);

CREATE TABLE room_events (
  room_id TEXT NOT NULL REFERENCES game_rooms(id) ON DELETE CASCADE,
  seq INT NOT NULL,
  type TEXT NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (room_id, seq)
);

CREATE TABLE room_snapshots (
  room_id TEXT NOT NULL,
  seq INT NOT NULL,
  state JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (room_id, seq)
);

CREATE TABLE game_results (
  room_id TEXT PRIMARY KEY,
  placements JSONB NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE game_stats (
  user_id BIGINT NOT NULL,
  game TEXT NOT NULL,
  played INT NOT NULL DEFAULT 0,
  wins INT NOT NULL DEFAULT 0,
  losses INT NOT NULL DEFAULT 0,
  draws INT NOT NULL DEFAULT 0,
  streak INT NOT NULL DEFAULT 0,
  best_streak INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, game)
);

CREATE TABLE daily_stats (
  user_id BIGINT NOT NULL,
  day DATE NOT NULL,
  wins INT NOT NULL DEFAULT 0,
  coins BIGINT NOT NULL DEFAULT 0,
  xp BIGINT NOT NULL DEFAULT 0,
  games INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, day)
);

CREATE TABLE deadlines (
  id BIGSERIAL PRIMARY KEY,
  kind TEXT NOT NULL,
  ref TEXT NOT NULL,
  fire_at TIMESTAMPTZ NOT NULL,
  payload JSONB,
  done BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX deadlines_due_idx ON deadlines (done, fire_at);

CREATE TABLE feedback (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT,
  category TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE processed_updates (
  update_id BIGINT PRIMARY KEY,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE app_flags (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE personality_load_log (
  id BIGSERIAL PRIMARY KEY,
  checksum TEXT,
  size INT,
  loaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ok BOOLEAN NOT NULL,
  error TEXT
);

CREATE TABLE content_lists (
  id BIGSERIAL PRIMARY KEY,
  kind TEXT NOT NULL,
  text TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE achievements (
  user_id BIGINT NOT NULL,
  code TEXT NOT NULL,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, code)
);
