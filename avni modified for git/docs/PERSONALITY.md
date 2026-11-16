# Personality

Path: `config/personality/personality.txt` (`PERSONALITY_FILE`).

If missing, AI is DISABLED. Other features run.

`!reloadpersonality` re-reads the file. A failed reload keeps the last good copy.

Never put persona strings in application source.

When you add the file, we will produce `PERSONALITY_RULES_MAP.md` and ask you to confirm triggers before enabling the matcher.
