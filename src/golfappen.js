/**
 * @module golfappen
 */

import { getFile } from "./modules/files.js"
import { elements } from "./modules/elements.js"

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
    "partRes": document.querySelector("#partialResults .always-visible"),
    "nextHole": document.querySelector("#keeper-nav .right"),
    "prevHole": document.querySelector("#keeper-nav .left")
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
    buttons["partRes"].addEventListener("click", () => gameObject.showPartResults())

    // navigation
    document.querySelector(".siteheader .logo").onclick = () => switchView("start")
    buttons["backFromNew"].addEventListener("click", () => switchView("start"))
    buttons["backFromHis"].addEventListener("click", () => switchView("start"))
    buttons["backFromPla"].addEventListener("click", () => switchView("new"))
    buttons["backFromPlay"].addEventListener("click", () => switchView("players"))
    buttons["prevHole"].addEventListener("click", () => {
        const width = elements.getWidth("#scoreKeeper .hole")
        elements.scrollElement("left", width, "#scoreKeeper")
    })
    buttons["nextHole"].addEventListener("click", () => {
        const width = elements.getWidth("#scoreKeeper .hole")
        elements.scrollElement("right", width, "#scoreKeeper")
    })

    // form submits
    forms["newGame"].addEventListener("submit", (e) => gameObject.create(e))
    forms["players"].addEventListener("submit", (e) => gameObject.setUpPlayers(e))
    forms["keeper"].addEventListener("submit", (e) => gameObject.showResults(e))
}

const data = {
    clubs: [],
    playtypes: [],
    clubdata: {},
    loadPlayTypes: async function loadPlayTypes() {
        // if (storage.getItem("playForms")) { return JSON.parse(storage.getItem("playForms")) }
        const plays = await getFile("assets/golf_spelformer.json")
        storage.setItem("playForms", JSON.stringify(plays))
        return plays
    },
    loadGolfClubs: async function loadGolfClubs() {
        const courses = await getFile("assets/golfbanor.json")
        // storage.setItem("courses", JSON.stringify(plays))
        return courses
    },
    loadClubData: async function() {
        this.clubdata = await getFile("assets/caddee-data.json")
        // storage.setItem("courses", JSON.stringify(plays))
    },
    getClubData: async function(club) {
        console.log(club)
        let data = this.clubdata || await getFile("assets/caddee-data.json")
        console.log(await Object.keys(data))
        // if (!this.clubdata) {
        //     this.clubdata = await getFile("assets/caddee-data.json")
        // }
        if (!await data[club]) { return }
        console.log(data[club])
        return await data[club]["props"]["pageProps"]
    }
}

async function populateNewGameForm(playTypes, golfClubs) {
    // console.log(playTypes)
    const gameSelect = document.getElementById("gameType")
    const clubSelect = document.getElementById("golfClub")
    const courseSelect = document.getElementById("golfCourse")
    const playerCount = document.getElementById("playerCount")
    
    for (const play in playTypes) {
        // let opt = new Option(playTypes[play]["name"], playTypes[play]["id"])
        let opt = document.createElement("option")
        opt.value = playTypes[play]["id"]
        opt.innerText = '*' + playTypes[play]["name"]
        // console.log(rules.implemented)
        if (rules.implemented.includes(opt.value)) {
            opt.classList.add("implemented")
            opt.innerText = playTypes[play]["name"]
        }
        gameSelect.add(opt)
    }

    // Limit options after players
    playerCount.addEventListener("change", (e) => {
        let num = parseInt(e.target.value)
        let unavailable = playTypes.filter(x => x.minPlayers > num).map(x => x.id)
        gameSelect.querySelectorAll("option").forEach(opt => {
            opt.disabled = unavailable.includes(opt.value)
            if (!opt.value) {
                opt.disabled = true
            }
        })
    })
    for (const course in golfClubs) {
        clubSelect.add(new Option(golfClubs[course]["name"], golfClubs[course]["id"]))
    }
    clubSelect.addEventListener("change", async(e) => {
        const clubData = await data.getClubData(e.target.value)
        courseSelect.innerHTML = `<option selected disabled>Välj golfbana</option>`
        if (!clubData || !clubData?.club?.courses) {
            courseSelect.disabled = true
            return
        }
        // console.log(clubData)
        const courses = clubData?.club?.courses
        // console.log(courses)
        courses.map(course => {
            courseSelect.add(new Option(course.name))
        })

        if (courses.length == 1) {
            courseSelect.value = courses[0].name
        }

        courseSelect.disabled = false
        
    })
}

async function populateHistory() {}

async function setup() {
    createListeners()
    const plays =  await data.loadPlayTypes()
    const courses = await data.loadGolfClubs()
    await data.loadClubData()
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



const gameObject = {
    view: views["play"],
    keeper: forms["keeper"],
    ruleset: null,
    playerCount: 0,
    players: [],
    create: function(e) {
        e.preventDefault()
        const data = new FormData(e.target)
        // console.log([...data.entries()])

        this.playerCount = parseInt(data.get("players"))
        this.holes = parseInt(data.get("holes"))
        this.gameType = data.get("type")
        this.club = data.get("club")
        this.course = data.get("course")
        if (this.course) {
            this.loadCourseData()
        }
        switchView("players")
        this.openPlayerSetup(this.playerCount)
    },
    loadCourseData: async function() {
        this.clubData = await data.getClubData(this.club)
        this.courseData = this.clubData.courseArray.find(x => x.name == this.course)
        console.log(this.courseData)
    },
    openPlayerSetup: function(count) {
        let playerForm = forms["players"]
        playerForm.innerHTML = ""
        for (let i = 1; i<=count; i++) {
            playerForm.innerHTML += `
            <fieldset>
                <legend>Player ${i}</legend>
                <label>Namn: <input type="text" name="p${i}name" id="p${i}name"></label>
                <label>Spelhandicap: <input type="number" name="p${i}handicap" id="p${i}handicap"></label>
            </fieldset>
            `
        }
        playerForm.innerHTML += `<input type="submit" name="submit" value="Klar">`

    },
    setUpPlayers: function(e) {
        e.preventDefault()
        const data = new FormData(e.target)
        // console.log([...data.entries()])
        let players = []
        for (let i = 1; i<=this.playerCount; i++) {
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
        console.log(this.gameType, this.players)
        this.keeper.innerHTML = ""
        
        for (let i = 1; i<=this.holes; i++) {
            const inputFields = this.players.map(player => {
                return `<label>${player.name}: <input type="number" name="${player.name}-${i}" min="0" max="999"></label>`
            })
            let parVal = ""
            let indVal = ""
            let extraContent = ""
            if (this.courseData) {
                parVal = ` value="${this.courseData.holes[i-1].par}"`
                indVal = ` value="${this.courseData.holes[i-1].index}"`
            }
            if (this.gameType == "matchgame") {
                extraContent = `
                <label>Vinnare:</label>
                <div class="horizontal-radio-buttons" id="winnerRadios">`
                extraContent += this.players.map(player => {
                    return `<span><input type="radio" name="winner-${i}" value="${player.name}" id="winner-${i}-${player.name.replace(" ", "-")}">
                    <label for="winner-${i}-${player.name.replace(" ", "-")}">${player.name}</label></span>`
                }).join("\n")
                extraContent += `</div>`
            }
            this.keeper.innerHTML += `
            <div class="col white hole" id="hole${i}">
                <h3>Hål ${i}</h3>
                <label class="separate">Par: <input type="number" name="par-${i}" min="1" max="99"${parVal}></label>
                <label class="separate">Index: <input type="number" name="index-${i}" min="1" max="99"${indVal}></label>
                ${inputFields.join("\n")}
                ${extraContent}
            </div>
            `
        }
        this.keeper.innerHTML += `<div class="col white">
            <input type="submit" value="Räkna ut resultat">
            <div class="results row cols-2"></div>
        </div>`

        this.ruleset = new rules[this.gameType.toString()](this.players, this.holes)
        this.ruleset.additionalListeners()
    },
    showPartResults: function() {
        views["partRes"].classList.toggle("collapsed")
        if (views["partRes"].classList.contains("collapsed")) {
            return
        }
        gameObject.ruleset.readInputs()
        let res = gameObject.ruleset.calculateScores()
        let container = views["partRes"].querySelector(".collapsing")
        container.innerHTML = ""
        if (!res) { return }
        Object.keys(res).forEach(player => {
            container.innerHTML += `<div class="player"><h4>${player}</h4>`
            for (const [key, val] of Object.entries(res[player])) {
                container.innerHTML += `<p><span>${key}</span> <span>${val}</span></p>\n`
            }
            container.innerHTML += "</div>"
        })
    },
    showResults: function(e) {
        e.preventDefault()

        gameObject.ruleset.readInputs()
        let points = gameObject.ruleset.calculateScores()
        let container = forms["keeper"].querySelector(".results")
        let rank
        if (this.ruleset.order == "desc") {
            rank = Object.entries(points).sort((a, b) => b[1]["points"] - a[1]["points"])
        } else {
            rank = Object.entries(points).sort((a, b) => a[1]["points"] - b[1]["points"])
        }
        let content = `<div class="col left"><h3>Rankning</h3>`
        rank.forEach(rank => {
            content += `<p>${rank[0]}</p>`
        })
        content += `</div>
        <div class="col right">
        <h3>Poäng</h3>`
        Object.keys(points).forEach(player => {
            content += `<div class="player"><h4>${player}</h4>`
            for (const [key, val] of Object.entries(points[player])) {
                content += `<p><span>${key}</span> <span>${val}</span></p>\n`
            }
            content += "</div>"
        })
        content += `</div>`
        
        container.innerHTML = content
    },
    readInputs: function() {
        let formData = new FormData(this.keeper)
        let points = {}
        for (let i = 1; i<=this.holes; i++) {
            points[i] = {
                "par": parseInt(formData.get(`par-${i}`)) || 0,
                "index": parseInt(formData.get(`index-${i}`)) || 0,
            }
            this.players.forEach(p => {
                points[i][p.name] = parseInt(formData.get(`${p.name}-${i}`)) || 0
            })
        }
        this.ruleset.setPoints(points)
    }
}


class GameRules {
    constructor(players, holes) {
        this.players = players
        this.holes = holes
        this._points = {}
        this.order = "asc"
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
        let formData = new FormData(forms["keeper"])
        let points = {}
        for (let i = 1; i<=this.holes; i++) {
            points[i] = {
                "par": parseInt(formData.get(`par-${i}`)) || 0,
                "index": parseInt(formData.get(`index-${i}`)) || 0,
            }
            this.players.forEach(p => {
                points[i][p.name] = parseInt(formData.get(`${p.name}-${i}`)) || 0
            })
        }
        this.setPoints(points)
    }

    calculateScores() {
        let total = {}
        this.players.map((player) => {
            let score = {
                points: 0,
                par: 0,
                handicap: 0
            }
            Object.keys(this._points).forEach(key => {
                let par = this._points[key]["par"]
                let point = this._points[key][player.name]
                score.points += point
                score.par += point - par
                score.handicap += point - player.handicap/18
            })
            total[player.name] = score
        })
        console.log(total)
        return total
    }

    additionalListeners() {
        return
    }
}


const rules = {
    forms: [],
    implemented: ["shotcomp","pointbogey","matchgame"],
    matchgame: class MatchGame extends GameRules {
        constructor(players, holes) {
            super(players, holes)
            this.order = "desc"
        }

        readInputs() {
            let formData = new FormData(forms["keeper"])
            let points = {}
            for (let i = 1; i<=this.holes; i++) {
                points[i] = {
                    "par": parseInt(formData.get(`par-${i}`)) || 0,
                    "index": parseInt(formData.get(`index-${i}`)) || 0,
                    "winner": formData.get(`winner-${i}`) || null
                }
                this.players.forEach(p => {
                    points[i][p.name] = parseInt(formData.get(`${p.name}-${i}`)) || 0
                })
            }
            this.setPoints(points)
            console.log(points)
        }

        additionalListeners() {
            for (let i = 1; i<= this.holes; i++) {
                this.players.forEach(p => {
                    document.getElementsByName(`${p.name}-${i}`)[0].addEventListener("change", () => this.calculateWinner(i))
                })
            }
        }

        calculateWinner(hole) {
            const formData = new FormData(forms["keeper"])
            let holePoints = {}
            let index = parseInt(formData.get(`index-${hole}`)) || 0
            let minHcp = Math.min(...this.players.map(p => p.handicap))
            this.players.forEach(p => {
                const hcp = p.handicap - minHcp
                // console.log(hcp)
                let extra_par = 0
                if (index <= hcp) {
                    extra_par = Math.floor(hcp/18)
                    if (index <= hcp % 18) {
                        extra_par++
                    }
                }
                holePoints[p.name] = (formData.get(`${p.name}-${hole}`) || 999) - extra_par
            })
            let lowest = Math.min(...Object.values(holePoints))
            let winners = []
            for (const [player, score] of Object.entries(holePoints)) {
                if (score == lowest) {
                    winners.push(player)
                }
            }
            console.log(lowest, holePoints, winners)
            if (winners.length == 1) {
                document.getElementById(`winner-${hole}-${winners[0].replace(" ", "-")}`).click()
            } else {
                document.getElementsByName(`winner-${hole}`).forEach(ele => {ele.checked = false})
            }
        }

        calculateScores() {
            let total = {}
            this.players.map((player) => {
                total[player.name] = {
                    par: 0,
                    player_par: 0,
                    hits: 0,
                    points: 0
                }
            })
            let minHcp = Math.min(...this.players.map(p => p.handicap))
            Object.keys(this._points).forEach(key => {
                let holePoints = []
                this.players.map((player) => {
                    let par = this._points[key]["par"]
                    let index = this._points[key]["index"]
                    let extra_par = 0
                    let hits = this._points[key][player.name]
                    const hcp = player.handicap - minHcp
                    if (hits <= 0 || !hits) {
                        let points = 0
                        if (this._points[key]["winner"] == player.name){
                            total[player.name].points += 1
                        }
                        holePoints.push([points, player.name])
                        return
                    }
                    if (index <= hcp) {
                        // index shit
                        extra_par = Math.floor(hcp/18)
                        if (index <= hcp % 18) {
                            extra_par++
                        }
                    }
                    total[player.name].par += par
                    total[player.name].player_par += par + extra_par
                    total[player.name].hits += hits
                    
                    let points = hits - extra_par
                    holePoints.push([points, player.name])
                    // total[player].points += points
                })
                if (!holePoints) {return}
                let lowest = Math.min(...holePoints.map(x => x[0]))
                // console.log(lowest, holePoints)
                let winners = []
                holePoints.forEach(x => {
                    // console.log(x[0])
                    if (x[0] && x[0] == lowest) {
                        // total[x[1]].points += 1
                        winners.push(x[1])
                    }
                })

                if (winners.length == 1) {
                    total[winners[0]].points += 1
                }
            })

            console.log(total)
            return total
        }
    },
    pointbogey: class PointBogey extends GameRules {
        constructor(players, holes) {
            super(players, holes)
            this.order = "desc"
        }

        calculateScores() {
            let total = {}
            this.players.map((player) => {
                let score = {
                    par: 0,
                    player_par: 0,
                    hits: 0,
                    points: 0
                }
                Object.keys(this._points).forEach(key => {
                    let par = this._points[key]["par"]
                    let index = this._points[key]["index"]
                    let player_par = par 
                    let hits = this._points[key][player.name]
                    if (hits <= 0) {return}
                    if (index <= player.handicap) {
                        // index shit
                        player_par += Math.floor(player.handicap/18)
                        if (index <= player.handicap % 18) {
                            player_par++
                        }
                    }
                    score.par += par
                    score.player_par += player_par
                    score.hits += hits
                    
                    let points = 2 - (hits - player_par)
                    if (points < 0) {
                        points = 0
                    }
                    score.points += points
                })
                total[player.name] = score
            })
            console.log(total)
            return total
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
                    points: 0,
                    par: 0,
                    handicap: 0
                }
                Object.keys(this._points).forEach(key => {
                    let point = this._points[key][player.name]
                    if (!point) {return}
                    score.par += this._points[key]["par"]
                    
                    score.points += point
                    
                    let index = this._points[key]["index"]
                    let player_par = 0
                    if (index <= player.handicap) {
                        // index shit
                        player_par += Math.floor(player.handicap/18)
                        if (index <= player.handicap % 18) {
                            player_par++
                        }
                    }
                    score.handicap += point - player_par
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
// let pla = [
//     {name: "bertil", handicap: 5},
//     {name: "pertil", handicap: 20}
// ]
// const test = new rules["shotcomp"](pla, 9)
// test.points = {
//     1: {
//         "par": 4,
//         "bertil": 5,
//         "pertil": 10
//     },
//     2: {
//         "par": 4,
//         "bertil": 5,
//         "pertil": 10
//     },
//     3: {
//         "par": 4,
//         "bertil": 5,
//         "pertil": 10
//     },
//     4: {
//         "par": 4,
//         "bertil": 5,
//         "pertil": 10
//     },
//     5: {
//         "par": 4,
//         "bertil": 5,
//         "pertil": 10
//     },
//     6: {
//         "par": 4,
//         "bertil": 5,
//         "pertil": 10
//     },
//     7: {
//         "par": 4,
//         "bertil": 5,
//         "pertil": 10
//     },
//     8: {
//         "par": 4,
//         "bertil": 5,
//         "pertil": 10
//     },
//     9: {
//         "par": 4,
//         "bertil": 5,
//         "pertil": 10
//     }
// }
// test.print()
// test.calculateScores()