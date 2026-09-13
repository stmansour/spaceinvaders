/*jshint esversion: 6 */

const MODE_SPLASH = -1;
const MODE_NOT_PLAYING = 0;
const MODE_NEW_GAME_1_PLAYER = 1;
const MODE_NEW_GAME_2_PLAYERS = 2;
const MODE_HOLD_SCREEN_MSG = 3;
const MODE_NEXT_WAVE = 4;

const GAME_IN_PROGRESS = 0;
const GAME_PLAYER_DEFEATED_WAVE = 1;
const GAME_PLAYER_LOST_WAVE = 2;
const GAME_PLAYER_LOST = 3;
const GAME_PLAYER_WON = 4;  // I don't know about this, not sure how player wins.
const GAME_HOLD_FOR_MESSAGE = 100;

class SpaceInvadersApp {
    constructor(t_testMode,testdata) {
        this.a1 = null; // invader a image arms down
        this.a2 = null; // invader a image arms up
        this.b1 = null; // invader a image arms down
        this.b2 = null; // invader a image arms up
        this.c1 = null; // invader a image arms down
        this.c2 = null; // invader a image arms up
        this.d = null;  // mystery ship
        this.bmb3a = null;      // bomb 3
        this.eplode = null;     // explosion graphic
        this.cannon = null;     // the laser cannon image
        this.cannonShot = null; // the laser cannon image
        this.splashLogo = null; // nostalgic startup splash artwork
        this.invaders = null;
        this.laserCannon = null;
        this.shots = null;
        this.maxShipWidth = 0;
        this.border = 30;
        this.topBar = 50; // y limit of top area for messages/scores, etc.
        this.gameOver = false;
        this.gameOverTimer = null;
        this.gameStatus = 0; // 0 = in progress, 1 = player won, 2 = player lost
        this.players = []; // array of player objects.
        this.currentPlayer = 0; // during play, this can be 0 or 1
        this.highScore = 0;
        this.credits = 0;
        this.cSize = 14; // size of large characters
        this.font = null;
        this.mode = MODE_SPLASH; // -1 = splash, 0 = not playing, 1 = 1 player, 2 = 2 players, 3 = freeze screen so user can see why they lost
        this.screen = new SIScreen();
        this.msgTmr = null;
        this.pendingPlayer = null;
        this.bottomLineHeight = 0;
        this.splashStartTime = 0;
        this.splashDuration = 4000;
        this.splashRevealDuration = 500;
        this.testMode = (typeof t_testMode === 'undefined') ? false : t_testMode;
        this.testdata = (typeof testdata === 'undefined') ? null : testdata;
        this.resumeSameWave = false;  // when true, nextWave continuation resumes current wave
        this.sound = new SISound();
        this.bgImages = [];
        this.transitionActive = false;
        this.transitionStartTime = 0;
        this.transitionDuration = 1400;
        this.transitionType = 0;
        this.prevBgImage = null;
        this.currBgImage = null;
    }

    loadImages() {
        this.a1 = loadImage('assets/a1.png');
        this.a2 = loadImage('assets/a2.png');
        this.b1 = loadImage('assets/b1.png');
        this.b2 = loadImage('assets/b2.png');
        this.c1 = loadImage('assets/c1.png');
        this.c2 = loadImage('assets/c2.png');
        this.d  = loadImage('assets/d.png');
        this.bmb1a = loadImage('assets/bmb1a.png');
        this.bmb1b = loadImage('assets/bmb1b.png');
        this.bmb2a = loadImage('assets/bmb2a.png');
        this.bmb2b = loadImage('assets/bmb2b.png');
        this.bmb2c = loadImage('assets/bmb2c.png');
        this.bmb3a = loadImage('assets/bmb3a.png');
        this.bmb3b = loadImage('assets/bmb3b.png');
        this.bmb3c = loadImage('assets/bmb3c.png');
        this.explode  = loadImage('assets/explode.png');
        this.cannon = loadImage('assets/lasercannon.png');
        this.cannonShot = loadImage('assets/cannonshot.png');
        this.splashLogo = loadImage('assets/SpaceInvadersLogo.png');

        this.font = loadFont("assets/PixelSplitter-Bold.ttf");

        this.bgImages = [
            loadImage('assets/bg_moon.jpg'),
            loadImage('assets/bg_nebula.jpg'),
            loadImage('assets/bg_ringed_planet.jpg'),
            loadImage('assets/bg_mars.jpg'),
            loadImage('assets/bg_galaxy.jpg'),
            loadImage('assets/bg_pulsar.jpg'),
            loadImage('assets/bg_eclipse.jpg')
        ];
    }

    loadAllPixels() {
        this.a1.loadPixels();
        this.a2.loadPixels();
        this.b1.loadPixels();
        this.b2.loadPixels();
        this.c1.loadPixels();
        this.c2.loadPixels();
        this.d.loadPixels();
        this.bmb1a.loadPixels();
        this.bmb1b.loadPixels();
        this.bmb2a.loadPixels();
        this.bmb2b.loadPixels();
        this.bmb2c.loadPixels();
        this.bmb3a.loadPixels();
        this.bmb3b.loadPixels();
        this.bmb3c.loadPixels();
        this.explode.loadPixels();
        this.cannon.loadPixels();
        this.cannonShot.loadPixels();
        app.bottomLineHeight = height - app.cannon.height - 20;
    }

    setMaxShipWidth() {
        this.maxShipWidth = this.a1.width;
        if (this.b1.width > this.maxShipWidth) {
            this.maxShipWidth = this.b1.width;
        }
        if (this.c1.width > this.maxShipWidth) {
            this.maxShipWidth = this.c1.width;
        }
    }

    nextWave() {
        this.invaders = new Invaders(this.testMode,this.testdata);
        this.invaders.init();
        this.invaders.speed = 5; // each horizontal move is this many pixels
        this.laserCannon = new LaserCannon();
        this.laserCannon.init();
        this.shots = new Shots();
        this.bunkers = new Bunkers();
        this.bunkers.init();
        this.gameStatus = GAME_IN_PROGRESS;
        this.screen.insertCoinsShow = false;
        this.players[this.currentPlayer].invaders = this.invaders;

        let wave = (this.players && this.players[this.currentPlayer]) ? (this.players[this.currentPlayer].wavesCompleted || 0) : 0;
        let prevBg = (wave > 0 && this.bgImages.length > 0) ? this.bgImages[(wave - 1) % this.bgImages.length] : null;
        let currBg = (this.bgImages.length > 0) ? this.bgImages[wave % this.bgImages.length] : null;
        this.startWaveTransition(prevBg, currBg, wave);
        if (typeof updateArcadeConsoleUI === 'function') {
            updateArcadeConsoleUI();
        }
    }

    // Resume same wave after player was hit (invaders stay where they are).
    resumeWave() {
        this.invaders = this.players[this.currentPlayer].invaders;
        this.laserCannon = new LaserCannon();
        this.laserCannon.init();
        this.shots = new Shots();
        this.bunkers = new Bunkers();
        this.bunkers.init();  // fresh bunkers each life
        for (let i = 0; i < this.invaders.squadrons.length; i++) {
            this.invaders.squadrons[i].bombs.bombs = [];
            this.invaders.squadrons[i].bombs.explosions = [];
            this.invaders.squadrons[i].bombs.hitx = 0;
            this.invaders.squadrons[i].bombs.hity = 0;
        }
        this.gameStatus = GAME_IN_PROGRESS;
        this.screen.insertCoinsShow = false;
        this.resumeSameWave = false;
        if (this.invaders && this.invaders.mystery) {
            this.invaders.mystery.cancel();
            this.invaders.mystery.go();
        }
    }

    newGame() {
        this.currentPlayer = 0;
        this.pendingPlayer = null;
        this.resumeSameWave = false;
        this.gameOver = false;
        this.nextWave();
    }

    continueCurrentPlayer() {
        let player = this.players[this.currentPlayer];
        if (player.invaders) {
            this.resumeWave();
        } else {
            this.nextWave();
        }
    }

    nextTurnPlayer() {
        for (let i = 1; i < this.players.length; i++) {
            let idx = (this.currentPlayer + i) % this.players.length;
            if (this.players[idx].lives > 0) {
                return idx;
            }
        }
        if (this.players[this.currentPlayer].lives > 0) {
            return this.currentPlayer;
        }
        return -1;
    }

    activePlayerName() {
        return "PLAYER " + (this.currentPlayer + 1);
    }

    currentBackground() {
        if (!this.bgImages || this.bgImages.length === 0) {
            return null;
        }
        let wave = 0;
        if (this.players && this.players.length > 0 && this.players[this.currentPlayer]) {
            wave = this.players[this.currentPlayer].wavesCompleted || 0;
        }
        // If holding a wave completed message, stay on the wave that was just won
        if (this.mode === MODE_HOLD_SCREEN_MSG && wave > 0) {
            wave = wave - 1;
        }
        return this.bgImages[wave % this.bgImages.length];
    }

    startWaveTransition(prevBg, currBg, waveNumber) {
        this.prevBgImage = prevBg;
        this.currBgImage = currBg;
        this.transitionActive = true;
        this.transitionStartTime = millis();
        this.transitionDuration = 1400;

        // Rotate through 6 distinct dramatic transition effects:
        // Wave 1: 0 (Cosmic Iris)
        // Wave 2: 1 (Hyperspace Zoom)
        // Wave 3: 2 (Horizontal Laser Wipe)
        // Wave 4: 3 (Vertical Blast Gate)
        // Wave 5: 4 (Radar Chrono Sweep)
        // Wave 6: 5 (Supernova Flash)
        let idx = (waveNumber > 0) ? (waveNumber - 1) : 0;
        this.transitionType = idx % 6;

        if (this.sound) {
            this.sound.ensureContext();
            this.sound.hyperspaceWarp();
        }
    }

    renderBackground() {
        if (!this.bgImages || this.bgImages.length === 0) {
            return;
        }

        let currBg = this.currentBackground();

        if (!this.transitionActive || !this.currBgImage) {
            if (currBg) {
                image(currBg, 0, 0, width, height);
            }
            return;
        }

        let elapsed = millis() - this.transitionStartTime;
        let progress = constrain(elapsed / this.transitionDuration, 0, 1);
        let prevBg = this.prevBgImage;
        let targetBg = this.currBgImage;

        if (progress >= 1) {
            this.transitionActive = false;
            image(targetBg, 0, 0, width, height);
            return;
        }

        let easeInOutCubic = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        let easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
        let easeInOutQuad = (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

        switch (this.transitionType) {
            case 0: {
                // Cosmic Iris / Stargate Portal
                let t = easeInOutCubic(progress);
                let maxR = Math.hypot(width / 2, height / 2);
                let r = maxR * t;

                if (prevBg) { image(prevBg, 0, 0, width, height); }
                else { fill(0); rect(0, 0, width, height); }

                push();
                drawingContext.save();
                drawingContext.beginPath();
                drawingContext.arc(width / 2, height / 2, r, 0, Math.PI * 2);
                drawingContext.clip();
                image(targetBg, 0, 0, width, height);
                drawingContext.restore();

                noFill();
                stroke(80, 220, 255, (1 - progress) * 255);
                strokeWeight(4 * (1 - progress) + 1);
                circle(width / 2, height / 2, r * 2);
                pop();
                break;
            }
            case 1: {
                // Hyperspace Warp Zoom
                let t = easeOutCubic(progress);
                let scaleFactor = lerp(0.06, 1.0, t);
                let alpha = constrain(progress * 1.5, 0, 1) * 255;

                if (prevBg) { image(prevBg, 0, 0, width, height); }
                else { fill(0); rect(0, 0, width, height); }

                push();
                imageMode(CENTER);
                tint(255, alpha);
                image(targetBg, width / 2, height / 2, width * scaleFactor, height * scaleFactor);

                stroke(160, 210, 255, (1 - progress) * 190);
                strokeWeight(2);
                let numLines = 18;
                for (let i = 0; i < numLines; i++) {
                    let angle = (TWO_PI / numLines) * i + (progress * 0.4);
                    let r1 = 20 * progress;
                    let r2 = (Math.max(width, height) * 0.75) * progress;
                    line(width / 2 + Math.cos(angle) * r1, height / 2 + Math.sin(angle) * r1,
                         width / 2 + Math.cos(angle) * r2, height / 2 + Math.sin(angle) * r2);
                }
                pop();
                break;
            }
            case 2: {
                // Horizontal Laser Scan Wipe
                let t = easeInOutQuad(progress);
                let y = height * t;

                if (prevBg) { image(prevBg, 0, 0, width, height); }
                else { fill(0); rect(0, 0, width, height); }

                push();
                drawingContext.save();
                drawingContext.beginPath();
                drawingContext.rect(0, 0, width, y);
                drawingContext.clip();
                image(targetBg, 0, 0, width, height);
                drawingContext.restore();

                stroke(51, 255, 120, (1 - progress * 0.4) * 255);
                strokeWeight(3);
                line(0, y, width, y);

                stroke(200, 255, 220, (1 - progress) * 140);
                strokeWeight(7);
                line(0, y, width, y);
                pop();
                break;
            }
            case 3: {
                // Vertical Split / Blast Gate
                let t = easeInOutCubic(progress);
                let splitW = (width / 2) * t;

                if (prevBg) { image(prevBg, 0, 0, width, height); }
                else { fill(0); rect(0, 0, width, height); }

                push();
                drawingContext.save();
                drawingContext.beginPath();
                drawingContext.rect(width / 2 - splitW, 0, splitW * 2, height);
                drawingContext.clip();
                image(targetBg, 0, 0, width, height);
                drawingContext.restore();

                stroke(255, 140, 50, (1 - progress) * 255);
                strokeWeight(3);
                line(width / 2 - splitW, 0, width / 2 - splitW, height);
                line(width / 2 + splitW, 0, width / 2 + splitW, height);
                pop();
                break;
            }
            case 4: {
                // Radar / Chrono 360° Sweep
                let t = easeInOutQuad(progress);
                let angle = -HALF_PI + TWO_PI * t;

                if (prevBg) { image(prevBg, 0, 0, width, height); }
                else { fill(0); rect(0, 0, width, height); }

                push();
                drawingContext.save();
                drawingContext.beginPath();
                drawingContext.moveTo(width / 2, height / 2);
                drawingContext.arc(width / 2, height / 2, Math.hypot(width, height), -HALF_PI, angle);
                drawingContext.closePath();
                drawingContext.clip();
                image(targetBg, 0, 0, width, height);
                drawingContext.restore();

                let r = Math.hypot(width / 2, height / 2);
                stroke(0, 240, 255, (1 - progress * 0.3) * 255);
                strokeWeight(3);
                line(width / 2, height / 2, width / 2 + Math.cos(angle) * r, height / 2 + Math.sin(angle) * r);
                pop();
                break;
            }
            case 5: {
                // Supernova Solar Flare Flash
                if (progress < 0.35) {
                    let pIn = progress / 0.35;
                    if (prevBg) { image(prevBg, 0, 0, width, height); }
                    noStroke();
                    fill(255, 245, 220, pIn * 240);
                    rect(0, 0, width, height);
                } else {
                    let pOut = (progress - 0.35) / 0.65;
                    image(targetBg, 0, 0, width, height);
                    noStroke();
                    fill(255, 245, 220, (1 - pOut) * 240);
                    rect(0, 0, width, height);
                }
                break;
            }
            default: {
                image(targetBg, 0, 0, width, height);
                break;
            }
        }
    }

    startSplash() {
        this.mode = MODE_SPLASH;
        this.splashStartTime = millis();
        this.screen.clearAds();
    }

    finishSplash() {
        if (this.mode != MODE_SPLASH) {
            return;
        }
        this.mode = MODE_NOT_PLAYING;
        this.screen.clearAds();
        if (typeof updateArcadeConsoleUI === 'function') {
            updateArcadeConsoleUI();
        }
    }

    splashExpired() {
        return this.mode == MODE_SPLASH &&
            millis() - this.splashStartTime >= this.splashDuration;
    }

    setSpeed() {
        let n = this.invaders.activeInvaderCount();
        if (n == 1) {
            this.invaders.speed = 10;
        } else if (n < 7) {
            this.invaders.speed = 5;
        }
    }

    // call immediately after win detected for tasks that should be done
    // only once upon winning a game.
    winTasks() {
        this.players[this.currentPlayer].waveTop += 20; // next wave moves closer
        this.players[this.currentPlayer].bombDropOdds -= 500;
        if (this.players[this.currentPlayer].bombDropOdds < 500) {
            this.players[this.currentPlayer].bombDropOdds = 500;
        }
    }

    // same as winTasks only for losing the wave
    loseTasks() {

    }

    gameHasStopped() {
        let v = app.laserCannon.destroyed;
        v = v || app.invaders.destroyed;
        v = v || (app.players[app.currentPlayer].lives == 0);
        return v;
    }

    clearScreenForMessages() {
        let stat = app.gameStatus;
        if (stat > GAME_HOLD_FOR_MESSAGE) {
            stat -= GAME_HOLD_FOR_MESSAGE;
        }
        if (stat == GAME_PLAYER_DEFEATED_WAVE ||
            stat == GAME_PLAYER_LOST_WAVE ||
            stat == GAME_PLAYER_LOST) {
            return true;
        }
        return false;
    }

    stopGame() {
        this.invaders.mystery.cancel();  // cancel any mystery ship timeouts
    }

    messageUserThenContinue(nowState,thenState,nextPlayer) {
        if (this.msgTmr != null) {
            console.log("*** ERR:  msgTimer was not null in app.js");
            clearTimeout(this.msgTmr);
            this.msgTmr = null;
        }
        this.pendingPlayer = (typeof nextPlayer === 'undefined') ? null : nextPlayer;
        app.mode = nowState;
        this.msgTmr = setTimeout(() => {
            this.msgTmr = null;
            if (this.pendingPlayer != null) {
                this.currentPlayer = this.pendingPlayer;
                this.pendingPlayer = null;
            }
            app.mode = thenState;
            if (thenState === MODE_NEXT_WAVE) {
                this.continueCurrentPlayer();
            } else if (thenState === MODE_NOT_PLAYING) {
                this.gameOver = false;
                this.screen.clearAds();
                if (typeof updateArcadeConsoleUI === 'function') {
                    updateArcadeConsoleUI();
                }
            }
        }, 5000);
    }

    setWaveCompleted(status) {
        //-----------------------------
        // stop this wave....
        //-----------------------------
        app.invaders.mystery.cancel();
        let player = this.players[this.currentPlayer];
        if (player.score > this.highScore) {
            this.highScore = player.score;
        }

        //--------------------------------------
        // update based on status...
        //--------------------------------------
        switch (status) {
            case GAME_IN_PROGRESS:
                break;
            case GAME_PLAYER_DEFEATED_WAVE:
                this.resumeSameWave = false;
                player.invaders = null;
                player.wavesCompleted++;
                if (typeof updateArcadeConsoleUI === 'function') {
                    updateArcadeConsoleUI();
                }
                app.gameStatus = GAME_HOLD_FOR_MESSAGE + GAME_PLAYER_DEFEATED_WAVE;
                this.messageUserThenContinue(MODE_HOLD_SCREEN_MSG,MODE_NEXT_WAVE);
                break;
            case GAME_PLAYER_LOST_WAVE:
                app.gameStatus = GAME_HOLD_FOR_MESSAGE + GAME_PLAYER_LOST_WAVE;
                player.lives--;
                if (player.lives > 0) {
                    player.invaders = this.invaders;  // resume same wave when this player returns
                } else {
                    player.invaders = null;
                }

                let nextPlayer = this.nextTurnPlayer();
                if (nextPlayer >= 0) {
                    this.resumeSameWave = true;
                    this.messageUserThenContinue(MODE_HOLD_SCREEN_MSG,MODE_NEXT_WAVE,nextPlayer);
                } else {
                    this.gameOver = true;
                    this.messageUserThenContinue(MODE_HOLD_SCREEN_MSG,MODE_NOT_PLAYING);
                }
                break;
            case GAME_PLAYER_LOST:
                this.gameOver = true;
                this.messageUserThenContinue(MODE_HOLD_SCREEN_MSG,MODE_NOT_PLAYING);
                break;
            case GAME_PLAYER_WON:
                console.log("what do we do now?  I don't know what it means to win!");
                break;
            case GAME_HOLD_FOR_MESSAGE:
                break;
            default:
                console.log("unknown wave status: " + status);
        }
    }
}
