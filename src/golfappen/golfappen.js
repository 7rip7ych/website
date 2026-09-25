/**
 * @module golfappen
 */

import { getFile } from "../modules/files.js"
import { elements } from "../modules/elements.js"
import { autocomplete } from "../modules/customInputs.js"
import { random } from "../modules/math-extension.js"
import ExportManager from "../modules/export.js"
import rules from "./golf-rules.js"
import {infoWindow, gameInfoWindow} from "./info-window.js"
import historyManager from "./history.js"

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
    "prevHole": document.querySelectorAll("#keeper-nav .left")[1],
    "firstHole": document.querySelector("#keeper-nav .left"),
    "lastHole": document.querySelectorAll("#keeper-nav .right")[1],
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
        const courses = await getFile("assets/golfklubbar.json")
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
        if (!await data[club]) { return }
        // console.log(data[club])
        return await data[club]["props"]["pageProps"]
    }
}

const setup = {
    init: async function() {
        // check if ios
        const isIOS = setup.iOS()
        if (isIOS) {
            document.querySelector('html').classList.add("ios-device")
        }

        setup.createListeners()
        const plays =  await data.loadPlayTypes()
        gameObject.playTypes = plays
        const clubs = await data.loadGolfClubs()
        gameObject.golfClubs = clubs
        await data.loadClubData()
        setup.populateNewGameForm(plays, clubs)
        infoWindow.init(plays)
        gameInfoWindow.init(plays)
    },
    createListeners: function() {
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
        buttons["firstHole"].onclick = () => elements.scrollToStart(forms["keeper"])
        buttons["lastHole"].onclick = () => elements.scrollToEnd(forms["keeper"])
    
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
        window.screen.orientation.onchange = () => reloadOverlayPos()
    
        buttons["clearHis"].onclick = () => {
            const confirmation = confirm("Är du säker på att du vill radera hela historiken?")
            if (confirmation) {
                historyManager.clearHistory()
                document.querySelector("#historyView .list").innerHTML = ""
            }
        }
        const golfball = document.getElementById("home-animation-golfball")
        golfball.playbackRate = 0.7
        golfball.onclick = () => {
            if (!golfball.loop) {golfball.play()}
            golfball.loop = !golfball.loop
        }
    
        // close dropdown menu
        window.addEventListener("click", (e) => {
            const dropbutton = document.getElementById("result-action-button")
            const dropdown = document.getElementById("result-action-list")
            if (dropdown && dropdown.classList.contains("show") && !dropdown.contains(e.target) && !dropbutton.contains(e.target)) {
                dropdown.classList.remove("show")
            }
        })
    
        window.onkeydown = (e) => {
            if (e.ctrlKey && e.shiftKey && e.key == "F" && views["play"].classList.contains("visible")) {
                // console.log(e)
                gameObject.fillRandom()
            }
        }
    },
    iOS: function() {
        return [
            'iPad Simulator',
            'iPhone Simulator',
            'iPod Simulator',
            'iPad',
            'iPhone',
            'iPod'
        ].includes(navigator.platform)
      // iPad on iOS 13 detection
      || (navigator.userAgent.includes("Mac") && "ontouchend" in document)
    },
    populateNewGameForm: async function (playTypes, golfClubs) {
        // console.log(playTypes)
        const gameSelect = document.getElementById("gameType")
        // const clubSelect = document.getElementById("golfClub")
        const clubInput = document.getElementById("golfClub")
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
    
        // for (const club in golfClubs) {
        //     clubSelect.add(new Option(golfClubs[club]["name"], golfClubs[club]["id"]))
        // }
        const fillCourses = (clubData) => {
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
            // courseSelect.oninput = () => {
            //     const selCourse = courses.find(course=> course.name == courseSelect.value)
            //     console.log(selCourse)
            //     if (!selCourse || !selCourse.holes) {return}
            //     document.getElementById("holeCount").value = selCourse.number_of_holes || 18
            // }
        }
    
        
        // clubSelect.addEventListener("change", async(e) => {
        //     const clubData = await data.getClubData(e.target.value)
        //     fillCourses(clubData)
        // })
        const clubSelectedCallback = async() => {
            const club = golfClubs.find(x => x.name == clubInput.value)
            const clubData = await data.getClubData(club?.id)
            fillCourses(clubData)
        }
        clubInput.onfocus = () => {
            // views["new"].style.paddingBottom = "60vh"
            document.querySelector(".autocomplete").scrollIntoView(true)
        }
        // clubInput.onblur = () => {
        //     views["new"].style.paddingBottom = "unset"
        // }
        clubInput.onblur = () => clubSelectedCallback()
        autocomplete(clubInput, golfClubs.map(x => x.name), clubSelectedCallback)
    }
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
        reloadOverlayPos(true)
        // gameObject.cacheGame()
    } else if (newView == "history") {
        historyManager.populateHistory()
    } else if (newView == "start") {
        gameObject.reset()
    }
}

function reloadOverlayPos(collapse=false) {
    // console.log("resize")
    // pos["partResExpanded"] = parseFloat(document.querySelector(".siteheader").offsetHeight)
    let overHeight = buttons["partRes"].offsetHeight + 2*elements.getProperty(views["partRes"], 'padding-top')
    pos["partResCollapsed"] = (window.innerHeight - (overHeight ? overHeight : 66.2)) // 66.2 is the standard height for the collapsed overlay
    views["partRes"].style.top = (views["partRes"].classList.contains("collapsed") ? pos["partResCollapsed"] : pos["partResExpanded"]) + "px"
    if (collapse) {
        views["partRes"].style.top = pos["partResCollapsed"] + "px"
        views["partRes"].classList.add("collapsed")
    }
    // console.log(pos)
}

const gameObject = {
    view: views["play"],
    keeper: forms["keeper"],
    ruleset: null,
    playerCount: 0,
    holes: 18,
    gameType: null, // type name
    club: null, // club name
    golfClubs: [], // all clubs
    course: null, // course name
    players: [],
    playTypes: [], // all playforms
    play: null, // playtype info
    teamCount: null,
    teamSize: 1,
    time: null, // game start time
    create: function(e) {
        e.preventDefault()
        const data = new FormData(e.target)
        // console.log([...data.entries()])

        this.playerCount = parseInt(data.get("players"))
        this.holes = parseInt(data.get("holes"))
        this.gameType = data.get("type")
        const clubname = data.get("club")
        this.club = this.golfClubs.find(x => x.name == clubname)?.id
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
        try {
            this.clubData = await data.getClubData(this.club)
            this.courseData = this.clubData.club.courses?.find(x => x.name == this.course) || this.clubData.courseArray?.find(x => x.name == this.course)
        } catch (err) {
            console.log("Lacking club info",this.club, err)
        }
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
        if (JSON.stringify(players) === JSON.stringify(this.players) && this.time) {
            switchView("play")
        } else if (this.time) {
            const date = this.time.toISOString()
            try {
                this.replaceNames(players)
                this.players = players
                gameObject.cacheGame(false)
                gameObject.resumeGame(date)
            } catch {
                // if replacement unsuccessful, create new game
                this.time = new Date()
                this.players = players
                this.openScoreKeeper()
                gameObject.cacheGame()
            }
        } else {
            this.time = new Date()
            this.players = players
            this.openScoreKeeper()
            gameObject.cacheGame()
        }

        // gameObject.cacheGame()
    },
    replaceNames(newPlayers) {
        let oldNames = this.players.map(p=>p.name)
        let newNames = newPlayers.map(p=>p.name)
        let pts = this.ruleset.getPoints()
        for (let i=0; i<newNames.length;i++) {
            if (oldNames[i] === newNames[i]) { continue }
            for (let hole=1; hole <= this.holes; hole++) {
                if (this.teamCount) {
                    const team = newPlayers[i].team
                    let key = `Lag ${team}`
                    if (this.ruleset.teeshot) {
                        const index = pts[hole][key].length -1
                        if (!index) {continue}
                        let tee = pts[hole][key][index]
                        let nm = oldNames.indexOf(tee)
                        pts[hole][key][index] = newNames[nm]
                    } else {
                        pts[hole][key][newNames[i]] = pts[hole][key][oldNames[i]]
                        delete pts[hole][key][oldNames[i]]
                    }
                } else {
                    pts[hole][newNames[i]] = pts[hole][oldNames[i]]
                    delete pts[hole][oldNames[i]]
                }
            }

        }
        // console.log("namechange", pts)
        this.ruleset.setPoints(pts)
    },
    openScoreKeeper: function() {
        switchView("play")
        this.ruleset = new rules[this.gameType.toString()](this.players, this.holes)
        if (this.play.play_as.length > 1) {
            this.ruleset.subtype = this.play.play_as[0]
        }
        // this.ruleset.info = this.play
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
                    // breaks if inputs do not end with hole nr
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
        if (this.play.play_as.length > 1) {
            content += this.generateRuleSwitch("part")
        }
        if (rules.hcpSwitch.includes(this.gameType)) {
            // console.log("incl")
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

        // listener for hcp switch
        if (rules.hcpSwitch.includes(this.gameType)) {
            container.querySelector("#hcpSwitch")?.addEventListener("input", (e) => {
                console.log(e.target.checked)
                this.ruleset.keepHcp = e.target.checked
                this.cacheGame()
                this.showPartResults()
            })
        }

        const getRuleSubType = () => document.querySelector('input[name="part-ruleswitch"]:checked').value
        // listener for rule switch
        if (this.play.play_as.length > 1) {
            const radios = document.querySelectorAll('input[name="part-ruleswitch"]')
            if (!radios) {return}
            // document.querySelector(`input[value="${this.ruleset.subtype}"]`).checked = true
            Array.from(radios).find(x => x.value==this.ruleset.subtype).checked = true
            radios.forEach(radio => {
                radio.oninput = () => {
                    this.ruleset.switchSubtype(getRuleSubType())
                    this.cacheGame()
                    this.showPartResults()
                }
            })
        }
    },
    showResults: function(e) {
        e?.preventDefault()

        gameObject.ruleset.readInputs()
        let points = gameObject.ruleset.calculateScores()
        let container = forms["keeper"].querySelector(".results")
        let content = ""
        let rank
        if (this.ruleset.order == "desc") {
            rank = Object.entries(points).sort((a, b) => b[1]["points"] - a[1]["points"])
        } else {
            rank = Object.entries(points).sort((a, b) => a[1]["points"] - b[1]["points"])
        }
        content += `<img class="dropdown-toggle action-button" id="result-action-button" src="img/icons/vertical-dots.svg" alt="menu button">
        <ul class="dropdown-list" id="result-action-list">
            <li class="save">Save</li>
            <li class="share">Share</li>
        </ul>`
        content += `<div class="col left"><h3>Rankning</h3>`
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
        if (this.play.play_as.length > 1) {
            content += this.generateRuleSwitch("end")
        }
        if (rules.hcpSwitch.includes(this.gameType)) {
            console.log("incl")
            content += `<label>Behåll original handicap<input type="checkbox" class="checkbox" id="hcpSwitchRes"${this.ruleset.keepHcp?' checked':''}></label>`
        }
        content += this.ruleset.generateScoreCard("v")
        container.innerHTML = content
        // listener for hcp switch
        if (rules.hcpSwitch.includes(this.gameType)) {
            container.querySelector("#hcpSwitchRes")?.addEventListener("input", (e) => {
                console.log(e.target.checked)
                this.ruleset.keepHcp = e.target.checked
                this.cacheGame()
                this.showResults(null)
            })
        }

        const getRuleSubType = () => document.querySelector('input[name="end-ruleswitch"]:checked').value
        // listener for rule switch
        if (this.play.play_as.length > 1) {
            const radios = document.querySelectorAll('input[name="end-ruleswitch"]')
            if (!radios) {return}
            // document.querySelector(`input[value="${this.ruleset.subtype}"]`).checked = true
            // Array.from(radios).find(x => x.value==this.ruleset.subtype).checked = true
            radios.forEach(radio => {
                radio.oninput = () => {
                    console.log("switch")
                    this.ruleset.switchSubtype(getRuleSubType())
                    this.cacheGame()
                    this.showResults(null)
                }
            })
        }

        // dropdown action menu
        const dropbutton = document.getElementById("result-action-button")
        const dropdown = document.getElementById("result-action-list")
        dropbutton.onclick = () => {dropdown.classList.toggle("show")}
        document.querySelector("#result-action-list li.save").onclick = () => {
            dropdown.classList.remove("show")
            this.download()
        }
        document.querySelector("#result-action-list li.share").onclick = () => {
            dropdown.classList.remove("show")
            this.share()
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
    cacheGame: function(refresh=true) {
        const date = this.time.toISOString()
        if (refresh) this.ruleset?.readInputs()
        const gameData = {
            playerCount: this.playerCount,
            players: this.players,
            holes: this.holes,
            gameType: this.gameType,
            subtype: this.ruleset?.subtype,
            club: this.club,
            course: this.course,
            teamCount: this.teamCount,
            teamSize: this.teamSize,
            keepHcp: this.ruleset?.keepHcp,
            time: date,
            scores: this.ruleset?.getPoints() || []
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
        this.play = this.playTypes.find(x => x.id === this.gameType)
        if (this.course) {
            await this.loadCourseData()
        }
        this.fillSetupInputs()
        this.openScoreKeeper()
        this.ruleset.setPoints(game.scores)
        if (game.subtype) {
            this.ruleset.subtype = game.subtype
        }
        if (game.keepHcp) {
            this.ruleset.keepHcp = game.keepHcp
        }
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
            const clubData = await data.getClubData(this.club)
            document.getElementById("golfClub").value = clubData?.club?.name
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
    },
    generateRuleSwitch(id="general") {
        let content = '<div class="radio-group radio-outer-container rule-switch">'
        content += this.play.play_as.map(x=> `<label class="radio-inner-container">
            <input type="radio" id="${id}-switch-${x}" name="${id}-ruleswitch" value="${x}"/>
            <span class="radio-button">${gameObject.playTypes.find(p => p.id === x).name}</span></label>`).join("\n")
        content += `</div>`
        return content
    },
    download: () => {
        const content = gameObject.convertResults()
        const expo = new ExportManager(content, gameObject.time.toISOString(), "download")
        expo.open()
    },
    share: () => {
        const content = gameObject.convertResults()
        const expo = new ExportManager(content, gameObject.time.toISOString(), "share")
        expo.share()
    },
    convertResults: () => {
        return forms["keeper"].querySelector(".results .scorecard")
    },
    fillRandom: () => {
        const inputs = forms["keeper"].querySelectorAll("input[type=number]")
        inputs.forEach(inp => {
            if (!inp.value) {
                inp.value = random(1, 10)
            }
        })
        gameObject.cacheGame(true)
    }
}


setup.init() // run setup

export {
    gameObject,
    data
}