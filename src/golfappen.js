/**
 * @module golfappen
 */

import { getFile } from "./modules/files.js"

// declare variables
const main = document.querySelector(".wrapper")

const views = {
    "start": document.getElementById("startView"),
    "new": document.getElementById("newView"),
    "play": document.getElementById("playView"),
    "score": document.getElementById("scoreView"),
    "history": document.getElementById("historyView"),
    "players": document.getElementById("playersView")
}
const buttons = {
    "new": document.getElementById("newGame"),
    "continue": document.getElementById("continueGame"),
    "history": document.getElementById("showHistory"),
    "backFromNew": document.querySelector("#newView .back-button"),
    "backFromHis": document.querySelector("#historyView .back-button"),
    "backFromPla": document.querySelector("#playersView .back-button"),
    "backFromPlay": document.querySelector("#playView .back-button")
}
const forms = {
    "newGame": document.getElementById("newGameForm"),
    "players": document.getElementById("playerForm")
}

const storage = window.sessionStorage

function createListeners() {
    // view switching
    buttons["new"].addEventListener("click", () => switchView("new"))
    buttons["continue"].addEventListener("click", () => switchView("play"))
    buttons["history"].addEventListener("click", () => switchView("history"))

    // back buttons
    buttons["backFromNew"].addEventListener("click", () => switchView("start"))
    buttons["backFromHis"].addEventListener("click", () => switchView("start"))
    buttons["backFromPla"].addEventListener("click", () => switchView("new"))
    buttons["backFromPlay"].addEventListener("click", () => switchView("players"))

    // form submits
    forms["newGame"].addEventListener("submit", (e) => gameObject.create(e))
    forms["players"].addEventListener("submit", (e) => gameObject.setUpPlayers(e))

}


// Setup functions executed once
async function loadPlayTypes() {
    if (storage.getItem("playForms")) { return JSON.parse(storage.getItem("playForms")) }
    const plays = await getFile("assets/golf_spelformer.json")
    storage.setItem("playForms", JSON.stringify(plays))
    return plays
}

function loadGolfCourses() {
    console.log(1)
    return []
}


async function populateNewGameForm(playTypes, golfCourses) {
    // console.log(playTypes)
    const gameSelect = document.getElementById("gameType")
    const courseSelect = document.getElementById("golfCourse")
    for (const play in playTypes) {
        gameSelect.add(new Option(playTypes[play]["name"], playTypes[play]["name"]))
    }
}

async function populateHistory() {}

async function setup() {
    createListeners()
    const plays =  await loadPlayTypes()
    const courses = loadGolfCourses()
    populateNewGameForm(plays, courses)
    populateHistory()
}

setup() // run setup

// repeatable functions
function switchView(newView) {
    if (!(newView in views)) {return}
    let currView = document.querySelector("section.visible")
    currView.classList.replace("visible", "hidden")

    views[newView].classList.replace("hidden", "visible")
}


// function createGame(e) {
//     e.preventDefault()
//     console.log(e)
//     const data = new FormData(e.target)
//     console.log([...data.entries()])
//     gameObject.create(parseInt(data.get("players")),
//         parseInt(data.get("holes")), data.get("type"))
// }

const gameObject = {
    view: views["play"],
    keeper: document.getElementById("scoreKeeper"),
    create: function(e) {
        e.preventDefault()
        console.log(e)
        const data = new FormData(e.target)
        console.log([...data.entries()])

        this.players = parseInt(data.get("players"))
        this.holes = parseInt(data.get("holes"))
        this.type = data.get("type")
        switchView("players")
        this.openPlayerSetup(this.players)
    },
    openPlayerSetup: function(count) {
        
        let playerForm = forms["players"]
        playerForm.innerHTML = ""
        for (let i = 1; i<=count; i++) {
            playerForm.innerHTML += `
            <fieldset>
                <legend>Player ${i}</legend>
                <label>Namn: <input type="text" name="p${i}name" id="p${i}name"></label>
                <label>Handikapp: <input type="number" name="p${i}handicap" id="p${i}handicap"></label>
            </fieldset>
            `
        }
        playerForm.innerHTML += `<input type="submit" name="submit" value="Klar">`

    },
    setUpPlayers: function(e) {
        e.preventDefault()
        const data = new FormData(e.target)
        console.log([...data.entries()])
        let players = []
        for (let i = 1; i<=this.players; i++) {
            players.push({
                "name": data.get(`p${i}name`),
                "handicap": data.get(`p${i}handicap`)
            })
        }
        this.openScoreKeeper()
    },
    openScoreKeeper: function() {
        switchView("play")
    }
}