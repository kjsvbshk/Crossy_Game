// Thin localStorage wrapper for the bits that outlive a run: coins earned,
// characters unlocked, the last-picked character, and the best score. Every
// access is wrapped — a private window or storage-blocked browser just means
// the game runs with defaults and saves silently no-op.

const KEY = "crossy.save.v1";

const DEFAULTS = {
  coins: 0,
  highScore: 0,
  unlocked: ["dough"], // ids from gameplay/characters/CharacterDefinitions.js
  characterId: "dough",
};

export function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULTS };
    const parsed = JSON.parse(raw);
    return {
      coins: Number(parsed.coins) || 0,
      highScore: Number(parsed.highScore) || 0,
      unlocked: Array.isArray(parsed.unlocked) && parsed.unlocked.length ? parsed.unlocked : [...DEFAULTS.unlocked],
      characterId: typeof parsed.characterId === "string" ? parsed.characterId : DEFAULTS.characterId,
    };
  } catch {
    return { ...DEFAULTS };
  }
}

export function save(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify({
      coins: state.coins,
      highScore: state.highScore,
      unlocked: state.unlocked,
      characterId: state.characterId,
    }));
  } catch {
    /* storage unavailable — ignore */
  }
}
