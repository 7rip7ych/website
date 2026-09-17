/**
 * @module math-extension
 * Additional math functions, extending the Math lib.
 */

function random(min, max) {
    return Math.floor(Math.random() * (max+1-min)) + min
}

export {random}