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
    "players": document.getElementById("playersView"),
    "partRes": document.getElementById("partialResults")
}
const buttons = {
    "new": document.getElementById("newGame"),
    "continue": document.getElementById("continueGame"),
    "history": document.getElementById("showHistory"),
    "backFromNew": document.querySelector("#newView .back-button"),
    "backFromHis": document.querySelector("#historyView .back-button"),
    "backFromPla": document.querySelector("#playersView .back-button"),
    "backFromPlay": document.querySelector("#playView .back-button"),
    "partRes": document.querySelector("#partialResults .always-visible")
}
const forms = {
    "newGame": document.getElementById("newGameForm"),
    "players": document.getElementById("playerForm"),
    "keeper": document.getElementById("scoreKeeper")
}

const storage = window.sessionStorage

function createListeners() {
    // view switching
    buttons["new"].addEventListener("click", () => switchView("new"))
    buttons["continue"].addEventListener("click", () => switchView("play"))
    buttons["history"].addEventListener("click", () => switchView("history"))
    buttons["partRes"].addEventListener("click", showPartResults)

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
    // if (storage.getItem("playForms")) { return JSON.parse(storage.getItem("playForms")) }
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
    // const courseSelect = document.getElementById("golfCourse")
    for (const play in playTypes) {
        gameSelect.add(new Option(playTypes[play]["name"], playTypes[play]["id"]))
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
    keeper: forms["keeper"],
    ruleset: null,
    create: function(e) {
        e.preventDefault()
        console.log(e)
        const data = new FormData(e.target)
        console.log([...data.entries()])

        this.players = parseInt(data.get("players"))
        this.holes = parseInt(data.get("holes"))
        this.gameType = data.get("type")
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
                <label>Handicap: <input type="number" name="p${i}handicap" id="p${i}handicap"></label>
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
                "name": data.get(`p${i}name`) || `Spelare ${i}`,
                "handicap": parseFloat(data.get(`p${i}handicap`)) || 0
            })
        }
        this.players = players
        this.openScoreKeeper()
    },
    openScoreKeeper: function() {
        switchView("play")
        console.log(this.gameType)
        this.keeper.innerHTML = ""
        
        for (let i = 1; i<=this.holes; i++) {
            const inputFields = this.players.map(player => {
                return `<label>${player.name}: <input type="number" name="${player.name}-${i}" min="0" max="999"></label>`
            })
            this.keeper.innerHTML += `
            <div class="col white hole" id="hole${i}">
                <h3>Hål ${i}</h3>
                <label class="separate">Par: <input type="number" name="par-${i}" min="1" max="99"></label>
                ${inputFields.join("\n")}
            </div>
            `
        }
        this.keeper.innerHTML += `<div class="col white">
            <input type="submit" value="submit">
        </div>`

        this.ruleset = new rules[this.gameType.toString()](this.players, this.holes)
        this.ruleset.print()
    },
    showPartResults: function() {
        console.log("hello")
        views["partRes"].classList.toggle("collapsed")
    },
    readInputs: function() {
        let formData = new FormData(this.keeper)
        let points = {}
        for (let i = 1; i<=this.holes; i++) {
            points[i] = {
                "par": parseInt(formData.get(`par-${i}`)) || 0
            }
            this.players.forEach(p => {
                points[i][p.name] = parseInt(formData.get(`${p.name}-${i}`)) || 0
            })
        }
        this.ruleset.setPoints(points)
    }
}
function showPartResults() {
    views["partRes"].classList.toggle("collapsed")
    if (views["partRes"].classList.contains("collapsed")) {
        return
    }
    console.log("hello")
    gameObject.readInputs()
    let res = gameObject.ruleset.calculateScores()
    let container = views["partRes"].querySelector(".collapsing")
    container.innerHTML = ""
    Object.keys(res).forEach(player => {
        container.innerHTML += `<div class="player"><h4>${player}</h4>`
        for (const [key, val] of Object.entries(res[player])) {
            container.innerHTML += `<p><span>${key}</span> <span>${val}</span></p>\n`
        }
        container.innerHTML += "</div>"
    })
    
}

class GameRules {
    constructor(players, holes) {
        this.players = players
        this.holes = holes
        this._points = {}
        let playernames = players.map(x => x.name)
        for (let i=1; i<=holes; i++) {
            this._points[i] = {
                "par": 0
            }
            playernames.forEach(name => this._points[i][name] = 0)
        }
    }

    get points() {
        return this._points
    }

    set points(x) {
        this._points = x
    }

    print() {
        console.log(this.players, this.holes, this.points)
    }

    addPoints(hole, points) {
        this._points[hole] = points
    }

    setPoints(points) {
        this._points = points
    }

    readInputs() {
        let formData = new FormData()
    }

    calculateScores() {
        let total = {}
        this.players.map((player) => {
            let score = {
                total: 0,
                par: 0,
                handicap: 0
            }
            Object.keys(this._points).forEach(key => {
                let par = this._points[key]["par"]
                let point = this._points[key][player.name]
                score.total += point
                score.par += point - par
                score.handicap += point - player.handicap/18
            })
            total[player.name] = score
        })
        console.log(total)
        return total
    }
}


const rules = {
    forms: [],
    matchgame: class MatchGame extends GameRules {
        constructor(players, holes) {
            super(players, holes)
        }
    },
    pointbogey: class PointBogey extends GameRules {
        constructor(players, holes) {
            super(players, holes)
        }
    },
    shotcomp: class ShotCompetition extends GameRules {
        constructor(players, holes) {
            super(players, holes)
        }

        calculateScores() {
            let total = {}
            this.players.map((player) => {
                let score = {
                    total: 0,
                    par: 0,
                    handicap: 0
                }
                Object.keys(this._points).forEach(key => {
                    let par = this._points[key]["par"]
                    let point = this._points[key][player.name]
                    score.total += point
                    score.par += point - par
                    score.handicap += point - player.handicap/18
                })
                total[player.name] = score
            })
            console.log(total)
            return total
        }
    },
    shotgolf: class ShotGolf extends GameRules {
        constructor(players, holes) {
            super(players, holes)
        }
    },
    foursome: class Foursome extends GameRules {
        constructor(players, holes) {
            super(players, holes)
        }
    },
    greensome: class Greensome extends GameRules {
        constructor(players, holes) {
            super(players, holes)
        }
    },
    irishgreen: class IrishGreensome extends GameRules {
        constructor(players, holes) {
            super(players, holes)
        }
    },
    runecl: class RunningEclectic extends GameRules {
        constructor(players, holes) {
            super(players, holes)
        }
    },
    scramble: class Scramble extends GameRules {
        constructor(players, holes) {
            super(players, holes)
        }
    },
    dropoutscram: class DropOutScramble extends GameRules {
        constructor(players, holes) {
            super(players, holes)
        }
    },
    texscramble: class TexasScramble extends GameRules {
        constructor(players, holes) {
            super(players, holes)
        }
    },
    rumble: class Rumble extends GameRules {
        constructor(players, holes) {
            super(players, holes)
        }
    },
    nassau: class Nassau extends GameRules {
        constructor(players, holes) {
            super(players, holes)
        }
    },
    tryall: class TryAll extends GameRules {
        constructor(players, holes) {
            super(players, holes)
        }
    },
    fourball: class Fourball extends GameRules {
        constructor(players, holes) {
            super(players, holes)
        }
    },
    fourballbewo: class FourballBeWo extends GameRules {
        constructor(players, holes) {
            super(players, holes)
        }
    },
    fourballbeto: class FourballBeTo extends GameRules {
        constructor(players, holes) {
            super(players, holes)
        }
    },
    copenhagener: class Copenhagener extends GameRules {
        constructor(players, holes) {
            super(players, holes)
        }
    },
    threadcomp: class ThreadComp extends GameRules {
        constructor(players, holes) {
            super(players, holes)
        }
    },
    flagcomp: class FlagComp extends GameRules {
        constructor(players, holes) {
            super(players, holes)
        }
    },
    kicker: class Kicker extends GameRules {
        constructor(players, holes) {
            super(players, holes)
        }
    }
}
let pla = [
    {name: "bertil", handicap: 5},
    {name: "pertil", handicap: 20}
]
const test = new rules["shotcomp"](pla, 9)
test.points = {
    1: {
        "par": 4,
        "bertil": 5,
        "pertil": 10
    },
    2: {
        "par": 4,
        "bertil": 5,
        "pertil": 10
    },
    3: {
        "par": 4,
        "bertil": 5,
        "pertil": 10
    },
    4: {
        "par": 4,
        "bertil": 5,
        "pertil": 10
    },
    5: {
        "par": 4,
        "bertil": 5,
        "pertil": 10
    },
    6: {
        "par": 4,
        "bertil": 5,
        "pertil": 10
    },
    7: {
        "par": 4,
        "bertil": 5,
        "pertil": 10
    },
    8: {
        "par": 4,
        "bertil": 5,
        "pertil": 10
    },
    9: {
        "par": 4,
        "bertil": 5,
        "pertil": 10
    }
}
test.print()
test.calculateScores()