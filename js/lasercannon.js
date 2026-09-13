/*jshint esversion: 6 */

class LaserCannon extends ImagePrimitive {
    constructor() {
        super(0, 0, [app.cannon]);
        this.width = 0;
        this.height = 0;
        this.movingLeft = false;
        this.movingRight = false;
        this.moveAmt = 8;
        this.nudgeAmt = 2;
        this.holdDelay = 80;
        this.leftPressedAt = 0;
        this.rightPressedAt = 0;
        this.destroyed = false;
    }

    init() {
        this.width = app.cannon.width;
        this.height = app.cannon.height;
        this.y = height - this.height - 60;
        this.x = (width - this.width) / 2;
        super.setOriginX(1); // center X
    }

    show() {
        if (!this.destroyed) {
            super.show();
        }
    }

    go() {
        if (this.movingLeft && this.heldLongEnough(this.leftPressedAt)) {
            this.moveLeft(this.moveAmt);
        }
        if (this.movingRight && this.heldLongEnough(this.rightPressedAt)) {
            this.moveRight(this.moveAmt);
        }
    }

    goLeft(t) {
        if (t && !this.movingLeft) {
            this.leftPressedAt = millis();
            this.moveLeft(this.nudgeAmt);
        }
        this.movingLeft = t;
    }

    goRight(t) {
        if (t && !this.movingRight) {
            this.rightPressedAt = millis();
            this.moveRight(this.nudgeAmt);
        }
        this.movingRight = t;
    }

    heldLongEnough(startTime) {
        return millis() - startTime >= this.holdDelay;
    }

    moveLeft(amount) {
        if (this.x - amount >= app.border) {
            super.relativeMove(-amount, 0);
        }
    }

    moveRight(amount) {
        if (this.x + amount <= width - app.border) {
            super.relativeMove(amount, 0);
        }
    }
}
