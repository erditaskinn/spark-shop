let context: AudioContext | undefined;
let muted = false;
export function muteAudio(value: boolean): void { muted = value; }
export function playSound(enabled: boolean, fault = false): void {
  if (!enabled || muted) return;
  try {
    context ??= new AudioContext(); void context.resume();
    const oscillator = context.createOscillator(), gain = context.createGain();
    oscillator.type = 'sine'; oscillator.frequency.setValueAtTime(fault ? 880 : 520, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(fault ? 1320 : 780, context.currentTime + 0.08);
    gain.gain.setValueAtTime(0.05, context.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.12);
    oscillator.connect(gain); gain.connect(context.destination); oscillator.start(); oscillator.stop(context.currentTime + 0.13);
  } catch { /* Audio is optional. */ }
}
