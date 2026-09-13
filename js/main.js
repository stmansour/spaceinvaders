/*jshint esversion: 6 */

let app = null;
let gameCanvas = null;

const GAME_WIDTH = 640;
const GAME_HEIGHT = 540;
const BONUS_LIFE_SCORE = 4000; // Points needed to earn an extra bonus life (change for testing)

function preload() {
    app = new SpaceInvadersApp();
    window.app = app;
    app.loadImages();
}

function setup() {
    window.app = app;
    gameCanvas = createCanvas(GAME_WIDTH, GAME_HEIGHT);
    gameCanvas.parent("theCanvas");
    gameCanvas.elt.style.imageRendering = "pixelated";
    gameCanvas.elt.style.imageRendering = "crisp-edges";
    fitCanvasToWindow();
    app.loadAllPixels();
    app.setMaxShipWidth();
    textFont(app.font);
    app.screen.init();
    app.startSplash();
    if (typeof updateArcadeConsoleUI === 'function') {
        updateArcadeConsoleUI();
    }
}

function fitCanvasToWindow() {
    if (!gameCanvas) {
        return;
    }

    let sidePanel = document.querySelector('.arcade-side-panel');
    let topNav = document.querySelector('.top-nav');
    let topNavHeight = topNav ? topNav.offsetHeight : 26;

    let availableWidth = windowWidth - 48;
    let availableHeight = windowHeight - topNavHeight - 24;

    const PANEL_ASPECT = 462 / 1348; // width / height of cabinet_side_art.jpg
    const CANVAS_ASPECT = GAME_WIDTH / GAME_HEIGHT; // 640 / 540 = 1.185185
    const GAP = 24;

    let totalAspect = CANVAS_ASPECT + PANEL_ASPECT;

    let maxH_by_width = (availableWidth - GAP) / totalAspect;
    let maxH_by_height = availableHeight;

    let targetHeight = Math.max(260, Math.min(maxH_by_width, maxH_by_height));
    let targetCanvasWidth = Math.round(targetHeight * CANVAS_ASPECT);
    let targetPanelWidth = Math.round(targetHeight * PANEL_ASPECT);

    // Apply synchronized scale to game canvas
    gameCanvas.elt.style.width = targetCanvasWidth + "px";
    gameCanvas.elt.style.height = Math.round(targetHeight) + "px";

    // Apply synchronized scale to left arcade side panel
    if (sidePanel) {
        sidePanel.style.height = Math.round(targetHeight) + "px";
        sidePanel.style.width = targetPanelWidth + "px";
        let panelScale = targetHeight / 540;
        sidePanel.style.setProperty('--panel-scale', panelScale);
    }
}

function windowResized() {
    fitCanvasToWindow();
}

function draw() {
    background(0);

    if (app.splashExpired()) {
        app.finishSplash();
    }

    switch (app.mode) {
        case MODE_SPLASH:
            break;
        case MODE_NOT_PLAYING:
            app.screen.showSelectPlayers();
            break;
        case MODE_NEW_GAME_1_PLAYER:
        case MODE_NEW_GAME_2_PLAYERS:
        case MODE_HOLD_SCREEN_MSG:
        case MODE_NEXT_WAVE:
            app.renderBackground();
            app.setSpeed();
            if (app.sound && app.invaders.introduced && !app.gameHasStopped()) {
                app.sound.updateInvaderMarch(
                    app.invaders.activeInvaderCount(),
                    app.invaders.shipsPerSquadron * app.invaders.squadrons.length
                );
            }
            if (app.bunkers) { app.bunkers.show(); }
            app.shots.show();
            app.shots.scanForHits();
            app.invaders.show();
            app.invaders.scanForHits();
            if (app.invaders.introduced) {
                app.laserCannon.go(); // move before show
                app.laserCannon.show();
            }
            break;
        default:
            console.log("unknown mode: " + app.mode);
            break;
    }

    app.screen.show();
}

function keyPressed() {
    if (app.mode == MODE_SPLASH) {
        app.finishSplash();
        return false;
    }

    let k = (typeof key === 'string') ? key.toLowerCase() : '';

    if (app.mode == MODE_NOT_PLAYING) {
        if (k === '1') {
            onePlayer();
            return false;
        } else if (k === '2') {
            twoPlayers();
            return false;
        } else if (k === 'c') {
            coinInserted();
            return false;
        }
    }

    if (!app.laserCannon) {
        return;
    }

    // Left: Left Arrow, ',' (188), 'j' / 'J' (74)
    if (keyCode === LEFT_ARROW || keyCode === 188 || keyCode === 74 || k === 'j') {
        app.laserCannon.goLeft(true);
        return false;
    }

    // Right: Right Arrow, '.' (190), 'k' / 'K' (75)
    if (keyCode === RIGHT_ARROW || keyCode === 190 || keyCode === 75 || k === 'k') {
        app.laserCannon.goRight(true);
        return false;
    }

    // Shoot: Spacebar (32)
    if (keyCode === 32 || k === ' ') {
        if (document.activeElement && document.activeElement.blur) {
            document.activeElement.blur();
        }
        app.shots.fire();
        return false;
    }
}

function keyReleased() {
    if (!app.laserCannon) {
        return;
    }

    let k = (typeof key === 'string') ? key.toLowerCase() : '';

    // Left: Left Arrow, ',' (188), 'j' / 'J' (74)
    if (keyCode === LEFT_ARROW || keyCode === 188 || keyCode === 74 || k === 'j') {
        app.laserCannon.goLeft(false);
        return false;
    }

    // Right: Right Arrow, '.' (190), 'k' / 'K' (75)
    if (keyCode === RIGHT_ARROW || keyCode === 190 || keyCode === 75 || k === 'k') {
        app.laserCannon.goRight(false);
        return false;
    }
}

function mousePressed() {
    if (app.mode == MODE_SPLASH) {
        app.finishSplash();
    }
}
