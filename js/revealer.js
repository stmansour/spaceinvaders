/*jshint esversion: 6 */

class Revealer {
    constructor(img, s,x,y,dy,d,cb) {
        this.img = img;     // optional image to print first
        this.x = x;
        this.y = y;
        this.s = s;         // string to display
        this.d = d;         // delay between characters in msec
        this.cb = cb;       // callback function or null
        this.tmr = null;    // timer info
        this.amt = 0;       // amount of original string to show
        this.str = "";      // current string to show, grows over time
        this.strx = x;      // print in progress x
        this.stry = y;      // print in progress y
        this.triggered = false;  // set to true after call to go()
        if (img != null) {
            this.strx += 1.1 * img.width;
        }
    }

    reset() {
        if (this.tmr != null) {
            clearInterval(this.tmr);
            this.tmr = null;
        }
        this.triggered = false;
        this.amt = 0;
        this.str = "";
    }

    setCb(cb) {
        this.cb = cb;   // changing the callback function
    }

    go() {
        this.triggered = true;
        this.tmr = setInterval(() => {
                // check for completion
                if (this.amt == this.s.length) {
                    this.clear();
                    return;
                }
                // advance to next character
                if (this.amt == 0) {
                    this.amt++;
                    return;
                }
                this.amt++;
                this.str = this.s.substr(0,this.amt);
            }, this.d );
    }

    clear() {
        if (this.tmr != null) {
            if (this.cb != null) {
                this.cb();
            }
            clearInterval(this.tmr);
            this.tmr = null;
        }
    }

    show() {
        if (!this.triggered) {
            return;
        }
        if (this.img != null) {
            const sf = 0.7;
            let wd = this.img.width * sf;
            let ht = this.img.height * sf;
            image(this.img,this.x,this.y - ht, wd, ht);
        }
        noStroke();
        text(this.str, this.strx,this.stry);
    }

}
