/**
 * @module elements
 */

const elements = {
    getWidth: function (identifier) {
        let ele = document.querySelector(identifier)
        return ele.offsetWidth || 300
    },
    getProperty: function (element, prop) {
        const cssObj = window.getComputedStyle(element, null)
        let propVal = cssObj.getPropertyValue(prop)
        propVal = propVal.includes("px") ? propVal.replace("px", "") : propVal
        return isNaN(propVal) ? propVal : parseFloat(propVal)
    },
    scrollElement: function (direction, amount, identifier) {
        const ele = document.querySelector(identifier)
        const gap = this.getProperty(ele, 'gap')
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
        return child.offsetWidth + parseFloat(gap)*2
    },
    scrollToChild: function (parent, nr) {
        let childWidth = this.getChildWidth(parent)//fullWidth/childCount
        let newPos = nr * childWidth

        parent.scrollTo(newPos <= parent.scrollWidth-childWidth? newPos : parent.scrollWidth-childWidth, 0)
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
    },
    swipeUp: function (element) {
        console.log("up")
        if (element.classList.contains("collapsed")) {
            element.querySelector(".always-visible").click()
            // element.classList.remove("collapsed")
        }
    },
    swipeDown: function (element) {
        console.log("down")
        
        if (!element.classList.contains("collapsed")) {
            element.querySelector(".always-visible").click()
            // element.classList.add("collapsed")
        }
        
    },
    /**
     * Function that handles the touchstart event.
     * @param {event} e The triggering event.
     */
    processTouchStart: function (e, element) {
        element.classList.remove("top-transition")
        if (element.scrollTop !== 0) {return}
        this.diffY = element.offsetTop - e.touches[0].clientY
        this.startY = element.offsetTop

        this.diffX = element.offsetLeft - e.touches[0].clientX
        this.startX = element.offsetLeft
    },

    /**
     * Function that handles the touchmove event.
     * @param {event} e The triggering event.
     */
    processTouchMove: function (e, element, startY, startX=0) {
        if (element.scrollTop !== 0) {return}
        console.log(1)
        let posY = e.touches[0].clientY + this.diffY
        let posX = e.touches[0].clientX + this.diffX
        console.log(this.diffY, this.diffX, this.startY, this.startX)
        // if ((startY / window.innerHeight) > 0.2 || posY > startY) {
        const movementY = Math.abs(posY - this.startY)
        const movementX = Math.abs(posX - this.startX)
        console.log(movementX, movementY)
        if (movementY > movementX) {
            e.preventDefault()
            element.style.top = posY + 'px'
            console.log(2)
        }
        // }
    },
    
    /**
     * Function that handles the touchend event.
     * @param {event} e The triggering event.
     */
    processTouchEnd: function (e, element) {
        if (element.scrollTop !== 0) {return}
        const posY = e.changedTouches[0].clientY + this.diffY
        const posX = e.changedTouches[0].clientX + this.diffX
        const movementY = Math.abs(posY - this.startY)
        const movementX = Math.abs(posX - this.startX)
        // element.classList.add("top-transition")
        // if (movementX < movementY) {
        // let initPos = startY / window.innerHeight
        if (Math.abs(posY-this.startY) < window.innerHeight*0.15) {
            // element.style.top = startY + "px"
            return
        }
        if (movementX < movementY) {
            if (posY < this.startY) {
                // if (initPos > 0.8) {
                //     element.style.top = 0.55*window.innerHeight + 'px'
                //     element.style.overflowY = "hidden"
                //     element.scrollTop = 0
                // } else {
                //     element.style.top = 0.05*window.innerHeight + 'px'
                //     element.style.overflowY = "scroll"
                // }
                this.swipeUp(element)
            } else if (posY > this.startY) {
                // if (initPos < 0.3) {
                //     element.style.top = 0.55*window.innerHeight + 'px'
                //     element.style.overflowY = "hidden"
                //     element.scrollTop = 0
                // } else {
                //     element.style.top = 0.90*window.innerHeight + 'px'
                //     element.style.overflowY = "hidden"
                //     element.scrollTop = 0
                // }
                this.swipeDown(element)
            }}
        // }
    },

    /**
     * Function that handles the touchcancel event.
     * @param {event} e The triggering event.
     */
    processTouchCancel: function (e, element) {
        e.preventDefault()
        //console.log(e)
        element.style.top = this.startY + "px"
    }

}

export {elements}