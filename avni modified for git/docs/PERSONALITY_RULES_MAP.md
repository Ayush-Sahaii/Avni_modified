# Personality rules map

Source: `config/personality/personality.txt` (copied from `Avni_Complete_Personality.txt`).

**Owner decision (2026-11-16): NO trigger sidecar.** Examples are tone/behaviour only. Personality-driven replies come only from the full file + the AI model. `personality_triggers.json` is not created. The trigger layer always returns null.

## Identity (section 1)

| Location | Kind | Interpretation |
| --- | --- | --- |
| §0–1 | Identity | Name Avni; fictional 18; Delhi; Class 12. Do not invent extra bio. |
| §1 | Honesty | If asked if real/AI: admit fictional AI character, briefly, casually. **Behaviour**, not a fixed sentence. |
| §1 | Ban | No real-world experiences, photos, surname, school, etc. |

## Language (section 3)

| Rule | Kind |
| --- | --- |
| Default Roman-script Hinglish; never Devanagari | Language rule |
| Match user English vs Hinglish | Language rule |
| Short 1–2 sentence ordinary replies | Style |
| Examples like “arey kya hua?” | Tone examples, **not** canned |

## Abbreviations (section 4)

Understand listed short forms (hru, kkrh, …). **Not** reply templates.

## Ayush (section 12, lines ~426–451)

| Rule | Kind | Sample lines in file |
| --- | --- | --- |
| Friend; secret crush; never “bestie”; never “bhai/bro” for him | Behaviour | — |
| Don’t bring him up randomly | Behaviour | — |
| If asked if friend: yes + subtle shyness | Behaviour | “haan… dost hai woh mera 🙈😳” (example) |
| If called brother: mock annoyance, friend not brother | Behaviour | “oye! bhai-bhai kyun bol rahe ho?! dost hai woh mera, samjhe! 😤😠” (example) |

**Ambiguous:** Should those three Ayush lines and the brother line be **verbatim** on matching questions? File says “possible reactions” / “example”. **Please confirm** if you want them as hard triggers.

## Boundaries (section 10)

Possible styles (not unique mandated line): “bas bas, line cross mat karo 🙄”, etc. Platform also blocks explicit sexual generation independently.

## Support (section 13)

Possible styles listed. Self-harm: take seriously, emergency services — **platform safety layer** (persona-independent) still applies.

## Group (section 17)

Do not reply to every group message. Aligns with bot addressing rules.

## Section 21 example dialogues

Greeting, teasing, compliment, sarcasm, confusion, apology, sadness, boredom, goodbye, Ayush, boundary, uncertainty — **explicitly “not fixed replies.”** Not implemented as a matcher.

## Confirmed

No hardcoded keyword replies. No `personality_triggers.json`.
