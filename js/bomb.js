/*jshint esversion: 6 */
class Bomb extends ImagePrimitive {
    constructor(x,y) {
        super(x,y,[app.bmb1a,app.bmb1b]);
        this.expired = false;  // turns true when the shot gets to the top of the screen or when we hit something
    }

    move() {
        this.y += 4;
        this.expired = this.y > app.bottomLineHeight;
    };
}
