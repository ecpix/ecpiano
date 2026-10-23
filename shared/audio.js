// ---------- Sound ----------
// A simple piano-like tone made in the browser (no audio files): a few harmonics with a quick
// attack and a slow decay, higher notes dying away faster.
const HARMONICS = [0, 1, 0.5, 0.3, 0.18, 0.1, 0.06];
const HARMONIC_SUM = HARMONICS.reduce((s, h) => s + h, 0);
const ARPEGGIO_STEP = 0.2;           // seconds between notes of an arpeggio
let audio = null;

// Schedules the notes on any audio context (a live one, or an offline one for tests).
function renderChord(ctx, dest, midiNotes, arpeggio, t0) {
  const wave = ctx.createPeriodicWave(new Float32Array(HARMONICS.length), Float32Array.from(HARMONICS));
  const master = ctx.createGain();
  master.gain.value = 0.8 / (HARMONIC_SUM * Math.sqrt(midiNotes.length));
  master.connect(dest);
  midiNotes.forEach((m, i) => {
    const freq = 440 * Math.pow(2, (m - 69) / 12);
    const t = t0 + (arpeggio ? i * ARPEGGIO_STEP : 0);
    const decay = Math.max(0.9, Math.min(3, 2.8 * Math.pow(261.6 / freq, 0.45)));
    const osc = ctx.createOscillator();
    osc.setPeriodicWave(wave);
    osc.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(1, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
    osc.connect(g); g.connect(master);
    osc.start(t); osc.stop(t + decay + 0.05);
  });
  return master;
}

/** Lowest note is never below G3, so a chord always sits around middle C (the root lands between G3 and F#4). */
function chordMidiNotes(root, quality) {
  const base = 55 + ((root.pc - 7 + 12) % 12);
  return quality.tones.map(([semis]) => base + semis);
}

/** Plays notes (MIDI numbers) together, or one after another when arpeggio is true. */
function playMidiNotes(midiNotes, arpeggio) {
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return;
  if (!audio) {
    const ctx = new Ctx();
    const comp = ctx.createDynamicsCompressor();
    comp.connect(ctx.destination);
    audio = { ctx, comp, master: null };
  }
  const { ctx, comp } = audio;
  if (ctx.state === "suspended") ctx.resume();
  if (audio.master) audio.master.gain.setTargetAtTime(0, ctx.currentTime, 0.04);   // fade out what is still ringing
  audio.master = renderChord(ctx, comp, midiNotes, arpeggio, ctx.currentTime + 0.05);
}
