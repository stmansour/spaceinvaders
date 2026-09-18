// This module contains all the functions that a user would find on the
// Space Invaders arcade console
//========================================================================
/*jshint esversion: 6 */

function updateArcadeConsoleUI() {
    let btn1 = document.getElementById('btn-1p');
    let btn2 = document.getElementById('btn-2p');
    let btnCoin = document.getElementById('btn-coin');
    let levelDisplay = document.getElementById('arcade-level-count');
    let creditDisplay = document.getElementById('arcade-credit-count');
    let tickerElem = document.getElementById('arcade-ticker');
    let levelStaticElem = document.getElementById('arcade-level-static');

    let credits = (typeof app !== 'undefined' && app && typeof app.credits === 'number') ? app.credits : 0;
    if (creditDisplay) {
        creditDisplay.textContent = (credits < 10 ? '0' : '') + credits;
    }

    let isPlaying = (typeof app !== 'undefined' && app && app.mode > MODE_NOT_PLAYING && !app.gameOver);

    if (isPlaying) {
        if (tickerElem) { tickerElem.style.display = 'none'; }
        if (levelStaticElem) { levelStaticElem.style.display = 'inline-block'; }

        // 1-based Level tracking based on waves cleared
        let level = 1;
        if (app.players && app.players.length > 0 && app.players[app.currentPlayer]) {
            let waves = app.players[app.currentPlayer].wavesCompleted || 0;
            level = waves + 1;
        }
        if (levelDisplay) {
            levelDisplay.textContent = (level < 10 ? '0' : '') + level;
        }
    } else {
        // Attract / Not playing mode: show the teaser ticker tape
        if (tickerElem) { tickerElem.style.display = 'block'; }
        if (levelStaticElem) { levelStaticElem.style.display = 'none'; }
        if (typeof app !== 'undefined' && app && typeof app.getStartingLevel === 'function') {
            let startLvl = app.getStartingLevel();
            let tickerText = document.querySelector('.arcade-ticker-text');
            if (tickerText) {
                if (app.scoresResetViaUrl && startLvl > 1) {
                    let lvlStr = (startLvl < 10 ? '0' : '') + startLvl;
                    tickerText.textContent = '★ HIGH SCORES RESET ★ STARTING AT LEVEL ' + lvlStr + ' ★ INSERT COIN TO PLAY ★';
                } else if (app.scoresResetViaUrl) {
                    tickerText.textContent = '★ HIGH SCORES RESET (DEBUG) ★ INSERT COIN TO PLAY ★';
                } else if (startLvl > 1) {
                    let lvlStr = (startLvl < 10 ? '0' : '') + startLvl;
                    tickerText.textContent = '★ DEBUG OVERRIDE: STARTING AT LEVEL ' + lvlStr + ' ★ INSERT COIN TO PLAY ★';
                }
            }
        }
    }

    // When 0 credits, pulse/throb the red glow on the 25¢ coin button
    if (btnCoin) {
        if (credits === 0) {
            btnCoin.classList.add('throb');
        } else {
            btnCoin.classList.remove('throb');
        }
    }

    if (btn1) {
        if (credits >= 1) {
            btn1.classList.add('ready');
        } else {
            btn1.classList.remove('ready');
        }
    }

    if (btn2) {
        if (credits >= 2) {
            btn2.classList.add('ready');
        } else {
            btn2.classList.remove('ready');
        }
    }

    // Sync high score record in Arcade Guide drawer if available
    let drawerHiScore = document.getElementById('drawer-hi-score');
    let drawerHiLevel = document.getElementById('drawer-hi-level');
    if (drawerHiScore && typeof app !== 'undefined' && app) {
        let hi = (typeof app.highScore !== 'undefined') ? app.highScore : ((typeof app.hiScore !== 'undefined') ? app.hiScore : 0);
        let scoreStr = '' + hi;
        while (scoreStr.length < 5) {
            scoreStr = '0' + scoreStr;
        }
        drawerHiScore.textContent = scoreStr;
    }
    if (drawerHiLevel && typeof app !== 'undefined' && app) {
        let lvl = (typeof app.highScoreLevel !== 'undefined') ? app.highScoreLevel : ((typeof app.hiScoreLevel !== 'undefined') ? app.hiScoreLevel : 1);
        drawerHiLevel.textContent = 'LEVEL ' + (lvl < 10 ? '0' : '') + lvl;
    }
}

function onePlayer() {
    if (document.activeElement && document.activeElement.blur) {
        document.activeElement.blur();
    }
    if (app.sound) {
        app.sound.ensureContext();
        app.sound.buttonClick();
    }
    if (app.gameOverTimer != null) {
        return; // don't do anything to change the final screen until the timer completes
    }
    if (app.mode !== MODE_NOT_PLAYING) {
        return; // Game already in progress, ignore start button
    }
    if (app.credits < 1) {
        app.screen.insertCoinsShow = true;
        app.screen.insertCoins();
        return;
    }
    app.credits -= 1;
    updateArcadeConsoleUI();
    app.mode = MODE_NEW_GAME_1_PLAYER;
    app.players = [];
    let startLvl = (app && typeof app.getStartingLevel === 'function') ? app.getStartingLevel() : 1;
    let p = new Player(1, 1);
    p.newGame(startLvl);
    app.players.push(p);
    app.newGame();
    app.mode = MODE_NEW_GAME_1_PLAYER;
}

function twoPlayers() {
    if (document.activeElement && document.activeElement.blur) {
        document.activeElement.blur();
    }
    if (app.sound) {
        app.sound.ensureContext();
        app.sound.buttonClick();
    }
    if (app.gameOverTimer != null) {
        return; // don't do anything to change the final screen until the timer completes
    }
    if (app.mode !== MODE_NOT_PLAYING) {
        return; // Game already in progress, ignore start button
    }
    if (app.credits < 2) {
        app.screen.insertCoinsShow = true;
        app.screen.insertCoins();
        return;
    }
    app.credits -= 2;
    updateArcadeConsoleUI();
    app.mode = MODE_NEW_GAME_2_PLAYERS;
    app.players = [];
    let startLvl = (app && typeof app.getStartingLevel === 'function') ? app.getStartingLevel() : 1;
    let p1 = new Player(1, 1);
    let p2 = new Player(1, 2);
    p1.newGame(startLvl);
    p2.newGame(startLvl);
    app.players.push(p1);
    app.players.push(p2);
    app.newGame();
}

function coinInserted() {
    if (document.activeElement && document.activeElement.blur) {
        document.activeElement.blur();
    }
    if (app.sound) {
        app.sound.ensureContext();
        app.sound.coinDrop();
    }
    app.credits++;
    updateArcadeConsoleUI();
    app.screen.showCredits();
}

// Ensure UI is initialized once page is loaded
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        updateArcadeConsoleUI();
    });
}
