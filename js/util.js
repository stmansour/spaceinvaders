function setInnerHTML(id,s) {
    let el = document.getElementById(id);
    if (el != null) {
        el.innerHTML = s;
    }
}

// return a string s that represents x, has n characters, 0-filled:
// example:
//    32  -->  0032
//   219  -->  0219
//  3883  -->  3883
// 20334  --> 20334
function zeroFillNumber(x,n) {
    let y = floor(x);
    let s = '' + y;
    let slen = s.length;
    if (slen >= n) {
        return s;
    }
    return "000000000000000".substr(0,n - slen) + s;
}
