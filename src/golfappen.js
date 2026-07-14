/**
 * @module golfappen
 */

import { getFile } from "./modules/files.js"
import { elements } from "./modules/elements.js"

// declare variables
const main = document.querySelector(".wrapper")
const storage = window.sessionStorage
const views = {
    "start": document.getElementById("startView"),
    "new": document.getElementById("newView"),
    "play": document.getElementById("playView"),
    "score": document.getElementById("scoreView"),
    "history": document.getElementById("historyView"),
    "players": document.getElementById("playersView"),
    "partRes": document.getElementById("partialResults"),
    "typeInfo": document.getElementById("typeInfoWindow")
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
    "prevHole": document.querySelector("#keeper-nav .left"),
    "typeInfo": document.getElementById("gameTypeInfo")
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

function createListeners() {
    // view switching
    buttons["new"].addEventListener("click", () => switchView("new"))
    buttons["continue"].addEventListener("click", () => gameObject.resumeLatest())
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
    forms["keeper"].onchange = () => gameObject.cacheGame()

    // swipe
    views["partRes"].addEventListener("touchstart", (e) => elements.processTouchStart(e, views["partRes"], 
        views["partRes"].classList.contains("collapsed") ? pos["partResCollapsed"] : pos["partResExpanded"]), false)
    // views["partRes"].addEventListener("touchmove", (e) => elements.processTouchMove(e, views["partRes"], 
    //     views["partRes"].classList.contains("collapsed") ? pos["partResCollapsed"] : pos["partResExpanded"]), false)
    views["partRes"].addEventListener("touchcancel", (e) => elements.processTouchCancel(e, views["partRes"], 
        views["partRes"].classList.contains("collapsed") ? pos["partResCollapsed"] : pos["partResExpanded"]), false)
    views["partRes"].addEventListener("touchend", (e) => elements.processTouchEnd(e, views["partRes"], 
        views["partRes"].classList.contains("collapsed") ? pos["partResCollapsed"] : pos["partResExpanded"]), false)
    
    window.onresize = () => reloadOverlayPos()
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
        let divisible = true
        if (playTypes[play].team) {
            divisible = Array.isArray(playTypes[play].teamSize) ? playTypes[play].teamSize.find(x => parseInt(playerCount.value) % x === 0) : parseInt(playerCount.value) % playTypes[play].teamSize === 0
        }

        if (playTypes[play].minPlayers > parseInt(playerCount.value) 
            || !divisible) {
            opt.disabled = true
        }
        gameSelect.add(opt)
    }

    // Limit options after players
    playerCount.addEventListener("change", (e) => {
        let num = parseInt(e.target.value)
        let unavailable = playTypes.filter(x => {
            let divisible = true
            if (x.team) {
                divisible = Array.isArray(x.teamSize) ? x.teamSize.find(x => num % x === 0) : num % x.teamSize === 0
            }
            return x.minPlayers > num || !divisible
        }).map(x => x.id)
        gameSelect.querySelectorAll("option").forEach(opt => {
            opt.disabled = unavailable.includes(opt.value)
            if (!opt.value) {
                opt.disabled = true
            }
        })
        if (unavailable.includes(gameSelect.value)) {
            gameSelect.selectedIndex = 0
        }
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

function reloadOverlayPos() {
    console.log("resize")
    pos["partResExpanded"] = parseFloat(document.querySelector(".siteheader").offsetHeight),
    pos["partResCollapsed"] = (window.innerHeight - buttons["partRes"].offsetHeight - 2*elements.getProperty(views["partRes"], 'padding-top'))
    views["partRes"].style.top = pos["partResCollapsed"] + "px"
}

const infoWindow = {
    window: document.getElementById("typeInfoWindow"),
    button: document.getElementById("gameTypeInfo"),
    init: function(plays) {
        this.button.onclick = (e) => this.open(e)
        let content = `<button class="close-button">X</button>`
        content += plays.map(play => {
            return `
            <h3>${play.name}</h3>
            <p>${play.desc}</p>
            `
        }).join("\n")
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

async function setup() {
    createListeners()
    const plays =  await data.loadPlayTypes()
    gameObject.playTypes = plays
    const courses = await data.loadGolfClubs()
    await data.loadClubData()
    populateNewGameForm(plays, courses)
    infoWindow.init(plays)
}



// repeatable functions
function switchView(newView) {
    if (!(newView in views)) {return}
    let currView = document.querySelector("section.visible")
    currView.classList.replace("visible", "hidden")

    views[newView].classList.replace("hidden", "visible")
    if (newView == "play") {
        reloadOverlayPos()
        gameObject.cacheGame()
    } else if (newView == "history") {
        historyManager.populateHistory()
    }
}



const gameObject = {
    view: views["play"],
    keeper: forms["keeper"],
    ruleset: null,
    playerCount: 0,
    holes: 18,
    gameType: null,
    club: null,
    course: null,
    players: [],
    playTypes: [],
    play: null,
    teamCount: null,
    teamSize: 1,
    time: null,
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
        this.play = this.playTypes.find(x => x.id === this.gameType)
        if (!this.play.team) {
            for (let i = 1; i<=count; i++) {
                let extraField = ``
                let exists = this.players && this.players.length >= i && this.players[i-1] ? this.players[i-1] : null
                if (this.playTypes.find(x=>x["id"] == this.gameType)["team"]) {
                    extraField = `<label>Lag: <input type="number" name="p${i}team" id="p${i}team" min="1" max="${Math.ceil(count/2)}"></label>`
                }
                playerForm.innerHTML += `
                <fieldset>
                    <legend>Player ${i}</legend>
                    <label>Namn: <input type="text" name="p${i}name" id="p${i}name" value="${exists.name?exists.name:""}"></label>
                    <label>Spelhandicap: <input type="number" name="p${i}handicap" id="p${i}handicap" value="${exists.handicap?exists.handicap:""}"></label>
                    ${extraField}
                </fieldset>
                `
            }
            playerForm.innerHTML += `<input type="submit" name="submit" value="Klar">`
        } else {
            this.teamSize = this.play.teamSize
            if (Array.isArray(this.teamSize)) {
                this.teamSize = Math.max(...this.teamSize.filter(x => count % x === 0))
            }
            this.teamCount = count / this.teamSize
            let content = ``
            for (let i = 1; i<=count; i++) {
                let exists = this.players && this.players.length >= i && this.players[i-1] ? this.players[i-1] : null
                let membNum = i % this.teamSize
                let teamNum = Math.ceil(i/this.teamSize)
                // if (this.playTypes.find(x=>x["id"] == this.gameType)["team"]) {
                //     extraField = `<label>Lag: <input type="number" name="p${i}team" id="p${i}team" min="1" max="${Math.ceil(count/2)}"></label>`
                // }
                if (membNum === 1) {
                    content += `<fieldset><legend>Lag ${teamNum}</legend>`
                }
                content += `
                <fieldset>
                    <legend>Player ${i}</legend>
                    <label>Namn: <input type="text" name="p${i}name" id="p${i}name" value="${exists.name?exists.name:""}"></label>
                    <label>Spelhandicap: <input type="number" name="p${i}handicap" id="p${i}handicap" value="${exists.handicap?exists.handicap:""}"></label>
                </fieldset>
                `
                if (membNum === 0) {
                    content += `</fieldset>`
                }
            }
            content += `<input type="submit" name="submit" value="Klar">`
            playerForm.innerHTML = content
        }
    },
    setUpPlayers: function(e) {
        e.preventDefault()
        const data = new FormData(e.target)
        // console.log([...data.entries()])
        let players = []
        for (let i = 1; i<=this.playerCount; i++) {
            let player = {
                "name": data.get(`p${i}name`) || `Spelare ${i}`,
                "handicap": parseFloat(data.get(`p${i}handicap`)) || 0
            }
            if (this.play.team) {
                player.team = Math.ceil(i/this.teamSize)
            }
            players.push(player)
        }
        console.log(players, this.players)
        if (players.map(x=>x.name).sort().join(',') === this.players.map(x=>x.name).sort().join(',')) {
            this.players = players
            switchView("play")
        } else {
            this.players = players
            this.openScoreKeeper()
        }
    },
    openScoreKeeper: function() {
        this.time = new Date()
        switchView("play")
        this.ruleset = new rules[this.gameType.toString()](this.players, this.holes)
        console.log(this.gameType, this.players)
        this.keeper.innerHTML = ""

        for (let i = 1; i<=this.holes; i++) {
            this.keeper.innerHTML += this.ruleset.holeForm(i)
        }
        this.keeper.innerHTML += `<div class="col white">
            <input type="submit" value="Räkna ut resultat">
            <div class="results row cols-2"></div>
        </div>`
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
        content += this.ruleset.generateScoreCard("v")
        // content += this.ruleset.generateScoreCard("h")
        Object.keys(res).forEach(player => {
            content += `<div class="player"><h4>${player}</h4>`
            for (const [key, val] of Object.entries(res[player])) {
                content += `<p><span>${key}</span> <span>${val}</span></p>\n`
            }
            content += "</div>"
        })
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
        content += this.ruleset.generateScoreCard("v")
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
    },
    cacheGame: function() {
        const date = this.time.toISOString()
        this.ruleset?.readInputs()
        const gameData = {
            playerCount: this.playerCount,
            players: this.players,
            holes: this.holes,
            gameType: this.gameType,
            club: this.club,
            course: this.course,
            teamCount: this.teamCount,
            teamSize: this.teamSize,
            time: date,
            scores: this.ruleset?.points || []
        }
        historyManager.updateHistory(date)
        historyManager.setGame(date, gameData)
        console.log(gameData)
    },
    resumeGame: async function(game) {
        if (typeof game == 'string' || game instanceof String) {
            game = game.length > 25 ? JSON.parse(game) : historyManager.getGame(game)
        }
        this.playerCount = game.playerCount
        this.players = game.players
        this.holes = game.holes
        this.gameType = game.gameType
        this.club = game.club
        this.course = game.course
        this.teamCount = game.teamCount
        this.teamSize = game.teamSize
        this.time = new Date(game.time)
        
        if (this.course) {
            await this.loadCourseData()
        }
        this.fillSetupInputs()
        this.openScoreKeeper()
        this.ruleset.points = game.scores
        this.ruleset.fillInputs()
        console.log(game.scores)

    },
    resumeLatest: function() {
        const latest = historyManager.getLatest()
        this.resumeGame(latest)
    },
    fillSetupInputs: async function() {
        document.getElementById("playerCount").value = this.playerCount
        document.getElementById("holeCount").value = this.holes
        document.getElementById("gameType").value = this.gameType
        if (this.club) {
            const courseSelect = document.getElementById("golfCourse")
            document.getElementById("golfClub").value = this.club
            const clubData = await data.getClubData(this.club)
            courseSelect.innerHTML = `<option selected disabled>Välj golfbana</option>`
            if (!clubData || !clubData?.club?.courses) {
                courseSelect.disabled = true
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
        }
        if (this.course) {
            document.getElementById("golfCourse").value = this.course
        }
        this.openPlayerSetup(this.playerCount)
    }
}

const historyManager = {
    createList: function() {},
    getGame: function(date) {
        return JSON.parse(storage.getItem(date) || "{}")
    },
    setGame: function(date, data) {
        return storage.setItem(date, JSON.stringify(data))
    },
    getHistory: function(order="desc") {
        const prev = JSON.parse(storage.getItem("games") || "[]")
        prev.sort((a, b) => {
            return order=="desc" ? new Date(b) - new Date(a) : new Date(a) - new Date(b)
        })
        return prev
    },
    updateHistory: function(date) {
        const prev = this.getHistory("asc")
        if (!prev.includes(date)) {
            prev.push(date)
            storage.setItem("games", JSON.stringify(prev))
        }
    },
    getLatest: function() {
        const his = this.getHistory()
        return this.getGame(his[0])
    },
    populateHistory: function() {
        const games = this.getHistory()
        document.querySelector("#historyView .list").innerHTML = games.map(x => {
            return `<p>${x}</p>`
        }
        )
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

    fillInputs() {
        if (!this._points || Array.isArray(this._points)) {return}
        console.log(this._points)
        for (let i = 1; i<=this.holes; i++) {
            let par = this._points[i].par
            let ind = this._points[i].index
            if (gameObject.courseData && gameObject.courseData.holes[i-1]) {
                document.getElementsByName(`par-${i}`)[0].value = gameObject.courseData.holes[i-1].par
                document.getElementsByName(`index-${i}`)[0].value = gameObject.courseData.holes[i-1].index
            } else {
                if (par && par !== 0) {
                    document.getElementsByName(`par-${i}`)[0].value = par
                }
                if (ind && ind !== 0) {
                    document.getElementsByName(`index-${i}`)[0].value = ind
                }
            }

            this.players.forEach(p => {
                let pts = this._points[i][p.name]
                if (pts && pts !== 0) {
                    document.getElementsByName(`${p.name}-${i}`)[0].value = pts
                }
            })
        }
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
            let sum = {
                par: 0,
                index: 0
            }
            this.playernames.map(player => sum[player] = [0, 0])
            for (let i=1; i<=this.holes; i++) {
                sum.par += this._points[i].par
                sum.index += this._points[i].index
                this.playernames.map(player => {
                    sum[player][0] += this._points[i][player]
                    sum[player][1] += this.calculatedPoints[i][player]
                })
                tbl += `
                <tr${i == 9 || i == this.holes?' class="last-row"': ""}>
                    <td>${i}</td>
                    <td>${this._points[i].par}</td>
                    <td>${this._points[i].index}</td>
                    ${this.playernames.map(player => `<td>${this._points[i][player]}</td><td>${this.calculatedPoints[i][player]}</td>`).join("\n")}
                </tr>
                `
                if (i == 9 || i == this.holes) {
                    tbl += `
                    <tr class="sum-row">
                        <th>Summa</th>
                        <td>${sum.par}</td>
                        <td></td>
                        ${this.playernames.map(player => `<td>${sum[player][0]}</td><td>${sum[player][1]}</td>`).join("\n")}
                    </tr>`
                }
            }
        }
        tbl += `</table></div>`
        return tbl
    }

    calculatePlayerPar(hcp, index) {
        let extra_par = 0
        if (hcp && index <= hcp) {
            extra_par = Math.floor(hcp/18)
            if (index <= hcp % 18) {
                extra_par++
            }
        }
        return extra_par
    }

    holeForm(hole) {
        const inputFields = this.players.map(player => {
            return `<label>${player.name} (${player.handicap}hcp): <input type="number" name="${player.name}-${hole}" min="0" max="999"></label>`
        })
        let parVal = ""
        let indVal = ""
        if (gameObject.courseData) {
            parVal = ` value="${gameObject.courseData.holes[hole-1].par}"`
            indVal = ` value="${gameObject.courseData.holes[hole-1].index}"`
        }
        return `
        <div class="col white hole" id="hole${hole}">
            <h3>Hål ${hole}</h3>
            <label>Par: <input type="number" name="par-${hole}" min="1" max="99"${parVal}></label>
            <label class="separate">Index: <input type="number" name="index-${hole}" min="1" max="99"${indVal}></label>
            ${inputFields.join("\n")}
        </div>
        `
    }
}

class Nassau extends GameRules {
    constructor(players, holes) {
        super(players, holes)
        this.winners = {}
        this.sumPoints = {}
    }

    calculateScores() {
        this.calculatePoints()
        let total = {}
        let half = Math.round(this.holes / 2)
        let points = this.calculatedPoints
        this.players.map((player) => {
            let score = {
                firstHalf: 0,
                secondHalf: 0,
                total: 0
            }
            Object.keys(points).forEach(key => {
                if (!points[key][player.name]) { return }
                let pts = points[key][player.name]
                score.total += pts
                if (key <= half) {
                    score.firstHalf += pts
                } else {
                    score.secondHalf += pts
                }
            })
            total[player.name] = score
        })
        console.log(total)
        this.sumPoints = total
        this.calculateWinners()
        return total
    }

    calculateWinners() {
        const res = this.sumPoints
        this.winners = {
            firstHalf: null,
            secondHalf: null,
            total: null
        }

        let firstSorted = [...Object.entries(res)].toSorted((a, b) => this.order=="asc" ? a[1].firstHalf - b[1].firstHalf: b[1].firstHalf - a[1].firstHalf)
        let secondSorted = [...Object.entries(res)].toSorted((a, b) => this.order=="asc" ? a[1].secondHalf - b[1].secondHalf: b[1].secondHalf - a[1].secondHalf)
        let totalSorted = [...Object.entries(res)].toSorted((a, b) => this.order=="asc" ? a[1].total - b[1].total: b[1].total - a[1].total)
        let firstWin = firstSorted.filter(x => x[1].firstHalf == firstSorted[0][1].firstHalf).map(x => x[0])
        let secondWin = secondSorted.filter(x => x[1].secondHalf == secondSorted[0][1].secondHalf).map(x => x[0])
        let totalWin = totalSorted.filter(x => x[1].total == totalSorted[0][1].total).map(x => x[0])
        if (firstSorted[0][1].firstHalf > 0) {
            this.winners.firstHalf = firstWin.length == 1 ? firstWin[0] : firstWin
        }
        if (secondSorted[0][1].secondHalf > 0) {
            this.winners.secondHalf = secondWin.length == 1 ? secondWin[0] : secondWin
        }

        if (totalSorted[0][1].total > 0) {
            this.winners.total = totalWin.length == 1 ? totalWin[0] : totalWin
        }

        return this.winners
    }

    generateScoreCard(dir="h") {
        let tbl = super.generateScoreCard(dir)
        if (!this.winners) {this.calculateScores()}
        const w = this.winners
        let resStr = `
        <table class="scorecard">
            <tr>
                <th>Del</th>
                <th>Vinnare</th>
            </tr>
            <tr>
                <td>Första halvan</td>
                <td>${Array.isArray(w.firstHalf) ? w.firstHalf.join(", "): w.firstHalf}</td>
            </tr>
            <tr>
                <td>Andra halvan</td>
                <td>${Array.isArray(w.secondHalf) ? w.secondHalf.join(", "): w.secondHalf}</td>
            </tr>
            <tr>
                <td>Totalt</td>
                <td>${Array.isArray(w.total) ? w.total.join(", ") : w.total}</td>
            </tr>
        </table>`
        return tbl + resStr
    }
}

class GolfSome extends GameRules {
    constructor(players, holes) {
        super(players, holes)
    }

    holeForm(hole) {
        let content = ""
        // const inputFields = this.players.map(player => {
        //     return `<label>${player.name}: <input type="number" name="${player.name}-${hole}" min="0" max="999"></label>`
        // })
        let parVal = ""
        let indVal = ""
        if (gameObject.courseData) {
            parVal = ` value="${gameObject.courseData.holes[hole-1].par}"`
            indVal = ` value="${gameObject.courseData.holes[hole-1].index}"`
        }

        content = `
        <div class="col white hole" id="hole${hole}">
            <h3>Hål ${hole}</h3>
            <label>Par: <input type="number" name="par-${hole}" min="1" max="99"${parVal}></label>
            <label class="separate">Index: <input type="number" name="index-${hole}" min="1" max="99"${indVal}></label>`

        for (let i=1; i<=gameObject.teamCount; i++) {
            content += `<fieldset><legend>Lag ${i}</legend><label>Utslag:</label>
            <div class="horizontal-radio-buttons teeshot-radios">`
            content += this.players.map(player => {
                if (player.team == i) {
                    return `<span><input type="radio" name="teeshot-t${i}-${hole}" value="${player.name}" id="teeshot-${hole}-${player.name.replace(" ", "-")}">
                    <label for="teeshot-${hole}-${player.name.replace(" ", "-")}">${player.name}</label></span>`
                }
            }).join("\n")
            content += `</div><label>Slag: <input type="number" name="team${i}-${hole}" min="0" max="999"></label></fieldset>`
        }

        content += `</div>`

        return content
    }

    calculateHcp (team) {
        let hcps = this.players.filter(x => x.team == team).map(x=>x.handicap)
        let res = 0
        hcps.map(h=>res += h*0.5)
        return Math.round(res)
    }


    readInputs() {
        let formData = new FormData(forms["keeper"])
        let points = {}
        for (let i = 1; i<=this.holes; i++) {
            points[i] = {
                "par": parseInt(formData.get(`par-${i}`)) || 0,
                "index": parseInt(formData.get(`index-${i}`)) || 0
            }
            for (let j=1; j<=gameObject.teamCount; j++) {
                points[i][`Lag ${j}`] = [parseInt(formData.get(`team${j}-${i}`))||0, formData.get(`teeshot-t${j}-${i}`)||""]
            }
            // this.players.forEach(p => {
            //     points[i][p.name] = parseInt(formData.get(`${p.name}-${i}`)) || 0
            // })
        }
        this.setPoints(points)
        console.log(points)
    }

    calculatePoints () {
        let points = {}
        for (let i=1; i<=this.holes; i++) {
            points[i] = {}
            for (let j=1; j<=gameObject.teamCount; j++) {
                let key = `Lag ${j}`
                points[i][key] = 0
                if (!this._points[i][key]) { return }
                const hcp = this.calculateHcp(j)
                let extra = this.calculatePlayerPar(hcp, this._points[i].index)
                points[i][key] = extra < this._points[i][key][0] ? this._points[i][key][0] - extra : 0
            }
            // this.players.forEach(player => {
            //     points[i][player.name] = 0
            //     if (!this._points[i][player.name]) { return }
            //     let extra = this.calculatePlayerPar(player.handicap, this._points[i].index)
            //     points[i][player.name] = extra < this._points[i][player.name] ? this._points[i][player.name] - extra : 0
            // })
        }
        this.calculatedPoints = points
        return points
    }

    calculateScores() {
        this.calculatePoints()
        let total = {}
        for (let j=1; j<=gameObject.teamCount; j++) {
            let name = `Lag ${j}`
            let score = {
                hcp: this.calculateHcp(j),
                shots: 0,
                points: 0,
                par: 0
            }
            Object.keys(this._points).forEach(key => {
                if (!this._points[key][name]) { return }
                score.par += this._points[key]["par"]
                score.shots += this._points[key][name][0]
                score.points += this.calculatedPoints[key][name]
            })
            total[name] = score
        }
        console.log(total)
        return total
    }
    generateScoreCard(dir="h") {
        const teams = [...Array(gameObject.teamCount+1).keys()]
        teams.shift()
        console.log(teams)
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
            for (let j=1; j<=gameObject.teamCount; j++) {
                let key = `Lag ${j}`
                tbl += `<tr>
                <th rowspan="3">${key} (${this.calculateHcp(j)}hcp)</th><th>Utslag</th>
                ${Object.values(this._points).map(hole => `<td>${hole[key][1]}</td>`).join("\n")}
                </tr>
                <tr><th>Slag</th>${Object.values(this._points).map(hole => `<td>${hole[key][0]}</td>`).join("\n")}</tr>
                <tr><th>Poäng</th>
                ${Object.values(this.calculatedPoints).map(hole => `<td>${hole[key]}</td>`).join("\n")}
                </tr>
                `
            }
            

        } else {
            tbl += `<table class="scorecard vertical">
            <tr>
                <th rowspan="2">Hole</th>
                <th rowspan="2">Par</th>
                <th rowspan="2">Index</th>
            `
            tbl += teams.map(team => `<th colspan="3">Lag ${team} (${this.calculateHcp(team)}hcp)</th>`).join("\n")
            tbl += `</tr><tr>`
            tbl += `<th>Utslag</th><th>Slag</th><th>Poäng</th>\n`.repeat(gameObject.teamCount)
            tbl += `</tr>`
            let sum = {
                par: 0,
                index: 0
            }
            teams.map(team => sum[`Lag ${team}`] = [0, 0])

            for (let i=1; i<=this.holes; i++) {
                sum.par += this._points[i].par
                sum.index += this._points[i].index
                teams.map(team => {
                    sum[`Lag ${team}`][0] += this._points[i][`Lag ${team}`][0]
                    sum[`Lag ${team}`][1] += this.calculatedPoints[i][`Lag ${team}`]
                })
                tbl += `
                <tr${i == 9 || i == this.holes?' class="last-row"': ""}>
                    <td>${i}</td>
                    <td>${this._points[i].par}</td>
                    <td>${this._points[i].index}</td>
                    ${teams.map(team => `<td>${this._points[i][`Lag ${team}`][1]}</td><td>${this._points[i][`Lag ${team}`][0]}</td><td>${this.calculatedPoints[i][`Lag ${team}`]}</td>`).join("\n")}
                </tr>
                `
                if (i == 9 || i == this.holes) {
                    tbl += `
                    <tr class="sum-row">
                        <th>Summa</th>
                        <td>${sum.par}</td>
                        <td></td>
                        ${teams.map(team => `<td></td><td>${sum[`Lag ${team}`][0]}</td><td>${sum[`Lag ${team}`][1]}</td>`).join("\n")}
                    </tr>`
                }
            }
        }
        tbl += `</table></div>`
        return tbl
    }
}

class Scram extends GolfSome {
    constructor(players, holes) {
        super(players, holes)
    }

    holeForm(hole) {
        let content = ""
        // const inputFields = this.players.map(player => {
        //     return `<label>${player.name}: <input type="number" name="${player.name}-${hole}" min="0" max="999"></label>`
        // })
        let parVal = ""
        let indVal = ""
        if (gameObject.courseData) {
            parVal = ` value="${gameObject.courseData.holes[hole-1].par}"`
            indVal = ` value="${gameObject.courseData.holes[hole-1].index}"`
        }

        content = `
        <div class="col white hole" id="hole${hole}">
            <h3>Hål ${hole}</h3>
            <label>Par: <input type="number" name="par-${hole}" min="1" max="99"${parVal}></label>
            <label class="separate">Index: <input type="number" name="index-${hole}" min="1" max="99"${indVal}></label>`

        for (let i=1; i<=gameObject.teamCount; i++) {
            content += `<fieldset><legend>Lag ${i}</legend>`
            content += `<label>Slag: <input type="number" name="team${i}-${hole}" min="0" max="999"></label></fieldset>`
        }

        content += `</div>`

        return content
    }

    calculateHcp (team) {
        let hcps = this.players.filter(x => x.team == team).map(x=>x.handicap)
        hcps.sort((a,b) => a - b)
        let res = 0
        if (hcps.length == 2) {
            res = hcps[0] * 0.5 + hcps[1] * 0.2
        } else if (hcps.length == 3) {
            res = hcps[0] * 0.3 + hcps[1] * 0.2 + hcps[2]*0.1
        } else if (hcps.length === 4) {
            res = hcps[0] * 0.2 + hcps[1] * 0.15 + hcps[2] * 0.1 + hcps[3] * 0.05
        }
        return Math.round(res)
    }


    readInputs() {
        let formData = new FormData(forms["keeper"])
        let points = {}
        for (let i = 1; i<=this.holes; i++) {
            points[i] = {
                "par": parseInt(formData.get(`par-${i}`)) || 0,
                "index": parseInt(formData.get(`index-${i}`)) || 0
            }
            for (let j=1; j<=gameObject.teamCount; j++) {
                points[i][`Lag ${j}`] = parseInt(formData.get(`team${j}-${i}`)) || 0
            }
            // this.players.forEach(p => {
            //     points[i][p.name] = parseInt(formData.get(`${p.name}-${i}`)) || 0
            // })
        }
        this.setPoints(points)
        console.log(points)
    }

    calculatePoints () {
        let points = {}
        for (let i=1; i<=this.holes; i++) {
            points[i] = {}
            for (let j=1; j<=gameObject.teamCount; j++) {
                let key = `Lag ${j}`
                points[i][key] = 0
                if (!this._points[i][key]) { return }
                const hcp = this.calculateHcp(j)
                let extra = this.calculatePlayerPar(hcp, this._points[i].index)
                points[i][key] = extra < this._points[i][key][0] ? this._points[i][key][0] - extra : 0
            }
            // this.players.forEach(player => {
            //     points[i][player.name] = 0
            //     if (!this._points[i][player.name]) { return }
            //     let extra = this.calculatePlayerPar(player.handicap, this._points[i].index)
            //     points[i][player.name] = extra < this._points[i][player.name] ? this._points[i][player.name] - extra : 0
            // })
        }
        this.calculatedPoints = points
        return points
    }

    calculateScores() {
        this.calculatePoints()
        let total = {}
        for (let j=1; j<=gameObject.teamCount; j++) {
            let name = `Lag ${j}`
            let score = {
                hcp: this.calculateHcp(j),
                shots: 0,
                points: 0,
                par: 0
            }
            Object.keys(this._points).forEach(key => {
                if (!this._points[key][name]) { return }
                score.par += this._points[key]["par"]
                score.shots += this._points[key][name][0]
                score.points += this.calculatedPoints[key][name]
            })
            total[name] = score
        }
        console.log(total)
        return total
    }
    generateScoreCard(dir="h") {
        const teams = [...Array(gameObject.teamCount+1).keys()]
        teams.shift()
        console.log(teams)
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
            for (let j=1; j<=gameObject.teamCount; j++) {
                let key = `Lag ${j}`
                tbl += `<tr>
                <th rowspan="2">${key} (${this.calculateHcp(j)}hcp)</th>
                </tr>
                <tr><th>Slag</th>${Object.values(this._points).map(hole => `<td>${hole[key]}</td>`).join("\n")}</tr>
                <tr><th>Poäng</th>
                ${Object.values(this.calculatedPoints).map(hole => `<td>${hole[key]}</td>`).join("\n")}
                </tr>
                `
            }
            

        } else {
            tbl += `<table class="scorecard vertical">
            <tr>
                <th rowspan="2">Hole</th>
                <th rowspan="2">Par</th>
                <th rowspan="2">Index</th>
            `
            tbl += teams.map(team => `<th colspan="2">Lag ${team} (${this.calculateHcp(team)}hcp)</th>`).join("\n")
            tbl += `</tr><tr>`
            tbl += `<th>Slag</th><th>Poäng</th>\n`.repeat(gameObject.teamCount)
            tbl += `</tr>`
            let sum = {
                par: 0,
                index: 0
            }
            teams.map(team => sum[`Lag ${team}`] = [0, 0])

            for (let i=1; i<=this.holes; i++) {
                sum.par += this._points[i].par
                sum.index += this._points[i].index
                teams.map(team => {
                    sum[`Lag ${team}`][0] += this._points[i][`Lag ${team}`]
                    sum[`Lag ${team}`][1] += this.calculatedPoints[i][`Lag ${team}`]
                })
                tbl += `
                <tr${i == 9 || i == this.holes?' class="last-row"': ""}>
                    <td>${i}</td>
                    <td>${this._points[i].par}</td>
                    <td>${this._points[i].index}</td>
                    ${teams.map(team => `<td>${this._points[i][`Lag ${team}`]}</td><td>${this.calculatedPoints[i][`Lag ${team}`]}</td>`).join("\n")}
                </tr>
                `
                if (i == 9 || i == this.holes) {
                    tbl += `
                    <tr class="sum-row">
                        <th>Summa</th>
                        <td>${sum.par}</td>
                        <td></td>
                        ${teams.map(team => `<td>${sum[`Lag ${team}`][0]}</td><td>${sum[`Lag ${team}`][1]}</td>`).join("\n")}
                    </tr>`
                }
            }
        }
        tbl += `</table></div>`
        return tbl
    }
}

class FourBall extends GameRules {
    constructor(players, holes) {
        super(players, holes)
    }
    holeForm(hole) {
        let content = ""
        
        let parVal = ""
        let indVal = ""
        if (gameObject.courseData) {
            parVal = ` value="${gameObject.courseData.holes[hole-1].par}"`
            indVal = ` value="${gameObject.courseData.holes[hole-1].index}"`
        }

        content = `
        <div class="col white hole" id="hole${hole}">
            <h3>Hål ${hole}</h3>
            <label>Par: <input type="number" name="par-${hole}" min="1" max="99"${parVal}></label>
            <label class="separate">Index: <input type="number" name="index-${hole}" min="1" max="99"${indVal}></label>`

        for (let i=1; i<=gameObject.teamCount; i++) {
            content += `<fieldset><legend>Lag ${i}</legend>`
            content += this.players.map(player => {
                return `<label>${player.name}: <input type="number" name="team${i}-${hole}-${player.name}" min="0" max="999"></label>`
            }).join("\n")
            content += `</fieldset>`
        }

        content += `</div>`

        return content
    }

    calculateHcp (handicap, team) {
        let hcps = this.players.filter(x => x.team == team).map(x=>x.handicap)
        let hcp = handicap - Math.min(...hcps)
        return Math.round(hcp)
    }


    readInputs() {
        let formData = new FormData(forms["keeper"])
        let points = {}
        for (let i = 1; i<=this.holes; i++) {
            points[i] = {
                "par": parseInt(formData.get(`par-${i}`)) || 0,
                "index": parseInt(formData.get(`index-${i}`)) || 0
            }
            for (let j=1; j<=gameObject.teamCount; j++) {
                let playerPoints = {}
                this.players.map(player => {
                    if (player.team == j) {
                        playerPoints[player.name] = parseInt(formData.get(`team${j}-${i}-${player.name}`)) || 0
                    }
                })
                points[i][`Lag ${j}`] = playerPoints
            }
            // this.players.forEach(p => {
            //     points[i][p.name] = parseInt(formData.get(`${p.name}-${i}`)) || 0
            // })
        }
        this.setPoints(points)
        console.log(points)
    }

    calculatePoints () {
        let points = {}
        for (let i=1; i<=this.holes; i++) {
            points[i] = {}
            for (let j=1; j<=gameObject.teamCount; j++) {
                let key = `Lag ${j}`
                points[i][key] = 0
                if (!this._points[i][key]) { return }
                const hcp = this.calculateHcp(j)
                let extra = this.calculatePlayerPar(hcp, this._points[i].index)
                points[i][key] = extra < this._points[i][key][0] ? this._points[i][key][0] - extra : 0
            }
            // this.players.forEach(player => {
            //     points[i][player.name] = 0
            //     if (!this._points[i][player.name]) { return }
            //     let extra = this.calculatePlayerPar(player.handicap, this._points[i].index)
            //     points[i][player.name] = extra < this._points[i][player.name] ? this._points[i][player.name] - extra : 0
            // })
        }
        this.calculatedPoints = points
        return points
    }

    calculateScores() {
        this.calculatePoints()
        let total = {}
        for (let j=1; j<=gameObject.teamCount; j++) {
            let name = `Lag ${j}`
            let score = {
                hcp: this.calculateHcp(j),
                shots: 0,
                points: 0,
                par: 0
            }
            Object.keys(this._points).forEach(key => {
                if (!this._points[key][name]) { return }
                score.par += this._points[key]["par"]
                score.shots += this._points[key][name][0]
                score.points += this.calculatedPoints[key][name]
            })
            total[name] = score
        }
        console.log(total)
        return total
    }
    generateScoreCard(dir="h") {
        const teams = [...Array(gameObject.teamCount+1).keys()]
        teams.shift()
        console.log(teams)
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
            for (let j=1; j<=gameObject.teamCount; j++) {
                let key = `Lag ${j}`
                tbl += `<tr>
                <th rowspan="2">${key} (${this.calculateHcp(j)}hcp)</th>
                </tr>
                <tr><th>Slag</th>${Object.values(this._points).map(hole => `<td>${hole[key]}</td>`).join("\n")}</tr>
                <tr><th>Poäng</th>
                ${Object.values(this.calculatedPoints).map(hole => `<td>${hole[key]}</td>`).join("\n")}
                </tr>
                `
            }
            

        } else {
            tbl += `<table class="scorecard vertical">
            <tr>
                <th rowspan="2">Hole</th>
                <th rowspan="2">Par</th>
                <th rowspan="2">Index</th>
            `
            tbl += teams.map(team => `<th colspan="2">Lag ${team} (${this.calculateHcp(team)}hcp)</th>`).join("\n")
            tbl += `</tr><tr>`
            tbl += `<th>Slag</th><th>Poäng</th>\n`.repeat(gameObject.teamCount)
            tbl += `</tr>`
            let sum = {
                par: 0,
                index: 0
            }
            teams.map(team => sum[`Lag ${team}`] = [0, 0])

            for (let i=1; i<=this.holes; i++) {
                sum.par += this._points[i].par
                sum.index += this._points[i].index
                teams.map(team => {
                    sum[`Lag ${team}`][0] += this._points[i][`Lag ${team}`]
                    sum[`Lag ${team}`][1] += this.calculatedPoints[i][`Lag ${team}`]
                })
                tbl += `
                <tr${i == 9 || i == this.holes?' class="last-row"': ""}>
                    <td>${i}</td>
                    <td>${this._points[i].par}</td>
                    <td>${this._points[i].index}</td>
                    ${teams.map(team => `<td>${this._points[i][`Lag ${team}`]}</td><td>${this.calculatedPoints[i][`Lag ${team}`]}</td>`).join("\n")}
                </tr>
                `
                if (i == 9 || i == this.holes) {
                    tbl += `
                    <tr class="sum-row">
                        <th>Summa</th>
                        <td>${sum.par}</td>
                        <td></td>
                        ${teams.map(team => `<td>${sum[`Lag ${team}`][0]}</td><td>${sum[`Lag ${team}`][1]}</td>`).join("\n")}
                    </tr>`
                }
            }
        }
        tbl += `</table></div>`
        return tbl
    }
}
const rules = {
    forms: [],
    implemented: ["shotcomp","pointbogey","matchgame", "shotgolf", 
        "copenhagener", "nassauShotgolf", "nassauShotcomp",
        "nassauPointbogey", "foursome", "greensome", "irishgreen"],
    matchgame: class MatchGame extends GameRules {
        constructor(players, holes) {
            super(players, holes)
            this.order = "desc"
        }

        holeForm(hole) {
            let content = ""
            const minHcp = Math.min(...this.players.map(p => p.handicap))
            const inputFields = this.players.map(player => {
                return `<label>${player.name} (${player.handicap-minHcp}hcp): <input type="number" name="${player.name}-${hole}" min="0" max="999"></label>`
            })
            let parVal = ""
            let indVal = ""
            if (gameObject.courseData) {
                parVal = ` value="${gameObject.courseData.holes[hole-1].par}"`
                indVal = ` value="${gameObject.courseData.holes[hole-1].index}"`
            }

            content = `
            <div class="col white hole" id="hole${hole}">
                <h3>Hål ${hole}</h3>
                <label>Par: <input type="number" name="par-${hole}" min="1" max="99"${parVal}></label>
                <label class="separate">Index: <input type="number" name="index-${hole}" min="1" max="99"${indVal}></label>
                ${inputFields.join("\n")}
                <label>Vinnare:</label>
                <div class="horizontal-radio-buttons winner-radios">`
            content += this.players.map(player => {
                return `<span><input type="radio" name="winner-${hole}" value="${player.name}" id="winner-${hole}-${player.name.replace(" ", "-")}">
                <label for="winner-${hole}-${player.name.replace(" ", "-")}">${player.name}</label></span>`
            }).join("\n")
            content += `</div></div>`

            return content
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
    nassauShotgolf: class NassauShotgolf extends Nassau {
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
    nassauShotcomp: class NassauShotcomp extends Nassau {
        constructor(players, holes) {
            super(players, holes)
        }
    },
    nassauPointbogey: class NassauPointbogey extends Nassau {
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
    foursome: class Foursome extends GolfSome {
        constructor(players, holes) {
            super(players, holes)
        }
        additionalListeners() {
            for (let i = 1; i<= this.holes; i++) {
                for (let j = 1; j<=gameObject.teamCount; j++) {
                    document.getElementsByName(`teeshot-t${j}-${i}`).forEach(rad => rad.onclick = (e) => this.switchTeeshots(e, i, j))
                }
            }
        }

        switchTeeshots(e, hole, team) {
            let player1 = document.querySelector(`input[name="teeshot-t${team}-${hole}"]:checked`).value
            let player2 = ""
            
            this.players.map(player => {
                if (player.team == team && player.name !== player1) {
                    player2 = player.name
                }
            })
            let odd = hole % 2 === 1 ? [player2, player1] : [player1, player2]
            for (let i = 1; i<= this.holes; i++) {
                document.getElementById(`teeshot-${i}-${odd[i % 2].replace(" ", "-")}`).checked = true
            }
        }
    },
    greensome: class Greensome extends GolfSome {
        constructor(players, holes) {
            super(players, holes)
        }
        calculateHcp (team) {
            let hcps = this.players.filter(x => x.team == team).map(x=>x.handicap)
            let res = Math.min(...hcps)*0.6 + Math.max(...hcps)*0.4
            return Math.round(res)
        }
    },
    irishgreen: class IrishGreensome extends GolfSome {
        constructor(players, holes) {
            super(players, holes)
        }
        calculateHcp (team) {
            let hcps = this.players.filter(x => x.team == team).map(x=>x.handicap)
            let res = Math.min(...hcps)*0.6 + Math.max(...hcps)*0.4
            return Math.round(res)
        }
    },
    scramble: class Scramble extends Scram {
        constructor(players, holes) {
            super(players, holes)
        }
    },
    dropoutscram: class DropOutScramble extends Scram {
        constructor(players, holes) {
            super(players, holes)
        }

        calculateHcp(team) { return 0 }
    },
    texscramble: class TexasScramble extends Scram {
        constructor(players, holes) {
            super(players, holes)
        }
    },
    rumble: class Rumble extends GameRules {
        constructor(players, holes) {
            super(players, holes)
        }
    },
    tryall: class TryAll extends Scram {
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