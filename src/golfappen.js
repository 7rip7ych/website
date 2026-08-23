/**
 * @module golfappen
 */

import { getFile } from "./modules/files.js"
import { elements } from "./modules/elements.js"

// declare variables
const main = document.querySelector(".wrapper")
const storage = window.localStorage //window.sessionStorage
const views = {
    "start": document.getElementById("startView"),
    "new": document.getElementById("newView"),
    "play": document.getElementById("playView"),
    "score": document.getElementById("scoreView"),
    "history": document.getElementById("historyView"),
    "players": document.getElementById("playersView"),
    "partRes": document.getElementById("partialResults"),
    "typeInfo": document.getElementById("typeInfoWindow"),
    "gameInfo": document.getElementById("gameInfoWindow")
}
const dynamic = {
    "title": document.getElementById("header-title")
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
    "typeInfo": document.getElementById("gameTypeInfo"),
    "gameInfo": document.getElementById("gameInfo"),
    "clearHis": document.getElementById("clearHistory")
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

    buttons["prevHole"].addEventListener("mouseup", () => elements.scrollToPrev(forms["keeper"]))
    buttons["prevHole"].addEventListener("touchend", (e) => {
        e.preventDefault()
        elements.scrollToPrev(forms["keeper"])
    })
    buttons["nextHole"].addEventListener("mouseup", () => elements.scrollToNext(forms["keeper"]))
    buttons["nextHole"].addEventListener("touchend", (e) => {
        e.preventDefault()
        elements.scrollToNext(forms["keeper"])
    })

    // form submits
    forms["newGame"].addEventListener("submit", (e) => gameObject.create(e))
    forms["newGame"].onchange = () => { gameObject.time = null }
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

    buttons["clearHis"].onclick = () => {
        const confirmation = confirm("Är du säker på att du vill radera hela historiken?")
        if (confirmation) {
            historyManager.clearHistory()
            document.querySelector("#historyView .list").innerHTML = ""
        }
    }
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
        // console.log(club)
        let data = this.clubdata || await getFile("assets/caddee-data.json")
        // console.log(await Object.keys(data))
        // if (!this.clubdata) {
        //     this.clubdata = await getFile("assets/caddee-data.json")
        // }
        if (!await data[club]) { return }
        // console.log(data[club])
        return await data[club]["props"]["pageProps"]
    }
}

async function populateNewGameForm(playTypes, golfClubs) {
    // console.log(playTypes)
    const gameSelect = document.getElementById("gameType")
    const clubSelect = document.getElementById("golfClub")
    const courseSelect = document.getElementById("golfCourse")
    const playerCount = document.getElementById("playerCount")
    const teamSize = document.getElementById("teamSize")
    
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
        const play = playTypes.find(x => x.id == gameSelect.value)
        if (!document.getElementById("teamSizeLabel").classList.contains("hidden")) {
            const possible = gameObject.possibleTeamSizes(parseInt(playerCount.value), play.teamSize)
            teamSize.querySelectorAll("option").forEach(opt => {opt.disabled = !possible.includes(parseInt(opt.value))})
            teamSize.value = gameObject.determineTeamSize(parseInt(playerCount.value), play.teamSize)
        }
    })

    gameSelect.onchange = (e) => {
        console.log(e)
        const play = playTypes.find(x => x.id == e.target.value)
        const lbl = document.getElementById("teamSizeLabel")
        console.log(play)
        if (!play || !play.team || !Array.isArray(play.teamSize)) {
            lbl.className = "hidden"
        } else {
            lbl.classList.remove("hidden")
            teamSize.innerHTML = ""
            const possible = gameObject.possibleTeamSizes(parseInt(playerCount.value), play.teamSize)
            play.teamSize.forEach(x => teamSize.add(new Option(x, x)))
            teamSize.querySelectorAll("option").forEach(opt => {opt.disabled = !possible.includes(parseInt(opt.value))})
            teamSize.value = gameObject.determineTeamSize(parseInt(playerCount.value), play.teamSize)
        }
    }

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
    // console.log("resize")
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

const gameInfoWindow = {
    window: document.getElementById("gameInfoWindow"),
    button: document.getElementById("gameInfo"),
    init: function(plays) {
        let content = `<button class="close-button">X</button>`
        this.plays = plays
        content += plays.map(play => {
            return `
            <h3>${play.name}</h3>
            <p>${play.desc}</p>
            `
        }).join("\n")
        this.window.innerHTML = content
        this.window.querySelector(".close-button").onclick = (e) => this.close(e)
    },
    createListeners: function() {
        this.button = document.getElementById("gameInfo")
        this.button.onclick = (e) => this.open(e)
    },
    setContent: function(type) {
        const play = this.plays.find(x =>x.id == type)
        this.window.innerHTML = `<button class="close-button">X</button>
        <h3>${play.name}</h3>
        <p>${play.desc}</p>
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

async function setup() {
    createListeners()
    const plays =  await data.loadPlayTypes()
    gameObject.playTypes = plays
    const courses = await data.loadGolfClubs()
    await data.loadClubData()
    populateNewGameForm(plays, courses)
    infoWindow.init(plays)
    gameInfoWindow.init(plays)
}



// repeatable functions
function switchView(newView) {
    if (!(newView in views)) {return}
    let currView = document.querySelector("section.visible")
    currView.classList.replace("visible", "hidden")

    views[newView].classList.replace("hidden", "visible")
    // change dynamic content
    const titles = {
        "start": `<h1>Golfappen</h1>`,
        "new": `<h2>Nytt spel</h2>`,
        "players": `<h2>Ange spelare</h2>`,
        "play": `<h2>Poängräknare</h2><button class="info-button" id="gameInfo">i</button>`,
        "score": `<h2>Resultat</h2>`,
        "history": `<h2>Historik</h2>`,
        "partRes": false,
        "typeInfo": false,
        "gameInfo": false
    }
    if (titles[newView] !== false) {
        dynamic["title"].innerHTML = titles[newView]
    }

    if (newView == "play") {
        gameInfoWindow.createListeners()
        reloadOverlayPos()
        // gameObject.cacheGame()
    } else if (newView == "history") {
        historyManager.populateHistory()
    } else if (newView == "start") {
        gameObject.reset()
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
        this.play = this.playTypes.find(x => x.id === this.gameType)
        if (this.play.team) {
            this.teamSize = parseInt(data.get("teamSize")) || gameObject.determineTeamSize(this.playerCount, this.play.teamSize)
        }
        switchView("players")
        this.openPlayerSetup(this.playerCount)
        gameInfoWindow.setContent(this.gameType)
    },
    loadCourseData: async function() {
        this.clubData = await data.getClubData(this.club)
        this.courseData = this.clubData.courseArray.find(x => x.name == this.course)
        // console.log(this.courseData)
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
                    <label>Namn: <input type="text" name="p${i}name" id="p${i}name" value="${exists?exists.name:""}"></label>
                    <label>Spelhandicap: <input type="number" name="p${i}handicap" id="p${i}handicap" value="${exists?exists.handicap:""}"></label>
                    ${extraField}
                </fieldset>
                `
            }
            playerForm.innerHTML += `<input type="submit" name="submit" value="Klar">`
        } else {
            // this.teamSize = this.play.teamSize
            // if (Array.isArray(this.teamSize)) {
            //     this.teamSize = Math.max(...this.teamSize.filter(x => count % x === 0))
            // }
            this.teamSize = this.determineTeamSize(count, this.play.teamSize)
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
                    <label>Namn: <input type="text" name="p${i}name" id="p${i}name" value="${exists?exists.name:""}"></label>
                    <label>Spelhandicap: <input type="number" name="p${i}handicap" id="p${i}handicap" value="${exists?exists.handicap:""}"></label>
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
    determineTeamSize: (playerCount, teamSizes) => {
        if (Array.isArray(teamSizes)) {
            const divisibles = teamSizes.filter(x => playerCount % x === 0)
            if (divisibles.length === 1) {
                return divisibles[0]
            } else if (divisibles.length === 0) {
                return teamSizes[0]
            }
            const multipleTeams = divisibles.filter(x => x < playerCount)
            if (multipleTeams.length === 1) {
                return multipleTeams[0]
            } else if (multipleTeams.length === 0) {
                return divisibles[0]
            }
            return Math.max(...multipleTeams)
            // this.teamSize = Math.max(...this.teamSize.filter(x => count % x === 0))
        }
        return teamSizes
    },
    possibleTeamSizes: (playerCount, teamSizes) => {
        if (Array.isArray(teamSizes)) {
            return teamSizes.filter(x => playerCount % x === 0)
        }
        return teamSizes
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
        // Decide whether to continue or start anew
        if (players.map(x=>x.name).sort().join(',') === this.players.map(x=>x.name).sort().join(',') && this.time) {
            this.players = players
            switchView("play")
        } else {
            this.time = new Date()
            this.players = players
            this.openScoreKeeper()
        }

        gameObject.cacheGame()
    },
    openScoreKeeper: function() {
        switchView("play")
        this.ruleset = new rules[this.gameType.toString()](this.players, this.holes)
        const banner = document.getElementById("topBanner")
        if (rules.usingTopBanner.includes(this.gameType)) {
            banner.classList.remove("hidden")
            this.ruleset.fillStatusBanner()
        } else if (!banner.classList.contains("hidden")) {
            banner.classList.add("hidden")
        }
        // console.log(this.gameType, this.players)
        this.keeper.innerHTML = ""
        this.keeper.scrollTo(0,0)
        for (let i = 1; i<=this.holes; i++) {
            this.keeper.innerHTML += this.ruleset.holeForm(i)
        }
        this.keeper.innerHTML += `<div class="col white">
            <input type="submit" value="Räkna ut resultat">
            <div class="results row cols-2"></div>
        </div>`
        const inputs = this.keeper.querySelectorAll('input')
        for (let i = 0; i < inputs.length; i++) {
            if (!inputs[i].value || inputs[i].type !== "number") {
                inputs[i].tabIndex = i+1
                inputs[i].onfocus = () => {
                    const nameSplit = inputs[i].name.split("-")
                    const hole = parseInt(nameSplit[nameSplit.length-1])
                    elements.scrollToChild(this.keeper, hole-1)
                }
            }
        }
        window.visualViewport.addEventListener('resize', () => this.compensateForKeyboard())
        this.ruleset.additionalListeners()
    },
    compensateForKeyboard: function() {
        const MIN_KEYBOARD_HEIGHT = 300 // N.B.! this might not always be correct

        const isMobile = window.innerWidth < 768
        const isKeyboardOpen = isMobile 
            && window.screen.height - MIN_KEYBOARD_HEIGHT > window.visualViewport.height
        document.body.style.maxHeight = window.visualViewport.height + "px"
        document.body.className = isKeyboardOpen ? "space-saver" : ""
        isKeyboardOpen ? this.keeper.scrollIntoView() : window.scrollTo(0, 0)
        elements.centerChild(this.keeper)
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
        if (rules.hcpSwitch.includes(this.gameType)) {
            console.log("incl")
            content += `<label>Behåll original handicap<input type="checkbox" class="checkbox" id="hcpSwitch"${this.ruleset.keepHcp?' checked':''}></label>`
        }
        content += this.ruleset.generateScoreCard("v")
        // content += this.ruleset.generateScoreCard("h")
        Object.keys(res).forEach(player => {
            content += `<div class="player"><h4>${player}</h4>`
            for (const [key, val] of Object.entries(res[player])) {
                content += `<p><span>${key}</span> <span>${val}</span></p>\n`
            }
            content += "</div>"
        })

        container.innerHTML += content

        if (rules.hcpSwitch.includes(this.gameType)) {
            container.querySelector("#hcpSwitch")?.addEventListener("input", (e) => {
                console.log(e.target.checked)
                this.ruleset.keepHcp = e.target.checked
                this.showPartResults()
            })
        }
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
        if (rules.hcpSwitch.includes(this.gameType)) {
            console.log("incl")
            content += `<label>Behåll original handicap<input type="checkbox" class="checkbox" id="hcpSwitchRes"${this.ruleset.keepHcp?' checked':''}></label>`
        }
        content += this.ruleset.generateScoreCard("v")
        container.innerHTML = content
        if (rules.hcpSwitch.includes(this.gameType)) {
            container.querySelector("#hcpSwitchRes")?.addEventListener("input", (e) => {
                console.log(e.target.checked)
                this.ruleset.keepHcp = e.target.checked
                this.showResults()
            })
        }
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
        console.log("cached", gameData)
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
        gameInfoWindow.setContent(this.gameType)
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
    },
    reset: () => {
        gameObject.ruleset = null
        gameObject.playerCount = 0
        gameObject.holes = 18
        gameObject.gameType = null
        gameObject.club = null
        gameObject.course = null
        // gameObject.players = []
        gameObject.play = null
        gameObject.teamCount = null
        gameObject.teamSize = 1
        gameObject.time = null
        // forms["keeper"].scrollTo(0, 0)
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
    deleteGame: (date) => {
        storage.removeItem(date)
        const prev = historyManager.getHistory()
        // console.log(prev)
        const index = prev.indexOf(date)
        if (index !== -1) {
            prev.splice(index, 1)
        }
        console.log(prev)
        historyManager.setHistory(prev)
    },
    getHistory: function(order="desc") {
        const prev = JSON.parse(storage.getItem("games") || "[]")
        prev.sort((a, b) => {
            return order=="desc" ? new Date(b) - new Date(a) : new Date(a) - new Date(b)
        })
        return prev
    },
    setHistory: function(list) {
        storage.setItem("games", JSON.stringify(list))
    },
    updateHistory: function(date) {
        const prev = this.getHistory()
        if (!prev.includes(date)) {
            prev.push(date)
            console.log("new")
            historyManager.setHistory(prev)
        }
    },
    clearHistory: () => storage.clear(),
    repairHistory: () => {
        const list = historyManager.getHistory()
        if (list.length < 1) { return }
        const repaired = list.filter(item => storage.getItem(item) && item && typeof item == 'string')
        console.log(list, repaired)
        historyManager.setHistory(repaired)
    },
    getLatest: function() {
        const his = this.getHistory()
        return this.getGame(his[0])
    },
    populateHistory: async function() {
        const games = this.getHistory()
        this.plays = await data.loadPlayTypes()
        this.clubs = await data.loadGolfClubs()
        try {
            document.querySelector("#historyView .list").innerHTML = games.map(x => {
                const game = historyManager.getGame(x)
                let clubLine = ""
                let winLine =""
                if (game.club && game.course) {
                    clubLine = `<p><span>${this.clubs.find(x => x.id == game.club).name}</span> - <span>${game.course}</span></p>`
                } else if (game.club) {
                    clubLine = `<p><span>${this.clubs.find(x => x.id == game.club).name}</span></p>`
                }
                let winner = this.calculateWinner(game)
                if (winner !== "N/A" && winner) {
                    winLine = `<p>Vinnare: ${winner}</p>`
                }
                return `<div class="history-item" id="${x}">
                <div class="horizontal-flex separate">
                <p class="timestamp">${new Date(x).toLocaleString()}</p>
                <button class="delete-button">Ta bort</button>
                </div>
                <h2><span>${this.plays.find(x => x.id == game.gameType).name}</span></h2>
                ${clubLine}
                <p><span>${game.holes} hål</span> - <span>${game.playerCount} spelare</span></p>
                ${winLine}
                <div class="collapsed scores"></div>
                <div class="horizontal-flex">
                    ${!Array.isArray(game.scores) ? '<button class="expand">Visa scorekort</button>': ''}
                    <button class="continue">Fortsätt</button>
                </div>
            </div>`
            }).join("\n")
        } catch {
            await historyManager.repairHistory()
            console.log("Fixing history")
            return historyManager.populateHistory()
        }
        games.map(x => {
            const parent = document.getElementById(x)
            parent.querySelector(`.expand`)?parent.querySelector(`.expand`).onclick = () => historyManager.toggleScores(x): null
            parent.querySelector(`.continue`).onclick = () => gameObject.resumeGame(x)
            parent.querySelector(".delete-button").onclick = () => {
                historyManager.deleteGame(x)
                parent.remove()
            }
        })
    },
    calculateWinner: function (game) {
        if (!game.scores || game.scores.length < 1) { return "N/A" }
        const ruleset = new rules[game.gameType.toString()](game.players, game.holes)
        if (this.plays.find(x=> x.id == game.gameType).team) { ruleset.teamCount = game.teamCount }
        // console.log(game.scores)
        ruleset.setPoints(game.scores)
        return ruleset.getWinner()
    },
    toggleScores: function(id) {
        // console.log(id)
        const ele = document.getElementById(id)
        const cont = ele.querySelector(".scores")
        if (cont.classList.contains("collapsed")) {
            const game = historyManager.getGame(id)
            if (!game.scores || game.scores.length < 1) {return}
            ele.querySelector(`.expand`).innerText = "Dölj scorekort"
            if (!cont.querySelector(".scorecard")) {
                const ruleset = new rules[game.gameType.toString()](game.players, game.holes)
                if (this.plays.find(x=> x.id == game.gameType).team) { ruleset.teamCount = game.teamCount }
                // console.log(game.scores)
                ruleset.setPoints(game.scores)
                cont.innerHTML = ruleset.generateScoreCard("v")
            }
            
        } else {
            ele.querySelector(`.expand`).innerText = "Visa scorekort"
        }
        cont.classList.toggle("collapsed")
    }
}

class GameRules {
    constructor(players, holes, name="base") {
        this.name = name
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
        this.calculatePoints()
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

    generateScoreCard(dir="v", match=false) {
        let tbl = `<div class="horizontal-scroll">`
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
                <tr><th>Slag</th><th>Netto</th>
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
            tbl += this.players.map(player => `<th colspan="2">${player.name} (${player.handicap}hcp)</th>`).join("\n")
            tbl += `</tr><tr>`
            tbl += `<th>Slag</th><th>${match?"Poäng":"Netto"}</th>\n`.repeat(this.playernames.length)
            tbl += `</tr>`
            let sum1 = {
                par: 0,
                index: 0
            }
            let sum2 = {
                par: 0,
                index: 0
            }
            this.playernames.map(player => {
                sum1[player] = [0, 0]
                sum2[player] = [0, 0]
            })
            for (let i=1; i<=this.holes; i++) {
                (i<=9?sum1:sum2).par += this._points[i].par;
                (i<=9?sum1:sum2).index += this._points[i].index
                this.playernames.map(player => {
                    (i<=9?sum1:sum2)[player][0] += this._points[i][player];
                    (i<=9?sum1:sum2)[player][1] += this.calculatedPoints[i][player]
                })
                tbl += `
                <tr${i == 9 || i == this.holes?' class="last-row"': ""}>
                    <td>${i}</td>
                    <td>${this._points[i].par}</td>
                    <td>${this._points[i].index}</td>
                    ${this.playernames.map(player => `<td>${this._points[i][player]}</td>
                        <td class="left-indent${match && this.calculatedPoints[i][player]?' win':''}"><span class="super">${this.calculatePlayerPar(this.players.find(x=>x.name==player).handicap, this._points[i].index)}</span>
                        ${this.calculatedPoints[i][player]}</td>`).join("\n")}
                </tr>
                `
                if (i == 9) {
                    tbl += `
                    <tr class="sum-row">
                        <th>Del 1</th>
                        <td>${sum1.par}</td>
                        <td></td>
                        ${this.playernames.map(player => `<td>${sum1[player][0]}</td><td>${sum1[player][1]}</td>`).join("\n")}
                    </tr>`
                } else if (i == 18) {
                    tbl += `
                    <tr class="sum-row">
                        <th>Del 2</th>
                        <td>${sum2.par}</td>
                        <td></td>
                        ${this.playernames.map(player => `<td>${sum2[player][0]}</td><td>${sum2[player][1]}</td>`).join("\n")}
                    </tr>`
                }
                if (i == this.holes) {
                    tbl += `
                    <tr class="sum-row">
                        <th>Total</th>
                        <td>${sum1.par + sum2.par}</td>
                        <td></td>
                        ${this.playernames.map(player => `<td>${sum1[player][0] + sum2[player][0]}</td><td>${sum1[player][1] + sum2[player][1]}</td>`).join("\n")}
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
            // return `<label>${player.name} (${player.handicap}hcp): <input type="number" name="${player.name}-${hole}" min="0" max="999"></label>`
            return `<label>${player.name}: <input type="number" name="${player.name}-${hole}" min="0" max="999"></label>`
        })
        let topPart = `<div class="input-container-row separate-bottom"><label>Par: <input type="number" name="par-${hole}" min="1" max="99"></label>
        <label>Index: <input type="number" name="index-${hole}" min="1" max="99"></label>
        </div>`
        if (gameObject.courseData) {
            topPart = `<div class="input-container-row separate-bottom plain-text">
            <label>Par: <input type="number" name="par-${hole}" min="1" max="99" value="${gameObject.courseData.holes[hole-1].par}"></label>
            <label>Index: <input type="number" name="index-${hole}" min="1" max="99" value="${gameObject.courseData.holes[hole-1].index}"></label>
            </div>`
        }
        return `
        <div class="col white hole" id="hole${hole}">
            <h3>Hål ${hole}</h3>
            ${topPart}
            ${inputFields.join("\n")}
        </div>
        `
    }

    getWinner() {
        const tot = this.calculateScores()
        // let rank = this.playernames
        let win
        const ptList = Object.values(tot).map(x => x.points)
        if (this.order == "asc") {
            win = Math.min(...ptList)
            // rank.sort((a,b) => tot[a].points - tot[b].points)
        } else {
            win = Math.max(...ptList)
            // rank.sort((a,b) => tot[a].points - tot[b].points)
        }
        const winners = Object.keys(tot).filter(x => tot[x].points == win)
        return winners.join(", ")
    }

    getPlayerClass(player) {
        const nr = this.playernames.indexOf(player)
        const classes = ["c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8", "c9", "c10", "c11", "c12", "c13", "c14", "c15"]
        return classes[nr%classes.length]
    }
}

class TeamGame extends GameRules {
    constructor(players, holes, name="team") {
        super(players, holes, name)
        console.log(this.name)
        this.teamCount = gameObject.teamCount
        this.teeshot = rules.utslagGames.includes(this.name)
    }

    holeForm(hole) {
        let content = ""
        let topPart = `<div class="input-container-row separate-bottom"><label>Par: <input type="number" name="par-${hole}" min="1" max="99"></label>
        <label>Index: <input type="number" name="index-${hole}" min="1" max="99"></label>
        </div>`
        if (gameObject.courseData) {
            topPart = `<div class="input-container-row separate-bottom plain-text">
            <label>Par: <input type="number" name="par-${hole}" min="1" max="99" value="${gameObject.courseData.holes[hole-1].par}"></label>
            <label>Index: <input type="number" name="index-${hole}" min="1" max="99" value="${gameObject.courseData.holes[hole-1].index}"></label>
            </div>`
        }
        content = `
        <div class="col white hole" id="hole${hole}">
            <h3>Hål ${hole}</h3>
            ${topPart}`

        for (let i=1; i<=this.teamCount; i++) {
            content += `<fieldset><legend>Lag ${i}</legend>`
            if (this.teeshot) {
                content += `<label>Utslag:</label>
                <div class="horizontal-radio-buttons teeshot-radios">`
                content += this.players.map(player => {
                    if (player.team == i) {
                        return `<span><input type="radio" name="teeshot-t${i}-${hole}" value="${player.name}" id="teeshot-t${i}-${hole}-${player.name.replace(" ", "-")}">
                        <label for="teeshot-t${i}-${hole}-${player.name.replace(" ", "-")}">${player.name}</label></span>`
                    }
                }).join("\n")
                content += `</div>`
            }
            content += `<label>Slag: <input type="number" name="team${i}-${hole}" min="0" max="999"></label></fieldset>`
        }

        content += `</div>`

        return content
    }

    readInputs() {
        let formData = new FormData(forms["keeper"])
        let points = {}
        for (let i = 1; i<=this.holes; i++) {
            points[i] = {
                "par": parseInt(formData.get(`par-${i}`)) || 0,
                "index": parseInt(formData.get(`index-${i}`)) || 0
            }
            for (let j=1; j<=this.teamCount; j++) {
                points[i][`Lag ${j}`] = this.teeshot ? [parseInt(formData.get(`team${j}-${i}`))||0, formData.get(`teeshot-t${j}-${i}`)||""] : parseInt(formData.get(`team${j}-${i}`)) || 0
            }
            // this.players.forEach(p => {
            //     points[i][p.name] = parseInt(formData.get(`${p.name}-${i}`)) || 0
            // })
        }
        this.setPoints(points)
        // console.log(points)
    }

    calculatePoints() {
        let points = {}
        // console.log(this._points)
        for (let i=1; i<=this.holes; i++) {
            points[i] = {}
            for (let j=1; j<=this.teamCount; j++) {
                let key = `Lag ${j}`
                points[i][key] = 0
                if (!this._points[i][key]) { continue }
                const hcp = this.calculateHcp(j)
                let extra = this.calculatePlayerPar(hcp, this._points[i].index)
                if (this.teeshot) {
                    points[i][key] = extra < this._points[i][key][0] ? this._points[i][key][0] - extra : 0
                } else {
                    points[i][key] = extra < this._points[i][key] ? this._points[i][key] - extra : 0
                }
                
            }
            // this.players.forEach(player => {
            //     points[i][player.name] = 0
            //     if (!this._points[i][player.name]) { return }
            //     let extra = this.calculatePlayerPar(player.handicap, this._points[i].index)
            //     points[i][player.name] = extra < this._points[i][player.name] ? this._points[i][player.name] - extra : 0
            // })
        }
        this.calculatedPoints = points
        // console.log(this.calculatedPoints)
        return points
    }

    calculateScores() {
        this.calculatePoints()
        let total = {}
        for (let j=1; j<=this.teamCount; j++) {
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
        // console.log(total)
        return total
    }

    generateScoreCard(dir="v", match=false) {
        const teams = [...Array(this.teamCount+1).keys()]
        teams.shift()
        // console.log(teams)
        // console.log(this.teeshot)
        let tbl = `<div class="horizontal-scroll">`
        console.log(this._points)
        if (dir == "h" || dir.includes("h")) {
            tbl += `<table class="scorecard horizontal">
            <tr>
                <th colspan="2">Hål</th>`
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
            for (let j=1; j<=this.teamCount; j++) {
                let key = `Lag ${j}`
                tbl += `<tr>
                <th rowspan="3">${key} (${this.calculateHcp(j)}hcp)</th><th>Utslag</th>
                ${Object.values(this._points).map(hole => `<td>${hole[key][1]}</td>`).join("\n")}
                </tr>
                <tr><th>Slag</th>${Object.values(this._points).map(hole => `<td>${hole[key][0]}</td>`).join("\n")}</tr>
                <tr><th>${match?"Poäng":"Netto"}</th>
                ${Object.values(this.calculatedPoints).map(hole => `<td>${hole[key]}</td>`).join("\n")}
                </tr>
                `
            }

        } else {
            tbl += `<table class="scorecard vertical">
            <tr>
                <th rowspan="2">Hål</th>
                <th rowspan="2">Par</th>
                <th rowspan="2">Index</th>
            `
            tbl += teams.map(team => `<th colspan="${this.teeshot?3:2}">Lag ${team} (${this.calculateHcp(team)}hcp)</th>`).join("\n")
            tbl += `</tr><tr>`
            tbl += `${this.teeshot?'<th>Utslag</th>':''}<th>Slag</th><th>${match?"Poäng":"Netto"}</th>\n`.repeat(this.teamCount)
            tbl += `</tr>`
            let sum1 = {
                par: 0,
                index: 0
            }
            let sum2 = {
                par: 0,
                index: 0
            }
            teams.map(team => {
                sum1[`Lag ${team}`] = [0, 0]
                sum2[`Lag ${team}`] = [0, 0]
            })
            // teams.map(team => sum[`Lag ${team}`] = [0, 0])

            for (let i=1; i<=this.holes; i++) {
                (i<=9?sum1:sum2).par += this._points[i].par;
                (i<=9?sum1:sum2).index += this._points[i].index
                teams.map(team => {
                    (i<=9?sum1:sum2)[`Lag ${team}`][0] += this.teeshot ? this._points[i][`Lag ${team}`][0] : this._points[i][`Lag ${team}`];
                    (i<=9?sum1:sum2)[`Lag ${team}`][1] += this.calculatedPoints[i][`Lag ${team}`]
                })
                tbl += `
                <tr${i == 9 || i == this.holes?' class="last-row"': ""}>
                    <td>${i}</td>
                    <td>${this._points[i].par}</td>
                    <td>${this._points[i].index}</td>
                    ${teams.map(team => {
        if (this.teeshot) {
            return `<td>${this._points[i][`Lag ${team}`][1]}</td><td>${this._points[i][`Lag ${team}`][0]}</td><td class="left-indent${match && this.calculatedPoints[i][`Lag ${team}`]?' win':''}"><span class="super">${this.calculatePlayerPar(this.calculateHcp(team), this._points[i].index)}</span>${this.calculatedPoints[i][`Lag ${team}`]}</td>`
        } else {
            return `<td>${this._points[i][`Lag ${team}`]}</td><td class="left-indent${match && this.calculatedPoints[i][`Lag ${team}`]?' win':''}"><span class="super">${this.calculatePlayerPar(this.calculateHcp(team), this._points[i].index)}</span>${this.calculatedPoints[i][`Lag ${team}`]}</td>`
        }
    }).join("\n")}
                </tr>
                `
                if (i == 9) {
                    tbl += `
                    <tr class="sum-row">
                        <th>Del 1</th>
                        <td>${sum1.par}</td>
                        <td class="empty"></td>
                        ${teams.map(team => `${this.teeshot?'<td class="empty"></td>':''}<td>${sum1[`Lag ${team}`][0]}</td><td>${sum1[`Lag ${team}`][1]}</td>`).join("\n")}
                    </tr>`
                } else if (i == 18) {
                    tbl += `
                    <tr class="sum-row">
                        <th>Del 2</th>
                        <td>${sum2.par}</td>
                        <td class="empty"></td>
                        ${teams.map(team => `${this.teeshot?'<td class="empty"></td>':''}<td>${sum2[`Lag ${team}`][0]}</td><td>${sum2[`Lag ${team}`][1]}</td>`).join("\n")}
                    </tr>`
                }
                if (i == this.holes) {
                    tbl += `
                    <tr class="sum-row">
                        <th>Total</th>
                        <td>${sum1.par + sum2.par}</td>
                        <td class="empty"></td>
                        ${teams.map(team => `${this.teeshot?'<td class="empty"></td>':''}<td>${sum1[`Lag ${team}`][0] + sum2[`Lag ${team}`][0]}</td><td>${sum1[`Lag ${team}`][1] + sum2[`Lag ${team}`][1]}</td>`).join("\n")}
                    </tr>`
                }
            }
        }
        tbl += `</table></div>`
        return tbl
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

            for (let j=1; j<=this.teamCount; j++) {
                let name = `Lag ${j}`
                let pts
                let shot
                if (this.teeshot) {
                    [pts, shot] = this._points[i][name]
                    if (shot) {
                        document.getElementById(`teeshot-t${j}-${i}-${shot.replace(" ", "-")}`).checked = true
                    }
                } else {
                    pts = this._points[i][name]
                }
                if (pts && pts !== 0) {
                    document.getElementsByName(`team${j}-${i}`)[0].value = pts
                }
            }
        }
    }
}

class Nassau extends GameRules {
    constructor(players, holes) {
        super(players, holes, "nassau")
        this.winners = {}
        this.sumPoints = {}
    }

    setPoints(points) {
        this._points = points
        this.calculateScores()
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
            firstHalf: "",
            secondHalf: "",
            total: ""
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

    getWinner() {
        return Object.values(this.winners).join(" - ")
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

class GolfSome extends TeamGame {
    constructor(players, holes, name="some") {
        super(players, holes, name)
        // this.teamCount = gameObject.teamCount
    }

    // holeForm(hole) {
    //     let content = ""
    //     // const inputFields = this.players.map(player => {
    //     //     return `<label>${player.name}: <input type="number" name="${player.name}-${hole}" min="0" max="999"></label>`
    //     // })
    //     let parVal = ""
    //     let indVal = ""
    //     if (gameObject.courseData) {
    //         parVal = ` value="${gameObject.courseData.holes[hole-1].par}"`
    //         indVal = ` value="${gameObject.courseData.holes[hole-1].index}"`
    //     }

    //     content = `
    //     <div class="col white hole" id="hole${hole}">
    //         <h3>Hål ${hole}</h3>
    //         <label>Par: <input type="number" name="par-${hole}" min="1" max="99"${parVal}></label>
    //         <label class="separate">Index: <input type="number" name="index-${hole}" min="1" max="99"${indVal}></label>`

    //     for (let i=1; i<=this.teamCount; i++) {
    //         content += `<fieldset><legend>Lag ${i}</legend><label>Utslag:</label>
    //         <div class="horizontal-radio-buttons teeshot-radios">`
    //         content += this.players.map(player => {
    //             if (player.team == i) {
    //                 return `<span><input type="radio" name="teeshot-t${i}-${hole}" value="${player.name}" id="teeshot-${hole}-${player.name.replace(" ", "-")}">
    //                 <label for="teeshot-${hole}-${player.name.replace(" ", "-")}">${player.name}</label></span>`
    //             }
    //         }).join("\n")
    //         content += `</div><label>Slag: <input type="number" name="team${i}-${hole}" min="0" max="999"></label></fieldset>`
    //     }

    //     content += `</div>`

    //     return content
    // }

    calculateHcp (team) {
        let hcps = this.players.filter(x => x.team == team).map(x=>x.handicap)
        let res = 0
        hcps.map(h=>res += h*0.5)
        return Math.round(res)
    }


    // readInputs() {
    //     let formData = new FormData(forms["keeper"])
    //     let points = {}
    //     for (let i = 1; i<=this.holes; i++) {
    //         points[i] = {
    //             "par": parseInt(formData.get(`par-${i}`)) || 0,
    //             "index": parseInt(formData.get(`index-${i}`)) || 0
    //         }
    //         for (let j=1; j<=this.teamCount; j++) {
    //             points[i][`Lag ${j}`] = [parseInt(formData.get(`team${j}-${i}`))||0, formData.get(`teeshot-t${j}-${i}`)||""]
    //         }
    //         // this.players.forEach(p => {
    //         //     points[i][p.name] = parseInt(formData.get(`${p.name}-${i}`)) || 0
    //         // })
    //     }
    //     this.setPoints(points)
    //     console.log(points)
    // }
}

class Scram extends TeamGame {
    constructor(players, holes, name="scramble") {
        super(players, holes, name)
    }

    // holeForm(hole) {
    //     let content = ""
    //     // const inputFields = this.players.map(player => {
    //     //     return `<label>${player.name}: <input type="number" name="${player.name}-${hole}" min="0" max="999"></label>`
    //     // })
    //     let parVal = ""
    //     let indVal = ""
    //     if (gameObject.courseData) {
    //         parVal = ` value="${gameObject.courseData.holes[hole-1].par}"`
    //         indVal = ` value="${gameObject.courseData.holes[hole-1].index}"`
    //     }

    //     content = `
    //     <div class="col white hole" id="hole${hole}">
    //         <h3>Hål ${hole}</h3>
    //         <label>Par: <input type="number" name="par-${hole}" min="1" max="99"${parVal}></label>
    //         <label class="separate">Index: <input type="number" name="index-${hole}" min="1" max="99"${indVal}></label>`

    //     for (let i=1; i<=this.teamCount; i++) {
    //         content += `<fieldset><legend>Lag ${i}</legend>`
    //         content += `<label>Slag: <input type="number" name="team${i}-${hole}" min="0" max="999"></label></fieldset>`
    //     }

    //     content += `</div>`

    //     return content
    // }

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


    // readInputs() {
    //     let formData = new FormData(forms["keeper"])
    //     let points = {}
    //     for (let i = 1; i<=this.holes; i++) {
    //         points[i] = {
    //             "par": parseInt(formData.get(`par-${i}`)) || 0,
    //             "index": parseInt(formData.get(`index-${i}`)) || 0
    //         }
    //         for (let j=1; j<=this.teamCount; j++) {
    //             points[i][`Lag ${j}`] = parseInt(formData.get(`team${j}-${i}`)) || 0
    //         }
    //         // this.players.forEach(p => {
    //         //     points[i][p.name] = parseInt(formData.get(`${p.name}-${i}`)) || 0
    //         // })
    //     }
    //     this.setPoints(points)
    //     console.log(points)
    // }
}

class FourBall extends TeamGame {
    constructor(players, holes, name="fourball") {
        super(players, holes, name)
        this.keepHcp = false
    }

    holeForm(hole) {
        let content = ""

        let topPart = `<div class="input-container-row separate-bottom"><label>Par: <input type="number" name="par-${hole}" min="1" max="99"></label>
        <label>Index: <input type="number" name="index-${hole}" min="1" max="99"></label>
        </div>`
        if (gameObject.courseData) {
            topPart = `<div class="input-container-row separate-bottom plain-text">
            <label>Par: <input type="number" name="par-${hole}" min="1" max="99" value="${gameObject.courseData.holes[hole-1].par}"></label>
            <label>Index: <input type="number" name="index-${hole}" min="1" max="99" value="${gameObject.courseData.holes[hole-1].index}"></label>
            </div>`
        }
        content = `
        <div class="col white hole" id="hole${hole}">
            <h3>Hål ${hole}</h3>
            ${topPart}`

        for (let i=1; i<=this.teamCount; i++) {
            content += `<fieldset><legend>Lag ${i}</legend>`
            content += this.players.map(player => {
                if (player.team === i) {
                    return `<label>${player.name}: <input type="number" name="team${i}-${hole}-${player.name}" min="0" max="999"></label>`
                }
            }).join("\n")
            content += `</fieldset>`
        }

        content += `</div>`

        return content
    }

    calculateHcp(player) {
        let p = this.players.find(x => x.name == player)
        return this.keepHcp ? p.handicap : Math.round(p.handicap * 0.9)
    }


    readInputs() {
        let formData = new FormData(forms["keeper"])
        let points = {}
        for (let i = 1; i<=this.holes; i++) {
            points[i] = {
                "par": parseInt(formData.get(`par-${i}`)) || 0,
                "index": parseInt(formData.get(`index-${i}`)) || 0
            }
            for (let j=1; j<=this.teamCount; j++) {
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

    
    calculatePoints() {
        let points = {}
        // console.log(this._points)
        for (let i=1; i<=this.holes; i++) {
            points[i] = {}
            for (let j=1; j<=this.teamCount; j++) {
                let key = `Lag ${j}`
                points[i][key] = 0
                if (!this._points[i][key]) { continue }
                const comp = []
                for (const p of Object.keys(this._points[i][key])) {
                    if (!this._points[i][key][p]) {continue}
                    const hcp = this.calculateHcp(p)
                    let extra = this.calculatePlayerPar(hcp, this._points[i].index)
                    comp.push(extra < this._points[i][key][p] ? this._points[i][key][p] - extra : 0)
                }
                points[i][key] = comp.length > 0 ? Math.min(...comp) : 0
            }
        }
        this.calculatedPoints = points
        // console.log(this.calculatedPoints)
        return points
    }

    calculateScores() {
        this.calculatePoints()
        let total = {}
        for (let j=1; j<=this.teamCount; j++) {
            let name = `Lag ${j}`
            let score = {
                // hcp: this.calculateHcp(j),
                // shots: 0,
                points: 0,
                par: 0
            }
            Object.keys(this._points).forEach(key => {
                if (!this._points[key][name]) { return }
                score.par += this._points[key]["par"]
                // score.shots += this._points[key][name][0]
                score.points += this.calculatedPoints[key][name]
            })
            total[name] = score
        }
        // console.log(total)
        return total
    }

    generateScoreCard(dir="v", match=false) {
        const teams = [...Array(this.teamCount+1).keys()]
        teams.shift()
        // console.log(teams)
        // console.log(this.teeshot)
        const teamMembers = {}
        teams.forEach(x => {teamMembers[x] = []})
        this.players.forEach(p=>teamMembers[p.team].push(p.name))

        console.log(this._points)
        let tbl = `<div class="horizontal-scroll">`
        if (dir == "v" || dir.includes("v")) {
            tbl += `<table class="scorecard vertical">
            <tr>
                <th rowspan="2">Hole</th>
                <th rowspan="2">Par</th>
                <th rowspan="2">Index</th>
            `
            tbl += teams.map(team => `<th colspan="3">Lag ${team}</th>`).join("\n")
            tbl += `</tr><tr>`
            tbl += teams.map(team => `${teamMembers[team].map(p=>`<th><span class="super centered">(${this.calculateHcp(p)}hcp)</span>${p}</th>`).join("\n")}<th>${match?"Poäng":"Netto"}</th>`).join("\n")
            tbl += `</tr>`
            let sum1 = {
                par: 0,
                index: 0
            }
            let sum2 = {
                par: 0,
                index: 0
            }
            teams.map(team => {
                sum1[`Lag ${team}`] = [0, 0, 0]
                sum2[`Lag ${team}`] = [0, 0, 0]
            })
            // teams.map(team => sum[`Lag ${team}`] = [0, 0])

            for (let i=1; i<=this.holes; i++) {
                (i<=9?sum1:sum2).par += this._points[i].par;
                (i<=9?sum1:sum2).index += this._points[i].index
                teams.map(team => {
                    (i<=9?sum1:sum2)[`Lag ${team}`][0] += this._points[i][`Lag ${team}`][teamMembers[team][0]];
                    (i<=9?sum1:sum2)[`Lag ${team}`][1] += this._points[i][`Lag ${team}`][teamMembers[team][1]];
                    (i<=9?sum1:sum2)[`Lag ${team}`][2] += this.calculatedPoints[i][`Lag ${team}`]
                })
                tbl += `
                <tr${i == 9 || i == this.holes?' class="last-row"': ""}>
                    <td>${i}</td>
                    <td>${this._points[i].par}</td>
                    <td>${this._points[i].index}</td>
                    ${teams.map(team => {
        return teamMembers[team].map(p=>`<td class="left-indent">
            <span class="super">${this.calculatePlayerPar(this.calculateHcp(p), this._points[i].index)}</span>
            ${this._points[i][`Lag ${team}`][p]}</td>`).join("\n") +
       `<td${match && this.calculatedPoints[i][`Lag ${team}`]?' class="win"':''}>${this.calculatedPoints[i][`Lag ${team}`]}</td>`

    }).join("\n")}
                </tr>
                `
                if (i == 9) {
                    tbl += `
                    <tr class="sum-row">
                        <th>Del 1</th>
                        <td>${sum1.par}</td>
                        <td class="empty"></td>
                        ${teams.map(team => `<td>${sum1[`Lag ${team}`][0]}</td><td>${sum1[`Lag ${team}`][1]}</td><td>${sum1[`Lag ${team}`][2]}</td>`).join("\n")}
                    </tr>`
                } else if (i == 18) {
                    tbl += `
                    <tr class="sum-row">
                        <th>Del 2</th>
                        <td>${sum2.par}</td>
                        <td class="empty"></td>
                        ${teams.map(team => `<td>${sum2[`Lag ${team}`][0]}</td><td>${sum2[`Lag ${team}`][1]}</td><td>${sum2[`Lag ${team}`][2]}</td>`).join("\n")}
                    </tr>`
                }
                if (i == this.holes) {
                    tbl += `
                    <tr class="sum-row">
                        <th>Total</th>
                        <td>${sum1.par + sum2.par}</td>
                        <td class="empty"></td>
                        ${teams.map(team => `<td>${sum1[`Lag ${team}`][0] + sum2[`Lag ${team}`][0]}</td><td>${sum1[`Lag ${team}`][1] + sum2[`Lag ${team}`][1]}</td><td>${sum1[`Lag ${team}`][2] + sum2[`Lag ${team}`][2]}</td>`).join("\n")}
                    </tr>`
                }
            }
        }
        tbl += `</table></div>`
        return tbl
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

            this.players.map(p => {
                let pts = this._points[i][`Lag ${p.team}`][p.name]
                if (pts && pts !== 0) {
                    document.getElementsByName(`team${p.team}-${i}-${p.name}`)[0].value = pts
                }
            })

        }
    }
}

const rules = {
    forms: [],
    implemented: ["shotcomp","pointbogey","matchgame", "shotgolf", 
        "copenhagener", "nassauShotgolf", "nassauShotcomp",
        "nassauPointbogey", "foursome", "greensome", "irishgreen", "scramble", 
        "dropoutscram", "texscramble", "fourball", "fourballbewo", "fourballbeto", "tryall"],
    utslagGames: ["foursome", "greensome", "irishgreen", "texscramble", "some"],
    usingTopBanner: ["matchgame"],
    hcpSwitch: ["fourball", "fourballbewo", "fourballbeto"],
    matchgame: class MatchGame extends GameRules {
        constructor(players, holes) {
            super(players, holes, "matchgame")
            this.order = "desc"
        }

        holeForm(hole) {
            let content = ""
            const minHcp = Math.min(...this.players.map(p => p.handicap))
            const inputFields = this.players.map(player => {
                return `<label>${player.name} (${player.handicap-minHcp}hcp): <input type="number" name="${player.name}-${hole}" min="0" max="999"></label>`
            })

            let topPart = `<div class="input-container-row separate-bottom"><label>Par: <input type="number" name="par-${hole}" min="1" max="99"></label>
            <label>Index: <input type="number" name="index-${hole}" min="1" max="99"></label>
            </div>`
            if (gameObject.courseData) {
                topPart = `<div class="input-container-row separate-bottom plain-text">
                <label>Par: <input type="number" name="par-${hole}" min="1" max="99" value="${gameObject.courseData.holes[hole-1].par}"></label>
                <label>Index: <input type="number" name="index-${hole}" min="1" max="99" value="${gameObject.courseData.holes[hole-1].index}"></label>
                </div>`
            }
            content = `
            <div class="col white hole" id="hole${hole}">
                <h3>Hål ${hole}</h3>
                ${topPart}
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
            this.fillStatusBanner()
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

        fillInputs() {
            super.fillInputs()
            for (let i = 1; i <= this.holes; i++) {
                let winner = this._points[i].winner
                if (winner) {
                    document.getElementById(`winner-${i}-${winner.replace(" ", "-")}`).checked = true
                } else {
                    document.getElementsByName(`winner-${i}`).forEach(ele => {ele.checked = false})
                }
            }
            this.fillStatusBanner()
        }
        calculateRelativePoints() {
            // console.log(this.calculatedPoints)
            this.calculatePoints()
            let res = {}
            this.players.map(p => {
                res[p.name] = Object.values(this.calculatedPoints).reduce((a, c) => a + c[p.name], 0)
            })
            let min = Math.min(...Object.values(res))
            Object.keys(res).forEach(key => {
                res[key] -= min
            })
            return res
            // this.fillStatusBanner(res)
        }

        fillStatusBanner() {
            let currRankings = this.calculateRelativePoints()
            const banner = document.getElementById("topBanner")
            console.log(currRankings)
            let content = ``
            for (const [key, value] of Object.entries(currRankings).toSorted((a,b) => b[1] - a[1])) {
                content += `<span class="${this.getPlayerClass(key)}">(+${value}) ${key}</span>`
            }
            banner.innerHTML = content
        }

        generateScoreCard(dir="v") {
            let tbl = super.generateScoreCard(dir, true)
            return tbl//.replaceAll("Netto", "Poäng")
        }
    },
    pointbogey: class PointBogey extends GameRules {
        constructor(players, holes) {
            super(players, holes, "pointbogey")
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

        generateScoreCard(dir="v") {
            let tbl = super.generateScoreCard(dir)
            return tbl.replaceAll("Netto", "Poäng")
        }
    },
    shotcomp: class ShotCompetition extends GameRules {
        constructor(players, holes) {
            super(players, holes, "shotcomp")
        }
    },
    shotgolf: class ShotGolf extends GameRules {
        constructor(players, holes) {
            super(players, holes, "shotgolf")
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
            super(players, holes, "copenhagener")
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

        generateScoreCard(dir="v") {
            let tbl = super.generateScoreCard(dir)
            return tbl.replaceAll("Netto", "Poäng")
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
            super(players, holes, "foursome")
        }
        additionalListeners() {
            for (let i = 1; i<= this.holes; i++) {
                for (let j = 1; j<=this.teamCount; j++) {
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
                document.getElementById(`teeshot-t${team}-${i}-${odd[i % 2].replace(" ", "-")}`).checked = true
            }
        }
    },
    greensome: class Greensome extends GolfSome {
        constructor(players, holes) {
            super(players, holes, "greensome")
        }
        calculateHcp (team) {
            let hcps = this.players.filter(x => x.team == team).map(x=>x.handicap)
            let res = Math.min(...hcps)*0.6 + Math.max(...hcps)*0.4
            return Math.round(res)
        }
    },
    irishgreen: class IrishGreensome extends GolfSome {
        constructor(players, holes) {
            super(players, holes, "irishgreen")
        }
        calculateHcp (team) {
            let hcps = this.players.filter(x => x.team == team).map(x=>x.handicap)
            let res = Math.min(...hcps)*0.6 + Math.max(...hcps)*0.4
            return Math.round(res)
        }
    },
    tryall: class TryAll extends Scram {
        constructor(players, holes) {
            super(players, holes, "tryall")
        }

        calculateHcp(team) {
            let hcps = this.players.filter(x => x.team == team).map(x=>x.handicap)
            let res = 0
            hcps.map(h=>res += h*0.5)
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
            super(players, holes, "dropoutscram")
        }

        calculateHcp(team) { return 0 }
    },
    texscramble: class TexasScramble extends Scram {
        constructor(players, holes) {
            super(players, holes, "texscramble")
        }

        countTeeshots() {
            let allTees = {}
            for (let j=1; j<=this.teamCount; j++) {
                let key = `Lag ${j}`
                let arr = Object.values(this._points).map(x => x[key][1])
                allTees[j] = arr.reduce((acc, curr) => {
                    acc[curr] = (acc[curr] || 0) + 1
                    return acc
                }, {})
            }
            return allTees
        }

        generateScoreCard(dir="v") {
            let tbl = super.generateScoreCard(dir)
            const tees = this.countTeeshots()
            const teamSize = this.players.length / this.teamCount
            let min = 4
            teamSize == 3 ? min++: null
            teamSize == 2 ? min += 2:null
            console.log(tees)
            let resStr = `
            <table class="scorecard">
            <tr><th>Spelare</th>
            <th>Utslag</th></tr>`
            for (let j=1; j<=this.teamCount; j++) {
                resStr += `<tr><th colspan="2">Lag ${j}</th><tr>`
                this.players.map(player => {
                    if (player.team == j) {
                        let count = tees[j][player.name] || 0
                        resStr += `<tr><td>${player.name}</td>
                        <td class="center-text${count>=min?' green':''}">${count}<span class="sub">/ ${min}</span></td></tr>`
                    }
                })
            }
            // resStr += `</tr><tr>`
            //     `
            //         <th>Spelare</th>
            //         <th>Utslag</th>
            //     </tr>
            // `
            resStr += `</table>`
            return tbl + resStr
        }
    },
    rumble: class Rumble extends GameRules {
        constructor(players, holes) {
            super(players, holes, "rumble")
        }
    },
    fourball: class Four extends FourBall {
        constructor(players, holes) {
            super(players, holes)
        }
    },
    fourballbewo: class FourballBeWo extends FourBall {
        constructor(players, holes) {
            super(players, holes)
        }

        calculatePoints() {
            let points = {}
            // console.log(this._points)
            for (let i=1; i<=this.holes; i++) {
                points[i] = {}
                let holePoints = {}
                for (let j=1; j<=this.teamCount; j++) {
                    holePoints[j] = []
                    let key = `Lag ${j}`
                    points[i][key] = 0
                    if (!this._points[i][key]) { continue }
                    for (const p of Object.keys(this._points[i][key])) {
                        if (!this._points[i][key][p]) {continue}
                        const hcp = this.calculateHcp(p)
                        let extra = this.calculatePlayerPar(hcp, this._points[i].index)
                        holePoints[j].push(extra < this._points[i][key][p] ? this._points[i][key][p] - extra : 0)
                    }
                }
                Object.values(holePoints).forEach(lst => lst.sort((a, b)=>a-b))
                const bests = Object.values(holePoints).map(x => x[0])
                const worsts = Object.values(holePoints).map(x => x[1])
                const best = Math.min(...bests)
                const beWo = Math.min(...worsts)
                const bestLst = Object.keys(holePoints).filter(key => holePoints[key][0] === best)
                const beWoLst = Object.keys(holePoints).filter(key => holePoints[key][1] === beWo)
                if (bestLst.length == 1) {
                    points[i][`Lag ${bestLst[0]}`] += 1
                }
                if (beWoLst.length == 1) {
                    points[i][`Lag ${beWoLst[0]}`] += 1
                }
            }
            this.calculatedPoints = points
            // console.log(this.calculatedPoints)
            return points
        }

        generateScoreCard(dir="v") {
            let tbl = super.generateScoreCard(dir, true)
            return tbl//.replaceAll("Netto", "Poäng")
        }
    },
    fourballbeto: class FourballBeTo extends FourBall {
        constructor(players, holes) {
            super(players, holes)
        }

        calculatePoints() {
            let points = {}
            // console.log(this._points)
            for (let i=1; i<=this.holes; i++) {
                points[i] = {}
                let holePoints = {}
                for (let j=1; j<=this.teamCount; j++) {
                    holePoints[j] = []
                    let key = `Lag ${j}`
                    points[i][key] = 0
                    if (!this._points[i][key]) { continue }
                    for (const p of Object.keys(this._points[i][key])) {
                        if (!this._points[i][key][p]) {continue}
                        const hcp = this.calculateHcp(p)
                        let extra = this.calculatePlayerPar(hcp, this._points[i].index)
                        holePoints[j].push(extra < this._points[i][key][p] ? this._points[i][key][p] - extra : 0)
                    }
                }
                Object.values(holePoints).forEach(lst => lst.sort((a, b)=>a-b))
                const bests = Object.values(holePoints).map(x => x[0])
                const totals = Object.values(holePoints).map(x => x[0] + x[1])
                const best = Math.min(...bests)
                const beTot = Math.min(...totals)
                const bestLst = Object.keys(holePoints).filter(key => holePoints[key][0] === best)
                const beTotLst = Object.keys(holePoints).filter(key => holePoints[key][0] + holePoints[key][1] === beTot)
                if (bestLst.length == 1) {
                    points[i][`Lag ${bestLst[0]}`] += 1
                }
                if (beTotLst.length == 1) {
                    points[i][`Lag ${beTotLst[0]}`] += 1
                }
            }
            this.calculatedPoints = points
            // console.log(this.calculatedPoints)
            return points
        }

        generateScoreCard(dir="v") {
            let tbl = super.generateScoreCard(dir, true)
            return tbl//.replaceAll("Netto", "Poäng")
        }
    },
    flagcomp: class FlagComp extends GameRules {
        constructor(players, holes) {
            super(players, holes, "flagcomp")
        }
    },
    threadcomp: null,
    kicker: null
}

rules.threadcomp = rules.shotgolf
rules.kicker = rules.shotgolf

setup() // run setup