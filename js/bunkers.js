/*jshint esversion: 6 */

class Bunkers {
    constructor() {
        this.bunkers = [];
        this.cellSize = 4;
        this.cols = 14;
        this.rows = 8;
    }

    init() {
        this.bunkers = [];
        let gap = 20;
        let totalWidth = this.cols * this.cellSize * 4 + gap * 3;
        let startX = (width - totalWidth) / 2 + this.cols * this.cellSize / 2 + gap / 2;
        let bunkerY = height - app.cannon.height - 80 - this.rows * this.cellSize;
        for (let i = 0; i < 4; i++) {
            let bx = startX + i * (this.cols * this.cellSize + gap);
            this.bunkers.push(new Bunker(bx, bunkerY, this.cols, this.rows, this.cellSize));
            this.bunkers[i].init();
        }
    }

    show() {
        if (!app.bunkers || app.bunkers.bunkers.length === 0) { return; }
        for (let i = 0; i < this.bunkers.length; i++) {
            this.bunkers[i].show();
        }
    }

    // Check if any bunker is hit by this box; chip and return true if so.
    chipAt(x1, y1, x2, y2) {
        for (let i = 0; i < this.bunkers.length; i++) {
            if (this.bunkers[i].chip(x1, y1, x2, y2)) {
                return true;
            }
        }
        return false;
    }
}
