/*jshint esversion: 6 */
// One bunker: a grid of cells that can be chipped away by bombs and shots.
class Bunker {
    constructor(x, y, cols, rows, cellSize) {
        this.x = x;
        this.y = y;
        this.cols = cols;
        this.rows = rows;
        this.cellSize = cellSize;
        this.cells = [];  // list of [cx, cy] pixel coords of each remaining cell
    }

    init() {
        this.cells = [];
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                // Simple arc: skip corners and top center for classic shape
                let skip = false;
                if (row === 0 && (col < 2 || col > this.cols - 3)) { skip = true; }
                if (row === 1 && (col < 1 || col > this.cols - 2)) { skip = true; }
                if (!skip) {
                    this.cells.push([
                        this.x + col * this.cellSize,
                        this.y + row * this.cellSize
                    ]);
                }
            }
        }
    }

    show() {
        fill(0, 200, 100);
        noStroke();
        for (let i = 0; i < this.cells.length; i++) {
            let cx = this.cells[i][0];
            let cy = this.cells[i][1];
            rect(cx, cy, this.cellSize, this.cellSize);
        }
    }

    // Remove any cells that overlap the box (x1,y1,x2,y2). Return true if any removed.
    chip(x1, y1, x2, y2) {
        let hit = false;
        for (let i = this.cells.length - 1; i >= 0; i--) {
            let cx = this.cells[i][0];
            let cy = this.cells[i][1];
            let cs = this.cellSize;
            if (x2 >= cx && x1 < cx + cs && y2 >= cy && y1 < cy + cs) {
                this.cells.splice(i, 1);
                hit = true;
            }
        }
        return hit;
    }
}
