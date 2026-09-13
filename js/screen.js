// This module contains all the functions to update the status of the screen
// area.  It does not play the game, but it indicates the score, tells the
// user how many lives they have, shows the number of credits, etc.
//
// campaigns contain ads, ads contain revealiers
//============================================================================
/*jshint esversion: 6 */

class SIScreen {
    constructor() {
        this.campaigns = [];
        this.adsIdx = 0;
        this.campaignsIdx = 0;
        this.adsInProgress = false;
        this.insertCoinsShow = false; // don't turn it on until the user trys to play without adding credits
        this.tmr = null;  // we'll leave the last message of an ad campaign up for a few seconds before moving to the next campaign
        this.statusMsg = "";
    }

    init() {
        let bonusPts = (typeof BONUS_LIFE_SCORE !== 'undefined') ? BONUS_LIFE_SCORE : 5000;
        let ads1 = [
            [   null, " PLAY SPACE INVADERS"],
            [   null, "*SCORE ADVANCE TABLE*"],
            [  app.d, "= ? MYSTERY"],
            [ app.c1, "= 30 POINTS"],
            [ app.a1, "= 20 POINTS"],
            [ app.b1, "= 10 POINTS"],
            [   null, `EXTRA LIFE AT ${bonusPts} POINTS`],
        ];
        let ads2 = [
            [   null, "INSERT COIN"],
            [   null, "<1 OR 2 PLAYERS>"],
            [   null, "*1 PLAYER  1 COIN"],
            [   null, "*2 PLAYERS 2 COINS"],
        ];
        let campaigns = [ ads1, ads2 ];

        let dy = 40;
        let x = 225;
        let dx = 25;
        for (let i = 0; i < campaigns.length; i++) {
            let ads = campaigns[i];
            let a = [];
            for (let j = 0; j < ads.length; j++) {
                let myx = x;
                if (ads[j][0] != null) {
                    myx += dx;
                }
                a.push(new Revealer( ads[j][0], ads[j][1], myx, 200 + j * dy, dy, 100, nextAdCB ));
            }
            this.campaigns.push(a);
        }
    }

    goAds() {
        if (this.adsInProgress || this.tmr != null) {
            return;
        }
        this.adsInProgress = true;
        this.nextAd();
    }

    nextAd() {
        if (this.adsIdx < this.campaigns[this.campaignsIdx].length) {
            this.campaigns[this.campaignsIdx][this.adsIdx].go();
        } else {
            //------------------------------------------------------
            // wait some time before switching to the next campaign
            //------------------------------------------------------
            this.tmr = setInterval(() => {
                this.clearAds();
                this.adsIdx = 0;
                this.campaignsIdx++;
                if (this.campaignsIdx >= this.campaigns.length) {
                    this.campaignsIdx = 0;
                }
                this.adsInProgress = false;
            }, 2000); // wait 2 secs
        }
    }

    clearAds() {
        let bonusPts = (typeof BONUS_LIFE_SCORE !== 'undefined') ? BONUS_LIFE_SCORE : 5000;
        if (this.campaigns && this.campaigns[0] && this.campaigns[0][6]) {
            let rev = this.campaigns[0][6];
            let newStr = `EXTRA LIFE AT ${bonusPts} POINTS`;
            if (rev.s !== newStr) {
                rev.s = newStr;
            }
        }
        for (let i = 0; i < this.campaigns.length; i++) {
            let ads = this.campaigns[i];
            for (let j = 0; j < ads.length; j++) {
                ads[j].reset();
            }
        }
        this.adsIdx = 0;
        this.adsInProgress = false;
        if (this.tmr != null) {
            clearInterval(this.tmr);
            this.tmr = null;
        }
    }

    showAds() {
        this.goAds(); // checks to see if it's already running
        for (let i = 0; i < this.campaigns[this.campaignsIdx].length; i++) {
            this.campaigns[this.campaignsIdx][i].show();
        }
    }

    show() {
        if (app.mode == MODE_SPLASH) {
            this.showSplash();
            return;
        }

        this.scores();
        this.bottomLine();
        switch (app.mode) {
            case MODE_NOT_PLAYING:
                this.insertCoins();
                this.showAds();
                app.screen.showSelectPlayers();
                break;
            case MODE_NEW_GAME_1_PLAYER:
            case MODE_NEW_GAME_2_PLAYERS:
            case MODE_HOLD_SCREEN_MSG:
            case MODE_NEXT_WAVE:
                this.lives();
                break;
        }

        let stat = app.gameStatus;
        if (stat > GAME_HOLD_FOR_MESSAGE) {
            stat -= GAME_HOLD_FOR_MESSAGE;
        }
        let s="";
        switch (stat) {
            case GAME_IN_PROGRESS:
                break;
            case GAME_PLAYER_DEFEATED_WAVE:
                this.statusMsg = "";
                let n = app.players[app.currentPlayer].wavesCompleted;
                s = app.activePlayerName() + " WAVES DEFEATED: " + n;
                fill(80, 255, 80);
                text(s, (width - textWidth(s)) / 2, 135);
                s = "WELL DONE";
                text(s, (width - textWidth(s)) / 2, 158);
                this.gameOver = true;
                break;
            case GAME_PLAYER_LOST_WAVE:
                this.statusMsg = "";
                if (app.players[app.currentPlayer].lives > 0) {
                    s = app.activePlayerName() + " LOST A LIFE";
                } else {
                    s = app.activePlayerName() + " GAME OVER";
                }
                fill(255, 80, 80);
                text(s, (width - textWidth(s)) / 2, 135);
                if (app.pendingPlayer != null && app.pendingPlayer != app.currentPlayer) {
                    s = "PLAYER " + (app.pendingPlayer + 1) + " GET READY";
                } else {
                    s = "LIVES REMAINING: " + app.players[app.currentPlayer].lives;
                }
                text(s, (width - textWidth(s)) / 2, 158);
                this.gameOver = true;
                break;
            case GAME_PLAYER_LOST:
                this.statusMsg = "";
                s = "YOU HAVE NO MORE LIVES";
                fill(255, 80, 80);
                text(s, (width - textWidth(s)) / 2, 135);
                this.gameOver = true;
                break;
            case GAME_PLAYER_WON:
                console.log("what do we do now?  I don't know what it means to win!");
                break;
            case GAME_HOLD_FOR_MESSAGE:
                fill(255, 80, 80);
                text(this.statusMsg, (width - textWidth(this.statusMsg)) / 2, 80);
                break;
            default:
                console.log("unknown wave status: " + status);
                break;
        }

        if (app.gameOver) {
            this.showGameOver();
        }
    }

    scores() {
        this.score1();
        this.score2();
        this.hiScore();
        this.showCredits();
    }

    showSelectPlayers() {
        noStroke();
        let s = "SELECT 1 OR 2 PLAYERS";
        textSize(app.cSize);
        fill(255, 80, 80);
        text(s, (width - textWidth(s)) / 2, 100);
    }

    showSplash() {
        if (!app.splashLogo) {
            return;
        }

        let bounds = this.splashImageBounds(app.splashLogo);
        let elapsed = millis() - app.splashStartTime;
        let progress = constrain(elapsed / app.splashRevealDuration, 0, 1);
        let reveal = 1 - Math.pow(1 - progress, 3);

        push();
        imageMode(CORNER);
        drawingContext.save();
        this.clipSplashFromCenter(bounds, reveal);
        image(app.splashLogo, bounds.x, bounds.y, bounds.w, bounds.h);
        drawingContext.restore();
        pop();
    }

    splashImageBounds(img) {
        let scale = min(width / img.width, height / img.height);
        let w = img.width * scale;
        let h = img.height * scale;
        return {
            x: (width - w) / 2,
            y: (height - h) / 2,
            w: w,
            h: h,
        };
    }

    clipSplashFromCenter(bounds, amount) {
        let revealWidth = bounds.w * amount;
        let revealHeight = bounds.h * amount;
        let x = bounds.x + (bounds.w - revealWidth) / 2;
        let y = bounds.y + (bounds.h - revealHeight) / 2;

        drawingContext.beginPath();
        drawingContext.rect(x, y, revealWidth, revealHeight);
        drawingContext.clip();
    }

    showGameOver() {
        noStroke();
        let s = "GAME OVER";
        textSize(app.cSize);
        fill(255, 80, 80);
        text(s, (width - textWidth(s)) / 2, 150);

        // --------------------------------------------------------------------------
        // we need to leave the screen as it is for a few seconds so the user can
        // see the results of this game...
        // --------------------------------------------------------------------------
        if (app.gameOverTimer != null) {
            return; // if we've already set the timeout, return now so we don't set it again
        } else {
            app.mode = 3;
            // user should see the screen for 5 secs before we move on.
            app.gameOverTimer = setTimeout(() => {
                app.mode = 0;
                app.gameOverTimer = null;
                app.gameOver = false;
                app.screen.clearAds();
            }, 5000);
        }
    }

    score1() {
        let player = null;
        let name = "SCORE<1>";
        let score = 0;
        if (app.players.length > 0) {
            player = app.players[0];
            name = "SCORE" + player.name;
            score = player.score;
        }
        noStroke();
        textSize(app.cSize);
        fill(255);
        text(name, 145, 25);
        let s = zeroFillNumber(score, 4);
        text(s, 145, app.topBar);

        let isGameOver = (app.mode === MODE_NOT_PLAYING || app.gameOver);
        if (player && isGameOver) {
            let lvl = (player.wavesCompleted || 0) + 1;
            let lvlStr = "LEVEL " + zeroFillNumber(lvl, 2);
            fill(80, 255, 80);
            text(lvlStr, 145, app.topBar + 20);
        }
    }

    score2() {
        if (app.players.length == 1) {
            return;
        }
        let name = "SCORE<2>";
        let score = 0;
        let player = null;
        if (app.players.length > 1) {
            player = app.players[1];
            name = "SCORE" + player.name;
            score = player.score;
        }
        noStroke();
        textSize(app.cSize);
        fill(255);
        text(name, width - textWidth(name) - 145, 25);
        let s = zeroFillNumber(score, 4);
        text(s, width - textWidth(s) - 145, app.topBar);

        let isGameOver = (app.mode === MODE_NOT_PLAYING || app.gameOver);
        if (player && isGameOver) {
            let lvl = (player.wavesCompleted || 0) + 1;
            let lvlStr = "LEVEL " + zeroFillNumber(lvl, 2);
            fill(80, 255, 80);
            text(lvlStr, width - textWidth(lvlStr) - 145, app.topBar + 20);
        }
    }

    hiScore() {
        var s = "HI-SCORE";
        noStroke();
        textSize(app.cSize);
        fill(255);
        text(s, (width - textWidth(s)) / 2, 25);
        s = zeroFillNumber(app.highScore, 4);
        text(s, (width - textWidth(s)) / 2, app.topBar);
    }

    showCredits() {
        let s = "CREDITS " + zeroFillNumber(app.credits, 2);
        text(s, (width - textWidth(s) - 25), height - 15);
        if (typeof updateArcadeConsoleUI === 'function') {
            updateArcadeConsoleUI();
        }
    }

    lives() {
        noStroke();
        textSize(app.cSize);
        fill(97, 201, 59);
        let player = app.players[app.currentPlayer];
        if (app.players.length > 1) {
            let playerName = app.activePlayerName();
            text(playerName, (width - textWidth(playerName)) / 2, height - 35);
        }

        // Check if player earned an extra bonus life within the last 8 seconds
        let bonusActive = player.bonusLifeTime > 0 && (millis() - player.bonusLifeTime < 8000);
        let bonusElapsed = bonusActive ? (millis() - player.bonusLifeTime) : 0;
        let bonusPulse = bonusActive ? (0.5 + 0.5 * Math.sin(bonusElapsed * 0.007)) : 0;
        let bonusFade = 1.0;
        if (bonusActive) {
            if (bonusElapsed < 300) {
                bonusFade = bonusElapsed / 300;
            } else if (bonusElapsed > 6500) {
                bonusFade = (8000 - bonusElapsed) / 1500;
            }
        }
        let glowIntensity = bonusPulse * bonusFade;

        let y = height - 5;
        let livesRemaining = '' + player.lives;
        if (bonusActive) {
            push();
            drawingContext.save();
            drawingContext.shadowColor = '#00ff66';
            drawingContext.shadowBlur = 10 * glowIntensity;
            fill(120 + 135 * bonusPulse, 255, 120 + 100 * bonusPulse);
            text('' + livesRemaining, 20, y);
            drawingContext.restore();
            pop();
        } else {
            text('' + livesRemaining, 20, y);
        }

        let x = 50;
        y = height - app.cannon.height - 5;
        for (let i = 0; i < livesRemaining - 1; i++) {
            // If this cannon is the newly awarded extra life, draw the throbbing background glow
            if (bonusActive && i === player.bonusLifeSlot) {
                push();
                drawingContext.save();
                let cx = x + app.cannon.width / 2;
                let cy = y + app.cannon.height / 2;
                let glowRadius = (app.cannon.width / 2 + 10) + bonusPulse * 8;

                // 1. Radial ambient background glow
                let grad = drawingContext.createRadialGradient(cx, cy, 2, cx, cy, glowRadius);
                grad.addColorStop(0, `rgba(120, 255, 120, ${0.90 * glowIntensity})`);
                grad.addColorStop(0.35, `rgba(60, 240, 90, ${0.60 * glowIntensity})`);
                grad.addColorStop(0.70, `rgba(20, 180, 50, ${0.25 * glowIntensity})`);
                grad.addColorStop(1, 'rgba(0, 255, 0, 0)');

                drawingContext.fillStyle = grad;
                drawingContext.beginPath();
                drawingContext.arc(cx, cy, glowRadius, 0, Math.PI * 2);
                drawingContext.fill();

                // 2. Pulsing neon rounded background aura pill behind the ship
                let pad = 3 + bonusPulse * 3;
                let rx = x - pad;
                let ry = y - pad;
                let rw = app.cannon.width + pad * 2;
                let rh = app.cannon.height + pad * 2;

                drawingContext.fillStyle = `rgba(30, 140, 50, ${0.45 * glowIntensity})`;
                drawingContext.strokeStyle = `rgba(160, 255, 160, ${0.85 * glowIntensity})`;
                drawingContext.lineWidth = 1.5;
                drawingContext.shadowColor = '#00ff66';
                drawingContext.shadowBlur = 12 * glowIntensity;

                drawingContext.beginPath();
                if (typeof drawingContext.roundRect === 'function') {
                    drawingContext.roundRect(rx, ry, rw, rh, 4);
                } else {
                    drawingContext.rect(rx, ry, rw, rh);
                }
                drawingContext.fill();
                drawingContext.stroke();

                drawingContext.restore();
                pop();
            }

            image(app.cannon, x, y);
            x += app.cannon.width + 5;
        }
    }

    // showWavesCompleted() {
    //     noStroke();
    //     textSize(app.cSize);
    //     fill(97, 201, 59);
    //     let player = app.players[app.currentPlayer];
    //     s = "WAVES COMPLETED: " + player.wavesCompleted;
    //     text(s,(width - textWidth(s))/2,75);
    // }

    insertCoins() {
        if (!this.insertCoinsShow) {
            return;
        }
        var s = "INSERT COINS TO GET CREDITS";
        noStroke();
        textSize(app.cSize);
        fill(255);
        text(s, 100, height - 15);
    }

    bottomLine() {
        stroke(97, 201, 59);
        strokeWeight(2);
        let y = app.bottomLineHeight;
        line(0, y, width, y);
    }
}

function nextAdCB() {
    app.screen.adsIdx++;
    app.screen.nextAd();
}
