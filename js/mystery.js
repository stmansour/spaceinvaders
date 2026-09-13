/*jshint esversion: 6 */

class MysteryShip {
    constructor() {
        this.timer = null;
        this.points = 0;
        this.img = app.d;
        this.x = 0;
        this.y = 65;
        this.moving = false;
        this.dx = 4;  // move 4 pixels at a time.
        this.dir = 0;
    }

    go() {
        this.timer = setTimeout( () => {
            this.timer = null;
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

    cancel() {
        if (this.timer != null) {
            clearTimeout(this.timer);
        }
        if (app.sound) { app.sound.mysteryStop(); }
        this.moving = false;
        this.timer = null;
    }

    show() {
        if (!this.moving) {
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
        if (!this.moving) {
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
