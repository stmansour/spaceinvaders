/*jshint esversion: 6 */
// Arcade-style sound effects using Web Audio API (no asset files required).
class SISound {
    constructor() {
        this.ctx = null;
        this.master = null;
        this.noiseBuffer = null;
        this.marchStep = 0;
        this.nextMarchTime = 0;
        this.marchNotes = [55, 49, 44, 39];
        this.mysteryOsc = null;
        this.mysteryLfo = null;
    }

    init() {
        if (this.ctx) { return; }
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            let compressor = this.ctx.createDynamicsCompressor();
            compressor.threshold.value = -18;
            compressor.knee.value = 18;
            compressor.ratio.value = 8;
            compressor.attack.value = 0.003;
            compressor.release.value = 0.18;

            this.master = this.ctx.createGain();
            this.master.gain.value = 0.55;
            this.master.connect(compressor);
            compressor.connect(this.ctx.destination);
            this.noiseBuffer = this.createNoiseBuffer(1);
        } catch (e) {
            console.log("Sound not available:", e);
        }
    }

    ensureContext() {
        if (!this.ctx) { this.init(); }
        if (!this.ctx) { return false; }
        if (this.ctx.state === "suspended") { this.ctx.resume(); }
        return true;
    }

    createNoiseBuffer(duration) {
        let sampleRate = this.ctx.sampleRate;
        let buffer = this.ctx.createBuffer(1, sampleRate * duration, sampleRate);
        let data = buffer.getChannelData(0);
        for (let i = 0; i < data.length; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        return buffer;
    }

    envelope(gain, start, duration, volume) {
        gain.gain.cancelScheduledValues(start);
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(volume, start + 0.006);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    }

    tone(freq, duration, type, volume) {
        if (!this.ensureContext()) { return; }
        let now = this.ctx.currentTime;
        let osc = this.ctx.createOscillator();
        let gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.master);
        osc.type = type || "square";
        osc.frequency.value = freq;
        this.envelope(gain, now, duration, volume || 0.16);
        osc.start(now);
        osc.stop(now + duration);
    }

    sweep(startFreq, endFreq, duration, type, volume) {
        if (!this.ensureContext()) { return; }
        let now = this.ctx.currentTime;
        let osc = this.ctx.createOscillator();
        let gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.master);
        osc.type = type || "square";
        osc.frequency.setValueAtTime(startFreq, now);
        osc.frequency.exponentialRampToValueAtTime(endFreq, now + duration);
        this.envelope(gain, now, duration, volume || 0.18);
        osc.start(now);
        osc.stop(now + duration);
    }

    noiseBurst(duration, volume, filterType, frequency) {
        if (!this.ensureContext()) { return; }
        let now = this.ctx.currentTime;
        let noise = this.ctx.createBufferSource();
        let filter = this.ctx.createBiquadFilter();
        let gain = this.ctx.createGain();
        noise.buffer = this.noiseBuffer;
        filter.type = filterType || "bandpass";
        filter.frequency.value = frequency || 900;
        filter.Q.value = 3;
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.master);
        this.envelope(gain, now, duration, volume || 0.2);
        noise.start(now);
        noise.stop(now + duration);
    }

    updateInvaderMarch(activeInvaders, totalInvaders) {
        if (!this.ctx || this.ctx.state === "suspended") { return; }
        if (activeInvaders <= 0) { return; }

        let now = this.ctx.currentTime;
        let ratio = activeInvaders / totalInvaders;
        let interval = 0.16 + ratio * 0.56;
        if (now < this.nextMarchTime) { return; }

        let note = this.marchNotes[this.marchStep % this.marchNotes.length];
        this.tone(note, 0.075, "square", 0.09);
        this.marchStep++;
        this.nextMarchTime = now + interval;
    }

    shoot() {
        this.sweep(1450, 75, 0.14, "sawtooth", 0.19);
        this.noiseBurst(0.055, 0.08, "highpass", 1800);
    }

    invaderHit() {
        this.noiseBurst(0.13, 0.22, "bandpass", 420);
        this.sweep(260, 90, 0.12, "square", 0.09);
    }

    mysteryHit() {
        this.mysteryStop();
        this.sweep(900, 120, 0.22, "square", 0.18);
        this.noiseBurst(0.18, 0.14, "bandpass", 1100);
    }

    playerExplosion() {
        if (!this.ensureContext()) { return; }
        let now = this.ctx.currentTime;
        let duration = 0.65;
        let noise = this.ctx.createBufferSource();
        let filter = this.ctx.createBiquadFilter();
        let gain = this.ctx.createGain();
        noise.buffer = this.noiseBuffer;
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(1600, now);
        filter.frequency.exponentialRampToValueAtTime(90, now + duration);
        filter.Q.value = 1.2;
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.master);
        this.envelope(gain, now, duration, 0.34);
        noise.start(now);
        noise.stop(now + duration);
        this.sweep(130, 35, duration, "sawtooth", 0.16);
    }

    bunkerHit() {
        this.noiseBurst(0.055, 0.12, "bandpass", 220);
    }

    mysteryStart() {
        if (!this.ensureContext() || this.mysteryOsc) { return; }
        let now = this.ctx.currentTime;
        let osc = this.ctx.createOscillator();
        let lfo = this.ctx.createOscillator();
        let lfoGain = this.ctx.createGain();
        let gain = this.ctx.createGain();

        osc.type = "square";
        osc.frequency.value = 520;
        lfo.type = "triangle";
        lfo.frequency.value = 8;
        lfoGain.gain.value = 80;
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        osc.connect(gain);
        gain.connect(this.master);
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.08, now + 0.04);

        osc.start(now);
        lfo.start(now);
        this.mysteryOsc = { osc: osc, gain: gain };
        this.mysteryLfo = lfo;
    }

    mysteryStop() {
        if (!this.ctx || !this.mysteryOsc) { return; }
        let now = this.ctx.currentTime;
        this.mysteryOsc.gain.gain.cancelScheduledValues(now);
        this.mysteryOsc.gain.gain.setValueAtTime(this.mysteryOsc.gain.gain.value || 0.0001, now);
        this.mysteryOsc.gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
        this.mysteryOsc.osc.stop(now + 0.06);
        this.mysteryLfo.stop(now + 0.06);
        this.mysteryOsc = null;
        this.mysteryLfo = null;
    }

    coinDrop() {
        if (!this.ensureContext()) { return; }
        let now = this.ctx.currentTime;
        // Mechanical microswitch trip
        this.noiseBurst(0.04, 0.12, "highpass", 2400);

        // First coin chime
        let osc1 = this.ctx.createOscillator();
        let gain1 = this.ctx.createGain();
        osc1.type = "sine";
        osc1.frequency.setValueAtTime(987.77, now + 0.02); // B5
        osc1.connect(gain1);
        gain1.connect(this.master);
        this.envelope(gain1, now + 0.02, 0.08, 0.16);
        osc1.start(now + 0.02);
        osc1.stop(now + 0.12);

        // Second resonant bell chime (coin drops into metal chute)
        let osc2 = this.ctx.createOscillator();
        let gain2 = this.ctx.createGain();
        osc2.type = "triangle";
        osc2.frequency.setValueAtTime(1318.51, now + 0.08); // E6
        osc2.connect(gain2);
        gain2.connect(this.master);
        this.envelope(gain2, now + 0.08, 0.18, 0.18);
        osc2.start(now + 0.08);
        osc2.stop(now + 0.28);
    }

    buttonClick() {
        if (!this.ensureContext()) { return; }
        this.noiseBurst(0.025, 0.10, "highpass", 3200);
        this.sweep(480, 120, 0.03, "square", 0.08);
    }

    extraLife() {
        if (!this.ensureContext()) { return; }
        let now = this.ctx.currentTime;
        // Triumphant classic arcade 1-UP fanfare
        // Rising arpeggio followed by a bright celebratory chime and shimmer
        const notes = [
            { f: 523.25, t: 0.00, d: 0.08 }, // C5
            { f: 659.25, t: 0.07, d: 0.08 }, // E5
            { f: 783.99, t: 0.14, d: 0.08 }, // G5
            { f: 1046.50, t: 0.21, d: 0.08 }, // C6
            { f: 1318.51, t: 0.28, d: 0.10 }, // E6
            { f: 1567.98, t: 0.37, d: 0.12 }, // G6
            { f: 2093.00, t: 0.48, d: 0.42 }, // High C7 (celebratory peak)
        ];

        // 1. Primary bright square-wave arcade lead
        for (let i = 0; i < notes.length; i++) {
            let n = notes[i];
            let osc = this.ctx.createOscillator();
            let gain = this.ctx.createGain();
            osc.type = "square";
            osc.frequency.setValueAtTime(n.f, now + n.t);
            osc.connect(gain);
            gain.connect(this.master);
            this.envelope(gain, now + n.t, n.d, 0.36);
            osc.start(now + n.t);
            osc.stop(now + n.t + n.d + 0.04);
        }

        // 2. Harmonizing lower support voice for authentic arcade cabinet fullness
        const harmonyNotes = [
            { f: 261.63, t: 0.00, d: 0.08 }, // C4
            { f: 329.63, t: 0.07, d: 0.08 }, // E4
            { f: 392.00, t: 0.14, d: 0.08 }, // G4
            { f: 523.25, t: 0.21, d: 0.08 }, // C5
            { f: 659.25, t: 0.28, d: 0.10 }, // E5
            { f: 783.99, t: 0.37, d: 0.12 }, // G5
            { f: 1318.51, t: 0.48, d: 0.42 }, // E6 (harmonic major 3rd with C7)
        ];

        for (let i = 0; i < harmonyNotes.length; i++) {
            let n = harmonyNotes[i];
            let osc = this.ctx.createOscillator();
            let gain = this.ctx.createGain();
            osc.type = "triangle";
            osc.frequency.setValueAtTime(n.f, now + n.t);
            osc.connect(gain);
            gain.connect(this.master);
            this.envelope(gain, now + n.t, n.d, 0.30);
            osc.start(now + n.t);
            osc.stop(now + n.t + n.d + 0.04);
        }

        // 3. Sparkling resolution sparkle / chime
        let chimeTimes = [0.50, 0.58, 0.66, 0.74];
        let chimeFreqs = [2637.02, 3135.96, 3520.00, 4186.01]; // E7, G7, A7, C8
        for (let i = 0; i < chimeTimes.length; i++) {
            let osc = this.ctx.createOscillator();
            let gain = this.ctx.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(chimeFreqs[i], now + chimeTimes[i]);
            osc.connect(gain);
            gain.connect(this.master);
            this.envelope(gain, now + chimeTimes[i], 0.16, 0.20);
            osc.start(now + chimeTimes[i]);
            osc.stop(now + chimeTimes[i] + 0.18);
        }
    }

    hyperspaceWarp() {
        if (!this.ensureContext()) { return; }
        let now = this.ctx.currentTime;
        let duration = 1.4;

        // 1. Sub-bass rumble
        let subOsc = this.ctx.createOscillator();
        let subGain = this.ctx.createGain();
        subOsc.type = "triangle";
        subOsc.frequency.setValueAtTime(85, now);
        subOsc.frequency.exponentialRampToValueAtTime(32, now + duration);
        subGain.gain.setValueAtTime(0.001, now);
        subGain.gain.exponentialRampToValueAtTime(0.24, now + 0.1);
        subGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
        subOsc.connect(subGain);
        subGain.connect(this.master);
        subOsc.start(now);
        subOsc.stop(now + duration);

        // 2. Dual-stage resonant warp sweep
        let warpOsc = this.ctx.createOscillator();
        let warpFilter = this.ctx.createBiquadFilter();
        let warpGain = this.ctx.createGain();

        warpOsc.type = "sawtooth";
        warpOsc.frequency.setValueAtTime(110, now);
        warpOsc.frequency.exponentialRampToValueAtTime(880, now + duration * 0.7);
        warpOsc.frequency.exponentialRampToValueAtTime(440, now + duration);

        warpFilter.type = "bandpass";
        warpFilter.Q.value = 4.5;
        warpFilter.frequency.setValueAtTime(180, now);
        warpFilter.frequency.exponentialRampToValueAtTime(2400, now + duration * 0.75);
        warpFilter.frequency.exponentialRampToValueAtTime(600, now + duration);

        warpGain.gain.setValueAtTime(0.001, now);
        warpGain.gain.exponentialRampToValueAtTime(0.20, now + 0.15);
        warpGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        warpOsc.connect(warpFilter);
        warpFilter.connect(warpGain);
        warpGain.connect(this.master);
        warpOsc.start(now);
        warpOsc.stop(now + duration);

        // 3. Shimmering cosmic noise glide
        if (this.noiseBuffer) {
            let noise = this.ctx.createBufferSource();
            noise.buffer = this.noiseBuffer;
            noise.loop = true;
            let noiseFilter = this.ctx.createBiquadFilter();
            noiseFilter.type = "highpass";
            noiseFilter.frequency.setValueAtTime(2200, now);
            noiseFilter.frequency.exponentialRampToValueAtTime(800, now + duration);
            let noiseGain = this.ctx.createGain();
            noiseGain.gain.setValueAtTime(0.001, now);
            noiseGain.gain.exponentialRampToValueAtTime(0.12, now + 0.2);
            noiseGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
            noise.connect(noiseFilter);
            noiseFilter.connect(noiseGain);
            noiseGain.connect(this.master);
            noise.start(now);
            noise.stop(now + duration);
        }
    }
}
