// Thin localStorage wrapper for the bits that outlive a run: coins earned,
// characters unlocked, the last-picked character, the best score, and the
// player's options. Every access is wrapped — a private window or
// storage-blocked browser just runs with defaults and saves silently no-op.

const KEY = "crossy.save.v1";

const DEFAULTS = {
  coins: 0,
  highScore: 0,
  unlocked: ["dough"], // ids from gameplay/characters/CharacterDefinitions.js
  characterId: "dough",
  options: { postfx: true, reducedMotion: false },
};

export function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return structuredCloneDefaults();
    const p = JSON.parse(raw);
    return {
      coins: Number(p.coins) || 0,
      highScore: Number(p.highScore) || 0,
      unlocked: Array.isArray(p.unlocked) && p.unlocked.length ? p.unlocked : [...DEFAULTS.unlocked],
      characterId: typeof p.characterId === "string" ? p.characterId : DEFAULTS.characterId,
      options: {
        postfx: p.options?.postfx !== false,
        reducedMotion: p.options?.reducedMotion === true,
      },
    };
  } catch {
    return structuredCloneDefaults();
  }
}

export function save(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify({
      coins: state.coins,
      highScore: state.highScore,
      unlocked: state.unlocked,
      characterId: state.characterId,
      options: state.options,
    }));
  } catch {
    /* storage unavailable — ignore */
  }
}

export function clear() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

function structuredCloneDefaults() {
  return { ...DEFAULTS, unlocked: [...DEFAULTS.unlocked], options: { ...DEFAULTS.options } };
}
