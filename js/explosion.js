/*jshint esversion: 6 */

// This module shows an explosion and optionally some point values to the right.
// The explosion will appear on the screen for a period of time, then call a
// callback function when the time expires.

class Explosion {
    constructor(x,y,points,t,cb,data) {
        this.cb = cb;
        this.data = data;       // callback data
        this.x = x;
        this.y = y;
        this.points = points;   // set to <= 0 to ignore
        this.tmr = null;        // timer for how long it should show
        this.expired = false;

        this.tmr = setTimeout(() => {
            this.expired = true;
            this.tmr = null;
            if(cb != null){
                this.cb(this.data);
            }
        },t);
    }

    clear() {
        if (this.tmr != null) {
            clearTimeout(this.tmr);
        }
    }

    show() {
        if (this.expired) {
            return;
        }
        image(app.explode,this.x,this.y);
        if (this.points > 0) {
            noStroke();
            let s = "" + this.points;
            text(s, this.x + app.explode.width, this.y);
        }
    }
}
