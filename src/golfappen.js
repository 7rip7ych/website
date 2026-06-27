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
    "history": document.getElementById("historyView")
}
const buttons = {
    "new": document.getElementById("newGame"),
    "continue": document.getElementById("continueGame"),
    "history": document.getElementById("showHistory")
}
const forms = {
    "newGame": document.getElementById("newGameForm")
}

const storage = window.sessionStorage

function createListeners() {
    // view switching
    buttons["new"].addEventListener("click", () => switchView("new"))
    buttons["continue"].addEventListener("click", () => switchView("continue"))
    buttons["history"].addEventListener("click", () => switchView("history"))

    // form submits
    forms["newGame"].addEventListener("submit", createGame)
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


function createGame(e) {
    e.preventDefault()
    console.log(e)
    const data = new FormData(e.target)
    console.log([...data.entries()])
    gameObject.create(parseInt(data.get("players")),
        parseInt(data.get("holes")), data.get("type"))
}

const gameObject = {
    view: views["play"],
    create: function(players, holes, type) {
        this.players = players
        this.holes = holes
        this.type = type
        console.log(players, holes, type)
        switchView("play")
        this.openPlayerSetup(players)
    },
    openPlayerSetup: function(count) {
        this.view.innerHTML = "<h2>Ange spelare</h2>"
        let playerForm = document.createElement("form")
        playerForm.className = "form"
        for (let i = 1; i<=count; i++) {
            playerForm.innerHTML += `
            <fieldset>
                <legend>Player ${i}</legend>
                <label>Namn: <input type="text" name="name" id="p${i}name"></label>
                <label>Handikapp: <input type="number" name="handicap" id="p${i}handicap"></label>
            </fieldset>
            `
        }
        this.view.appendChild(playerForm)
    },
    setUpPlayers: function() {},
}