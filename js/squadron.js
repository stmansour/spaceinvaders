/*jshint esversion: 6 */
// Squadron - a horizontal row of Invaders
//
// A squadron keeps track of:
//      Point Invaders - the leftmost and rightmost not-killed Invader in the list
//                       leftmost and rightmost could point to the same invader
//      leftmost         if there is only one left that is not killed.
//      rightmost        Both values will be null if all the invaders are killed.
//                       Note that in this case 'destroyed' will be true.
//
//      MoveDown         Set to true when rightmost.x is greater than the
//                       right edge, or when leftmost.x is less than the left edge.
//----------------------------------------------------------------------------------

/* esversion: 6 */

class Squadron {
    constructor(ims,y,count,pts) {
        this.ims = ims;
        this.baseY = y;
        this.ships = [];
        this.points = pts;
        this.activeShips = 0;   // count of ships in this squad that have not been killed
        this.numShips = count;  // number of ships in this squadron
        this.leftmost = null;   // leftmost invader that is not killed
        this.rightmost = null;  // rightmost invader that is not killed
        this.direction = 1;     // multiplier, can be 1 or -1
        this.dx = 10;           // 10 pixels between ships
        this.destroyed = false; // true when all ships in the squadron have been killed
        this.directionChangeNeeded = false; // when one of the invaders is moved left of the left edge or right of the right edge
        this.bombs = null;
    }

    reassessStatus() {
        if (this.destroyed) {
            return;
        }
        this.leftmost = null;
        this.rightmost = null;
        let n = 0;
        for (var i = 0; i < this.ships.length; i++) {
            let ship = this.ships[i];
            if (ship.killed) {
                continue;
            }
            n++;
            if (this.leftmost == null) {
                this.leftmost = ship;
            }
            if (this.rightmost == null) {
                this.rightmost = ship;
            }
            if (ship.x > this.rightmost.x) {
                this.rightmost = ship;
            }
        }
        this.activeShips = n;
        this.destroyed = (this.leftmost == null && this.rightmost == null);
        if (this.direction > 0 && this.rightmost != null) {
            this.directionChangeNeeded = this.rightmost.x + app.maxShipWidth + app.border > width;
        } else if (this.leftmost != null) {
            this.directionChangeNeeded = this.leftmost.x - app.border < 0;
        }
    }

    init(n) {
        if (typeof n === "undefined") {
            n = this.numShips;
        }
        let xSpacing = app.maxShipWidth + this.dx;
        let x = (width - (n * app.maxShipWidth + (n - 1)*this.dx))/2;
        let y = this.baseY;
        for (var i = 0; i < n; i++) {
            var inv = new Invader(x,y,this.ims,this.points);
            this.ships.push(inv);
            x += xSpacing;
        }
        this.reassessStatus();
        this.bombs = new Bombs();
    }

    show() {
        this.bombs.show();  // the bombs still fall even if the ships were destroyed.
        if (this.destroyed) {
            return;
        }
        for (let i = 0; i < this.ships.length; i++) {
            this.ships[i].show();  // always show first
            if (this.ships[i].killed) {
                continue;  // killed invaders can't drop bombs
            }

            // don't drop any more bombs if we've frozen the screen...
            if (app.gameStatus < GAME_HOLD_FOR_MESSAGE && app.invaders.introduced) {
                let r = random(1,app.players[app.currentPlayer].bombDropOdds);
                if (r < 2 ) {
                    this.bombs.fire(this.ships[i].x, this.ships[i].y);
                }
            }
        }
    }

    scanForHits() {
        return this.bombs.scanForHits();
    }
}
