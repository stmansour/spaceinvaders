/*jshint esversion: 6 */
// The image primitive class handles:
//    1. moving an image around the canvas
//    2. animating between multiple images
//    3. keeping track of bounds
//    4. reporting overlap, that is, determining collisions
//
// Assumptions:
//     1. all images in ims are the same size
//     2. we switch images each time the image is moved
//
//-----------------------------------------------------------------------
class ImagePrimitive {
    constructor(x,y,ims) {
        this.x = x;
        this.y = y;
        this.ims = ims;     // an array of images.
        this.originX = 0;   // 0 = left, 1 = center
        this.idx = 0;       // current image within this.ims
    }

    setOriginX(o) {
        this.originX = o;
    }

    tooFarLeft() {
        return (this.x < 5);
    }

    tooFarRight() {
        return (this.x + this.ims[0].width > width - 5);
    }

    relativeMove(dx,dy) {
        this.x += dx;
        this.y += dy;
        if (this.tooFarRight()) {
            this.x = width - 5 - this.ims[0].width;
        }
        if (this.tooFarLeft()) {
            this.x = 5;
        }
        this.idx++;
        if (this.idx >= this.ims.length) {
            this.idx = 0;
        }
    }

    xOffset() {
        if (this.originX == 1) {
            return -this.ims[0].width/2;
        }
        return 0;
    }

    show() {
        let xoff = this.xOffset();
        // let img = (this.img2 == null) ? this.ims[0] : ((this.show1) ? this.ims[0] : this.img2);
        image(this.ims[this.idx],this.x + xoff,this.y);
    }

    bounds() {
        let xoff = this.xOffset();
        return [this.x + xoff, this.y, this.x + this.ims[0].width + xoff, this.y + this.ims[0].height];
    }

    // all the overlaps cases:
    //                     x1                  x2
    //                      *------------------*
    //    *-----*        *----*   *------*    *----*  *-------*
    //    s1    s2       s3   s4  s5     s6   s7   s8 s9      s10
    //               *-------------------------------*
    //               s11                             s12
    //------------------------------------------------------------------
    overlaps(ob) {
        let b1 = this.bounds();
        let x1 = b1[0];
        let y1 = b1[1];
        let x2 = b1[2];
        let y2 = b1[3];
        let b = ob.bounds();
        let sx1 = b[0];
        let sy1 = b[1];
        let sx2 = b[2];
        let sy2 = b[3];

        if ( (sx1 < x2) && (sx2 >= x1) ) {
            return (sy1 < y2) && (sy2 >= y1);
        }
        return false;
    }
}
