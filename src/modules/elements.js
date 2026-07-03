/**
 * @module elements
 */

const elements = {
    getWidth: function (identifier) {
        let ele = document.querySelector(identifier)
        console.log(ele.offsetWidth, ele)
        return ele.offsetWidth || 300
    },
    scrollElement: function (direction, amount, identifier) {
        const ele = document.querySelector(identifier)
        const cssObj = window.getComputedStyle(ele, null)
        const gap = cssObj.getPropertyValue('gap')
        console.log(gap)
        amount += parseFloat(gap)
        let x = 0
        let y = 0
        switch (direction) {
            case 1:
            case "top":
            case "up":
                y = -amount
                break
            case 2:
            case "right":
            case "r":
                x = amount
                break
            case 3:
            case "bottom":
            case "down":
                y = amount
                break
            case 4:
            case "left":
            case "l":
                x = -amount
                break
        }
        ele.scrollBy(x, y)
    }
}
export {elements}