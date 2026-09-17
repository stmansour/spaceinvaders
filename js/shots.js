/*jshint esversion: 6 */

class Shots {
    constructor () {
        this.shots = [];
        this.explosions = [];  // added when there's a hit
    }

    fire() {
        let shot = new Shot(app.laserCannon.x,app.laserCannon.y);
        this.shots.push(shot);
        if (app.sound) { app.sound.shoot(); }
    }

    show() {
        if (app.gameHasStopped()) {
            return;
        }
        for (let i = this.shots.length - 1; i >= 0; i--) {
            this.shots[i].show();
            if (!app.isPaused) {
                this.shots[i].move();
                if (this.shots[i].expired) {
                    this.shots.splice(i, 1);
                }
            }
        }
        for (let i = 0; i < this.explosions.length; i++) {
            this.explosions[i].show();
        }
    }

    scanForHits() {
        for (let i = this.shots.length - 1; i >= 0; i--) {
            let shot = this.shots[i];
            let x1 = shot.x;
            let y1 = shot.y;
            let x2 = x1 + 2;
            let y2 = y1 + 10;

            if (app.bunkers && app.bunkers.chipAt(x1, y1, x2, y2)) {
                this.shots.splice(i, 1);
                if (app.sound) { app.sound.bunkerHit(); }
                continue;
            }

            if (app.invaders.mystery.hit(x1,y1,x2,y2)) {
                this.score(app.invaders.mystery.points);
                this.explosions.push( new Explosion(app.invaders.mystery.x,app.invaders.mystery.y,app.invaders.mystery.points,1000,cleanOutExplosions,this));
                if (app.sound) { app.sound.mysteryHit(); }
                this.shots.splice(i, 1);
                continue;
            }

            // console.log('shot: ' + [x1,y1,x2,y2]);

            let shotConsumed = false;
            for (let j = app.invaders.squadrons.length - 1; j >= 0; j--) {
                let squad = app.invaders.squadrons[j];

                //-------------------------------------------------------------
                // Check for bomb collisions. Existing bombs still drop after
                // squadron and/or individual invaders are killed.
                //-------------------------------------------------------------
                for (let k = squad.bombs.bombs.length - 1; k >= 0; k--) {
                    if (shot.overlaps(squad.bombs.bombs[k])) {
                        this.shots.splice(i, 1);     // remove this shot
                        squad.bombs.bombs.splice(k, 1);
                        shotConsumed = true;
                        break;
                    }
                }
                if (shotConsumed) {
                    break;
                }
                if (squad.destroyed) {
                    continue;
                }

                //------------------------------------
                // for every ship in the squadron...
                //------------------------------------
                for (let k = squad.ships.length - 1; k >= 0; k--) {
                    let ship = squad.ships[k];
                    if (ship.killed) {
                        continue;
                    }
                    let sx1 = ship.x;
                    let sy1 = ship.y;
                    let sx2 = sx1 + ship.ims[0].width;
                    let sy2 = sy1 + ship.ims[0].height;
                    // console.log('ship' + [sx1,sy1,sx2,sy2]);
                    if (sx2 >= x1 && sx1 < x2 && sy2 >= y1 && sy1 < y2) {
                        this.hit(i, j, k, sx1, sy1);
                        shotConsumed = true;
                        break;
                    }
                }
                if (shotConsumed) {
                    break;
                }
            }
        }
    }


    hit(i,j,k,x,y) {
        // explode the invader in squadron j position k
        app.invaders.squadrons[j].ships[k].killed = true;
        app.invaders.squadrons[j].reassessStatus();
        this.shots.splice(i,1);
        this.explosions.push( new Explosion(x,y,0,400,cleanOutExplosions,this));
        this.score(app.invaders.squadrons[j].ships[k].points);
        if (app.sound) { app.sound.invaderHit(); }
    }

    score(pts) {
        let player = app.players[app.currentPlayer];
        player.score += pts;

        // One-time bonus life awarded at BONUS_LIFE_SCORE points
        let bonusThreshold = (typeof BONUS_LIFE_SCORE !== 'undefined') ? BONUS_LIFE_SCORE : 5000;
        if (!player.bonusAwarded && player.score >= bonusThreshold) {
            player.bonusAwarded = true;
            player.lives++;
            player.bonusLifeTime = millis();
            player.bonusLifeSlot = player.lives - 2;
            if (app.sound) {
                app.sound.extraLife();
            }
        }

        if (app.currentPlayer == 0) {
            app.screen.score1();
        } else {
            app.screen.score2();
        }
    }
}

function cleanOutExplosions(hts) {
    for (var i = hts.explosions.length - 1; i >= 0; i--) {
        if (hts.explosions[i].expired) {
            hts.explosions.splice(i,1);
        }
    }
}
