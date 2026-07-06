/**
 * @module elements
 */

const elements = {
    getWidth: function (identifier) {
        let ele = document.querySelector(identifier)
        return ele.offsetWidth || 300
    },
    scrollElement: function (direction, amount, identifier) {
        const ele = document.querySelector(identifier)
        const cssObj = window.getComputedStyle(ele, null)
        const gap = cssObj.getPropertyValue('gap')
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
    },
    getChildWidth: function (parent, index=0) {
        let child = parent.children[index]
        const cssObj = window.getComputedStyle(child, null)
        const gap = cssObj.getPropertyValue('gap')
        return child.offsetWidth + parseFloat(gap)
    },
    scrollToNext: function (parent) {
        // console.log(parent)
        let fullWidth = parent.scrollWidth
        let pos = parent.scrollLeft
        // let childCount = parent.children.length
        let childWidth = this.getChildWidth(parent)//fullWidth/childCount
        let newPos = (Math.floor(pos / childWidth) + 1) * childWidth

        parent.scrollTo(newPos <= fullWidth-childWidth? newPos : fullWidth-childWidth, 0)

        // parent.children[(Math.floor(pos / childWidth) + 1)]?.scrollIntoView()
    },
    scrollToPrev: function (parent) {
        // console.log(parent)
        // let fullWidth = parent.scrollWidth
        let pos = parent.scrollLeft
        // let childCount = parent.children.length
        let childWidth = this.getChildWidth(parent)//fullWidth/childCount
        let newPos = (Math.floor(pos / childWidth) - 1) * childWidth

        parent.scrollTo(newPos >= 0 ? newPos : 0, 0)

        // parent.children[(Math.floor(pos / childWidth) - 1)]?.scrollIntoView()
    }
}

export {elements}