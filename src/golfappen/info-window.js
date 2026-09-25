/**
 * @module info-window
 */

// import { gameObject } from "./golfappen.js"

const infoWindow = {
    window: document.getElementById("typeInfoWindow"),
    button: document.getElementById("gameTypeInfo"),
    init: function(plays) {
        this.button.onclick = (e) => this.open(e)
        let content = `<div class="top-row"><h2>Info</h2><button class="close-button">X</button></div><div class="popup-content">`
        content += plays.map(play => {
            return `
            <h3>${play.name}</h3>
            <p>${play.desc}</p>
            <p class="hcp-para"><b>Handicap beräknas som:</b> ${play.hcp_desc.length > 0? play.hcp_desc:"Samma som användaren skrivit in."}</p>
            `
        }).join("\n")
        content += "</div>"
        this.window.innerHTML = content
        this.window.querySelector(".close-button").onclick = (e) => this.close(e)
    },
    open: function(e) {
        e.preventDefault()
        this.window.style.display = "block"
    },
    close: function(e) {
        e.preventDefault()
        this.window.style.display = "none"
    }
}

const gameInfoWindow = {
    window: document.getElementById("gameInfoWindow"),
    button: document.getElementById("gameInfo"),
    init: function(plays) {
        let content = `<div class="top-row"><h2>Info</h2><button class="close-button">X</button></div><div class="popup-content">`
        this.plays = plays
        content += plays.map(play => {
            return `
            <h3>${play.name}</h3>
            <p>${play.desc}</p>
            <p class="hcp-para"><b>Handicap beräknas som:</b> ${play.hcp_desc.length > 0? play.hcp_desc:"Samma som användaren skrivit in."}</p>
            `
        }).join("\n")
        content += "</div>"
        this.window.innerHTML = content
        this.window.querySelector(".close-button").onclick = (e) => this.close(e)
    },
    createListeners: function() {
        this.button = document.getElementById("gameInfo")
        this.button.onclick = (e) => this.open(e)
    },
    setContent: function(type) {
        const play = this.plays.find(x =>x.id == type)
        this.window.innerHTML = `<div class="top-row"><h2>Info</h2><button class="close-button">X</button></div>
        <div class="popup-content">
        <h3>${play.name}</h3>
        <p>${play.desc}</p>
        <p class="hcp-para"><b>Handicap beräknas som:</b> ${play.hcp_desc.length > 0? play.hcp_desc:"Samma som användaren skrivit in."}</p>
        </div>
        `
        this.window.querySelector(".close-button").onclick = (e) => this.close(e)
    },
    open: function(e) {
        e.preventDefault()
        this.window.style.display = "block"
    },
    close: function(e) {
        e.preventDefault()
        this.window.style.display = "none"
    }
}

export {
    infoWindow,
    gameInfoWindow
}