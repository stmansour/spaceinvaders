/*jshint esversion: 6 */
class Shot extends ImagePrimitive {
    constructor(x,y) {
        super(x,y,[app.cannonShot]);
        this.expired = false;  // turns true when the shot gets to the top of the screen or when we hit something
    }

    move() {
        this.y -= 4;
        this.expired = this.y <= app.topBar;
    };
}
