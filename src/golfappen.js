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
const pos = {
    "partResExpanded": parseFloat(document.querySelector(".siteheader").offsetHeight),
    "partResCollapsed": (window.innerHeight - buttons["partRes"].offsetHeight - 2*elements.getProperty(views["partRes"], 'padding-top'))
}

const storage = window.sessionStorage

function createListeners() {
    // view switching
    buttons["new"].addEventListener("click", () => switchView("new"))
    buttons["continue"].addEventListener("click", () => switchView("play"))
    buttons["history"].addEventListener("click", () => switchView("history"))
    buttons["partRes"].addEventListener("click", () => gameObject.toggleOverlay())

    // navigation
    document.querySelector(".siteheader .logo").onclick = () => switchView("start")
    buttons["backFromNew"].addEventListener("click", () => switchView("start"))
    buttons["backFromHis"].addEventListener("click", () => switchView("start"))
    buttons["backFromPla"].addEventListener("click", () => switchView("new"))
    buttons["backFromPlay"].addEventListener("click", () => switchView("players"))
    buttons["prevHole"].addEventListener("click", () => {
        elements.scrollToPrev(forms["keeper"])
    })
    buttons["nextHole"].addEventListener("click", () => {
        elements.scrollToNext(forms["keeper"])
    })

    // form submits
    forms["newGame"].addEventListener("submit", (e) => gameObject.create(e))
    forms["players"].addEventListener("submit", (e) => gameObject.setUpPlayers(e))
    forms["keeper"].addEventListener("submit", (e) => gameObject.showResults(e))

    // swipe
    // views["partRes"].addEventListener("touchstart", (e) => elements.processTouchStart(e, views["partRes"], 
    //     views["partRes"].classList.contains("collapsed") ? pos["partResCollapsed"] : pos["partResExpanded"]), false)
    // views["partRes"].addEventListener("touchmove", (e) => elements.processTouchMove(e, views["partRes"], 
    //     views["partRes"].classList.contains("collapsed") ? pos["partResCollapsed"] : pos["partResExpanded"]), false)
    // views["partRes"].addEventListener("touchcancel", (e) => elements.processTouchCancel(e, views["partRes"], 
    //     views["partRes"].classList.contains("collapsed") ? pos["partResCollapsed"] : pos["partResExpanded"]), false)
    views["partRes"].addEventListener("touchend", (e) => elements.processTouchEnd(e, views["partRes"], 
        views["partRes"].classList.contains("collapsed") ? pos["partResCollapsed"] : pos["partResExpanded"]), false)

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
        if (playTypes[play].minPlayers > parseInt(playerCount.value)) {
            opt.disabled = true
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
    gameObject.playTypes = plays
    const courses = await data.loadGolfClubs()
    await data.loadClubData()
    populateNewGameForm(plays, courses)
    populateHistory()
}



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
    playTypes: [],
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
            let extraField = ``
            if (this.playTypes.find(x=>x["id"] == this.gameType)["team"]) {
                extraField = `<label>Lag: <input type="number" name="p${i}team" id="p${i}team" min="1" max="${Math.ceil(count/2)}"></label>`
            }
            playerForm.innerHTML += `
            <fieldset>
                <legend>Player ${i}</legend>
                <label>Namn: <input type="text" name="p${i}name" id="p${i}name"></label>
                <label>Spelhandicap: <input type="number" name="p${i}handicap" id="p${i}handicap"></label>
                ${extraField}
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
    toggleOverlay: function () {
        views["partRes"].classList.toggle("collapsed")
        if (!views["partRes"].classList.contains("collapsed")) {
            // console.log(document.querySelector(".siteheader").offsetHeight + "px")
            views["partRes"].style.top = parseFloat(document.querySelector(".siteheader").offsetHeight) + "px"
            views["partRes"].scrollTop = 0
            this.showPartResults()
        } else {
            // console.log((window.innerHeight - buttons["partRes"].offsetHeight - elements.getProperty(views["partRes"], 'padding-top')) + "px",elements.getProperty(views["partRes"], 'padding-top'))
            views["partRes"].style.top = (window.innerHeight - buttons["partRes"].offsetHeight - 2*elements.getProperty(views["partRes"], 'padding-top')) + "px"
            views["partRes"].scrollTop = 0
        }
    },
    showPartResults: function() {
        // views["partRes"].classList.toggle("collapsed")
        // if (views["partRes"].classList.contains("collapsed")) {
        //     return
        // }
        gameObject.ruleset.readInputs()
        let res = gameObject.ruleset.calculateScores()
        let container = views["partRes"].querySelector(".collapsing")
        container.innerHTML = ""
        if (!res) { return }
        let content = ""
        Object.keys(res).forEach(player => {
            content += `<div class="player"><h4>${player}</h4>`
            for (const [key, val] of Object.entries(res[player])) {
                content += `<p><span>${key}</span> <span>${val}</span></p>\n`
            }
            content += "</div>"
        })
        content += this.ruleset.generateScoreCard("h")
        content += this.ruleset.generateScoreCard("v")
        container.innerHTML = content
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
        content += this.ruleset.generateScoreCard("h")
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
        this.calculatedPoints = {}
        this.order = "asc"
        this.playernames = players.map(x => x.name)
        for (let i=1; i<=holes; i++) {
            this._points[i] = {
                "par": 0
            }
            this.playernames.forEach(name => this._points[i][name] = 0)
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

    calculatePoints () {
        let points = {}
        for (let i=1; i<=this.holes; i++) {
            points[i] = {}
            this.players.forEach(player => {
                points[i][player.name] = 0
                if (!this._points[i][player.name]) { return }
                let extra = this.calculatePlayerPar(player.handicap, this._points[i].index)
                points[i][player.name] = extra < this._points[i][player.name] ? this._points[i][player.name] - extra : 0
            })
        }
        this.calculatedPoints = points
        return points
    }

    calculateScores() {
        this.calculatePoints()
        let total = {}
        this.players.map((player) => {
            let score = {
                shots: 0,
                points: 0,
                par: 0
            }
            Object.keys(this._points).forEach(key => {
                if (!this._points[key][player.name]) { return }
                score.par += this._points[key]["par"]
                score.shots += this._points[key][player.name]
                score.points += this.calculatedPoints[key][player.name]
            })
            total[player.name] = score
        })
        console.log(total)
        return total
    }

    additionalListeners() {
        return
    }

    generateScoreCard(dir="h") {
        let tbl = `<div class="horizontal-scroll">`
        console.log(this._points)
        if (dir == "h" || dir.includes("h")) {
            tbl += `<table class="scorecard horizontal">
            <tr>
                <th colspan="2">Hole</th>`
            for (let i=1; i<=this.holes; i++) {
                tbl += `<td>${i}</td>`
            }
            tbl += `</tr>
            <tr>
                <th colspan="2">Par</th>
                ${Object.values(this._points).map(hole => `<td>${hole.par}</td>`).join("\n")}
            </tr>
            <tr>
                <th colspan="2">Index</th>
                ${Object.values(this._points).map(hole => `<td>${hole.index}</td>`).join("\n")}
            </tr>`
            tbl += this.playernames.map(player => `<tr>
                <th colspan="2">${player}</th>
                ${Object.values(this._points).map(hole => `<td>${hole[player]}</td>`).join("\n")}
                </tr>
                <tr><th>Slag</th><th>Poäng</th>
                ${Object.values(this.calculatedPoints).map(hole => `<td>${hole[player]}</td>`).join("\n")}
                </tr>
                `).join("\n")

        } else {
            tbl += `<table class="scorecard vertical">
            <tr>
                <th rowspan="2">Hole</th>
                <th rowspan="2">Par</th>
                <th rowspan="2">Index</th>
            `
            tbl += this.playernames.map(player => `<th colspan="2">${player}</th>`).join("\n")
            tbl += `</tr><tr>`
            tbl += `<th>Slag</th><th>Poäng</th>\n`.repeat(this.playernames.length)
            tbl += `</tr>`
            for (let i=1; i<=this.holes; i++) {
                tbl += `
                <tr>
                    <td>${i}</td>
                    <td>${this._points[i].par}</td>
                    <td>${this._points[i].index}</td>
                    ${this.playernames.map(player => `<td>${this._points[i][player]}</td><td>${this.calculatedPoints[i][player]}</td>`).join("\n")}
                </tr>
                `
            }
        }
        tbl += `</table></div>`
        return tbl
    }

    calculatePlayerPar(hcp, index) {
        let extra_par = 0
        if (index <= hcp) {
            extra_par = Math.floor(hcp/18)
            if (index <= hcp % 18) {
                extra_par++
            }
        }
        return extra_par
    }
}


const rules = {
    forms: [],
    implemented: ["shotcomp","pointbogey","matchgame", "shotgolf", "copenhagener"],
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
                let extra_par = this.calculatePlayerPar(hcp, index)
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

        calculatePoints () {
            let points = {}
            
            let minHcp = Math.min(...this.players.map(p => p.handicap))
            for (let i=1; i<=this.holes; i++) {
                points[i] = {}
                let holePoints = []
                this.players.map((player) => {
                    points[i][player.name] = 0
                    let index = this._points[i]["index"]
                    let hits = this._points[i][player.name]
                    const hcp = player.handicap - minHcp
                    let extra_par = this.calculatePlayerPar(hcp, index)
                    if (hits <= 0 || !hits) {
                        if (this._points[i]["winner"] == player.name){
                            points[i][player.name] = 1
                        }
                        return
                    }

                    holePoints.push([hits-extra_par, player.name])
                })
                if (!holePoints) {continue}
                let lowest = Math.min(...holePoints.map(x => x[0]))
                // console.log(lowest, holePoints)
                if (lowest >= 998) {continue}
                let winners = []
                holePoints.forEach(x => {
                    // console.log(x[0])
                    if (x[0] && x[0] == lowest) {
                        // total[x[1]].points += 1
                        winners.push(x[1])
                    }
                })

                if (winners.length == 1) {
                    points[i][winners[0]] = 1
                }
            }
            this.calculatedPoints = points
            console.log(points)
            return points
        }
    },
    pointbogey: class PointBogey extends GameRules {
        constructor(players, holes) {
            super(players, holes)
            this.order = "desc"
        }
        calculatePoints () {
            let points = {}
            for (let i=1; i<=this.holes; i++) {
                points[i] = {}
                this.players.forEach(player => {
                    points[i][player.name] = 0
                    let hits = this._points[i][player.name]
                    if (!hits) { return }
                    let par = this._points[i]["par"]
                    let index = this._points[i]["index"]
                    let player_par = par + this.calculatePlayerPar(player.handicap, index)
                    let point = 2 - (hits - player_par)
                    if (point < 0) {
                        point = 0
                    }
                    points[i][player.name] = point
                })
            }
            this.calculatedPoints = points
            return points
        }
    },
    shotcomp: class ShotCompetition extends GameRules {
        constructor(players, holes) {
            super(players, holes)
        }
    },
    shotgolf: class ShotGolf extends GameRules {
        constructor(players, holes) {
            super(players, holes)
        }
        calculatePoints () {
            let points = {}
            for (let i=1; i<=this.holes; i++) {
                points[i] = {}
                this.players.forEach(player => {
                    points[i][player.name] = 0
                    let point = this._points[i][player.name]
                    if (!this._points[i][player.name]) { return }
                    let par = this._points[i]["par"]
                    let extra = this.calculatePlayerPar(player.handicap, this._points[i].index)
                    let hcpPoint = point - extra
                    let max = par + 5
                    points[i][player.name] += hcpPoint > max ? max : hcpPoint
                })
            }
            this.calculatedPoints = points
            return points
        }

        calculateScores() {
            // Set max shots
            this.players.map((player) => {
                Object.keys(this._points).forEach(key => {
                    let point = this._points[key][player.name]
                    if (!point) { return }
                    let par = this._points[key]["par"]
                    let max = par + 5
                    this._points[key][player.name] = point < max ? point : max
                })
            })
            return super.calculateScores()
        }
    },
    copenhagener: class Copenhagener extends GameRules {
        constructor(players, holes) {
            super(players, holes)
            this.order = "desc"
            this.distributed_points = {}
        }

        calculateHolePoints (score) {
            let res = {}
            let adjHits = []
            this.players.forEach(player => {
                if (!score[player.name]) {
                    this.playernames.map(name => res[name] = 0)
                    return res
                }
                let extra = this.calculatePlayerPar(player.handicap, score.index)
                adjHits.push([score[player.name]-extra, player.name])
            })
            adjHits.sort((a,b) => a[0] - b[0])
            const first = adjHits.filter(x => x[0] === adjHits[0][0])
            const second = adjHits.filter(x => x[0] === adjHits[1][0])
            const third = adjHits.filter(x => x[0] === adjHits[2][0])
            if (adjHits.length == 3) {
                if (first.length === 3) {
                    first.forEach(score => {
                        res[score[1]] = 2
                    })
                } else if (first.length === 2) {
                    res[adjHits[0][1]] = 3
                    res[adjHits[1][1]] = 3
                    res[adjHits[2][1]] = 0
                } else {
                    res[adjHits[0][1]] = 4
                    if (second.length === 2) {
                        res[adjHits[1][1]] = 1
                        res[adjHits[2][1]] = 1
                    } else {
                        res[adjHits[1][1]] = 2
                        res[adjHits[2][1]] = 0
                    }
                    
                }
            } else if (adjHits.length == 4) {
                if (first.length === 4) {
                    first.forEach(score => {
                        res[score[1]] = 3
                    })
                } else if (first.length === 3) {
                    res[adjHits[0][1]] = 4
                    res[adjHits[1][1]] = 4
                    res[adjHits[2][1]] = 4
                    res[adjHits[3][1]] = 0
                } else if (first.length === 2) {
                    if (second.length === 2) {
                        res[adjHits[0][1]] = 5
                        res[adjHits[1][1]] = 5
                        res[adjHits[2][1]] = 1
                        res[adjHits[3][1]] = 1
                    } else {
                        res[adjHits[0][1]] = 5
                        res[adjHits[1][1]] = 5
                        res[adjHits[2][1]] = 2
                        res[adjHits[3][1]] = 0
                    }
                } else {
                    res[adjHits[0][1]] = 6
                    if (second.length === 3) {
                        res[adjHits[1][1]] = 2
                        res[adjHits[2][1]] = 2
                        res[adjHits[3][1]] = 2
                    } else if (second.length === 2) {
                        res[adjHits[1][1]] = 2
                        res[adjHits[2][1]] = 2
                        res[adjHits[3][1]] = 0
                    } else {
                        res[adjHits[1][1]] = 4
                        if (third.length == 2) {
                            res[adjHits[2][1]] = 1
                            res[adjHits[3][1]] = 1
                        } else {
                            res[adjHits[2][1]] = 2
                            res[adjHits[3][1]] = 0
                        }
                    }
                }
            } else {
                for (let i=0; i<adjHits.length; i++) {
                    if (i > 1) {
                        res[adjHits[i][1]] = 0
                        continue
                    }
                    res[adjHits[i][1]] = 4 - 2*i
                }
            }
            return res
        }

        calculatePoints() {
            let points = {}
            for (let i=1; i<=this.holes; i++) {
                points[i] = this.calculateHolePoints(this._points[i])
            }
            this.calculatedPoints = points
            return points
        }
    },
    nassau: class Nassau extends GameRules {
        constructor(players, holes) {
            super(players, holes)
        }
    },
    foursome: class Foursome extends GameRules {
        constructor(players, holes) {
            super(players, holes)
        }
        calculateHcp (hcps) {
            let res = 0
            hcps.map(h=>res += h*0.5)
            return Math.round(res)
        }
    },
    greensome: class Greensome extends GameRules {
        constructor(players, holes) {
            super(players, holes)
        }
        calculateHcp (hcps) {
            let res = Math.min(...hcps)*0.6 + Math.max(...hcps)*0.4

            return Math.round(res)
        }
    },
    irishgreen: class IrishGreensome extends GameRules {
        constructor(players, holes) {
            super(players, holes)
        }
        calculateHcp (hcps) {
            let res = Math.min(...hcps)*0.6 + Math.max(...hcps)*0.4

            return Math.round(res)
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
    flagcomp: class FlagComp extends GameRules {
        constructor(players, holes) {
            super(players, holes)
        }
    },
    threadcomp: null,
    kicker: null
}

rules.threadcomp = rules.shotgolf
rules.kicker = rules.shotgolf

setup() // run setup