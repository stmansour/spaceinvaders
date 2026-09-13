/*jshint esversion: 6 */
class Invaders {
    constructor(t_testMode,testdata) {
        this.squadrons = [];        // in the airforce, a "squadrons" is a group of squadrons
        this.shipsPerSquadron = 11; // the number of ships for each squadrons
        this.speed = 1;             // number of pixels to move left or right.
        this.sqIdx = 0;             // index squadrons being shown
        this.invIdx = 0;            // index of invader within the squadrons being shown
        this.dy = 20;               // how much we move down each drop
        this.moveVertical = false;  // set to true at the edges when we need to lower the squadrons and change direction
        this.introduced = false;    // a OneShot... true after all ships have been shown once.
        this.mystery = null;        // shows up at random every 15 - 30 sec, value 100 - 500 points
        this.testMode = (typeof t_testMode === 'undefined') ? false : t_testMode;
        this.testdata = (typeof testdata === 'undefined') ? null : testdata;
    }

    squadbuilder(ims, y, pts) {
        let ships = this.shipsPerSquadron;
        if (this.testMode) {
            ships = this.testdata.numShipsPerSquad;
        }
        let squadron = new Squadron(ims, y, ships, pts);
        // squadron.init(); // normal call
        squadron.init(); // for debugging
        this.squadrons.push(squadron);
    }

    init() {
        let y1 = 40;
        // let y = 260;    // game over fast
        let y = app.players[app.currentPlayer].waveTop;
        this.squadbuilder([app.b1, app.b2], y + 4 * y1, 10);
        this.squadbuilder([app.b1, app.b2], y + 3 * y1, 10);
        this.squadbuilder([app.a1, app.a2], y + 2 * y1, 20);
        this.squadbuilder([app.a1, app.a2], y + y1, 20);
        this.squadbuilder([app.c1, app.c2], y, 30);
        this.mystery = new MysteryShip();
    }

    activeInvaderCount() {
        let n = 0;
        for (let i = 0; i < this.squadrons.length; i++) {
            n += this.squadrons[i].activeShips;
        }
        return n;
    }

    nextInvader() {
        this.invIdx += 1;
        if (this.invIdx >= this.squadrons[this.sqIdx].ships.length) {
            this.invIdx = 0;
            this.sqIdx += 1;
            if (this.sqIdx >= this.squadrons.length) {
                this.sqIdx = 0;
            }
        }
    };

    show() {
        if (app.gameHasStopped() || app.mode == MODE_HOLD_SCREEN_MSG) {
            if (app.clearScreenForMessages()) {
                return;
            }
            this.showInvaders();
            return;
        }

        if (this.checkDestroyed()) {
            return;
        }

        let invaderMoved = false;
        let passComplete = false; // will be true if nextInvader points back to the first squadrons, first invader

        if (!this.introduced) {
            // just turn them on one-by-one...
            this.squadrons[this.sqIdx].ships[this.invIdx].introduced = true;
            this.nextInvader();
            invaderMoved = true;
            passComplete = (this.sqIdx == 0 && this.invIdx == 0);
        } else {
            //---------------------------------------------------------------------
            // to simulate the movement in the original game:
            //      * move one invader per frame
            //      * after moving all invaders (passComplete = true) have
            //        squadrons adjust their guidance
            //      * check to see if all the invaders need to drop down one row
            //        and move them down if needed.
            //---------------------------------------------------------------------
            do {
                let squadrons = this.squadrons[this.sqIdx];
                let ship = squadrons.ships[this.invIdx];
                if (!ship.killed) {
                    if (this.moveVertical) {
                        ship.relativeMove(0, this.dy);
                    } else {
                        if (!this.testMode || (this.testMode && !this.testdata.dontMoveInvaders) ) {
                            ship.relativeMove(squadrons.direction * this.speed, 0);
                        }
                    }
                    this.checkCollisions();
                    invaderMoved = true;
                }
                this.nextInvader();
                passComplete = (this.sqIdx == 0 && this.invIdx == 0);
            } while (!invaderMoved && !passComplete);
        }

        this.showInvaders();

        //-------------------------------------------------------------------
        // If the invaders just completed introducing themselves onto the
        // screen then mark that the introduction is complete
        //-------------------------------------------------------------------
        if (passComplete && !this.introduced) {
            this.introduced = true;
            this.mystery.go();
        } else if (this.introduced && !this.mystery.moving && this.mystery.timer == null && !app.gameHasStopped() && app.mode != MODE_HOLD_SCREEN_MSG) {
            this.mystery.go();
        }

        if (passComplete && this.introduced) {
            for (let i = 0; i < this.squadrons.length; i++) {
                this.squadrons[i].reassessStatus();
            }
            if (this.moveVertical) {
                this.moveVertical = false;
                for (let i = 0; i < this.squadrons.length; i++) {
                    this.squadrons[i].direction = -this.squadrons[i].direction;
                    this.squadrons[i].directionChangeNeeded = false;
                }
            } else {
                this.moveVertical = this.squadrons.some(sq => !sq.destroyed && sq.directionChangeNeeded);
            }
        }
    }

    showInvaders() {
        for (var i = 0; i < this.squadrons.length; i++) {
            let squadron = this.squadrons[i];
            squadron.show();
        }
        this.mystery.show();
    }

    scanForHits() {
        if (app.gameHasStopped()) {
            return true;
        }
        for (var i = 0; i < this.squadrons.length; i++) {
            let squadron = this.squadrons[i];
            if (squadron.scanForHits()) {
                return true; // no need to search further
            }
        }
        return false;
    }

    checkCollisions() {
        //-----------------------------------------------
        // did any invader hit the laserCannon?
        //-----------------------------------------------
        for (let i = 0; i < this.squadrons.length && !app.gameHasStopped(); i++) {
            let squadron = this.squadrons[i];
            if (squadron.destroyed) {
                continue;
            }
            for (var j = 0; j < squadron.ships.length && !app.gameHasStopped(); j++) {
                if (squadron.ships[j].overlaps(app.laserCannon)) {
                    app.setWaveCompleted(GAME_PLAYER_LOST_WAVE); // player lost wave
                    app.loseTasks();
                    return;
                }
            }
        }
    }

    checkDestroyed() {
        for (let i = 0; i < this.squadrons.length; i++) {
            if (!this.squadrons[i].destroyed) {
                return false;
            }
        }
        app.setWaveCompleted(GAME_PLAYER_DEFEATED_WAVE); // player defeated the wave!
        app.winTasks();
        return true;
    }
}
