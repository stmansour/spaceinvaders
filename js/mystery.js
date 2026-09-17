/*jshint esversion: 6 */

class MysteryShip {
    constructor() {
        this.timer = null;
        this.timerPaused = false;
        this.points = 0;
        this.img = app.d;
        this.x = 0;
        this.y = 65;
        this.moving = false;
        this.dx = 4;  // move 4 pixels at a time.
        this.dir = 0;
    }

    go() {
        if (app && app.isPaused) {
            this.timerPaused = true;
            return;
        }
        if (this.timer != null) {
            clearTimeout(this.timer);
            this.timer = null;
        }
        this.timer = setTimeout( () => {
            this.timer = null;
            if (app && app.isPaused) {
                this.timerPaused = true;
                return;
            }
            if ( floor(random(0,1) + 0.5) > 0) {
                this.dir = -1;
                this.dx = -3;
                this.x = width - app.border;
            } else {
                this.dir = 1;
                this.dx = 3;
                this.x = app.border;
            }
            this.points = 100 * floor(random(1,6));
            this.moving = true;
            if (app.sound) { app.sound.mysteryStart(); }
        } , random(5000,15000));  // between 10 and 30 sec
    }

    pause() {
        if (this.timer != null) {
            clearTimeout(this.timer);
            this.timer = null;
            this.timerPaused = true;
        }
        if (this.moving && app.sound) {
            app.sound.mysteryStop();
        }
    }

    resume() {
        if (this.moving) {
            if (app.sound) {
                app.sound.mysteryStart();
            }
        } else if (this.timerPaused || this.timer == null) {
            this.timerPaused = false;
            this.go();
        }
    }

    cancel() {
        if (this.timer != null) {
            clearTimeout(this.timer);
        }
        if (app.sound) { app.sound.mysteryStop(); }
        this.moving = false;
        this.timer = null;
        this.timerPaused = false;
    }

    show() {
        if (!this.moving) {
            return;
        }
        if (app && app.isPaused) {
            image(this.img, this.x, this.y);
            return;
        }
        // check to see if we made it safely across the screen
        this.moving = (this.dir == 1 && this.x < width - app.border) || (this.dir == -1 && this.x > app.border);
        if (this.moving) {
            image(this.img,this.x,this.y);
            this.x += this.dx;
        } else {
            // this means we made it across the screen.  reset and go again.
            this.cancel();
            this.go();
        }
    }

    hit(x1,y1,x2,y2) {
        if (!this.moving || (app && app.isPaused)) {
            return false;
        }
        let sx1 = this.x;
        let sy1 = this.y;
        let sx2 = sx1 + this.img.width;
        let sy2 = sy1 + this.img.height;
        if (sx2 >= x1 && sx1 < x2 && sy2 >= y1 && sy1 < y2) {
            // we've been hit.  don't show the ship any longer...
            this.cancel();
            this.go();
            return true;
        }
        return false;
    }
}
