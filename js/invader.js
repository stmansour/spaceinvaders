/*jshint esversion: 6 */

class Invader extends ImagePrimitive {
    constructor(x,y,ims,pts) {
        super(x,y,ims);
        this.points = pts;      // how many points is this invader worth
        this.killed = false;    // this invader has not yet been killed
        this.introduced = false;
    }

    show() {
        if (!this.killed) {
            super.show();
        }
    }
}
