/**
 * @module golf-rules
 */

import { gameObject } from "./golfappen.js"

const baseTypes = {
    order: {
        "desc": ["matchgame", "pointbogey"],
        "asc": ["shotcomp", "shotgolf"]
    },
    getOrder: (name) => {
        return baseTypes.order.desc.includes(name) ? "desc" : "asc"
    },
    matchgame: (obj, keepformat=false, pts=null) => {
        console.log("sub match")
        const objPts = pts || obj.getPoints()
        let points = {}
        
        let minHcp = Math.min(...obj.players.map(p => p.handicap))
        for (let i=1; i<=obj.holes; i++) {
            points[i] = {}
            let holePoints = []
            if (!obj.teamCount) {
                obj.players.map((player) => {
                    points[i][player.name] = 0
                    let index = objPts[i]["index"]
                    let hits = objPts[i][player.name]
                    const hcp = player.handicap - minHcp
                    let extra_par = obj.calculatePlayerPar(hcp, index)
                    if (hits <= 0 || !hits) {
                        if (objPts[i]["winner"] == player.name){
                            points[i][player.name] = 1
                        }
                        return
                    }

                    holePoints.push([hits-extra_par, player.name])
                })
            } else {
                let teams = [...Array(obj.teamCount+1).keys()]
                teams.shift()
                teams = teams.map(n => `Lag ${n}`)
                teams.map((team)=> {
                    points[i][team] = 0
                    let hits = objPts[i][team]
                    if (hits <= 0 || !hits) {
                        return
                    }

                    holePoints.push([hits, team])
                })
            }
            
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
        // obj.calculatedPoints = points
        // console.log(points)
        return points
    },
    shotcomp: (obj, keepformat=false) => {
        console.log("sub shotcomp")
        const objPts = obj.getPoints()
        let points = {}
        if (!keepformat) {
            for (let i=1; i<=obj.holes; i++) {
                points[i] = {}
                obj.players.forEach(player => {
                    points[i][player.name] = 0
                    if (!objPts[i][player.name]) { return }
                    let extra = obj.calculatePlayerPar(player.handicap, objPts[i].index)
                    points[i][player.name] = extra < objPts[i][player.name] ? objPts[i][player.name] - extra : 0
                })
            }
        } else {
            // points = objPts
            for (let i=1; i<=obj.holes; i++) {
                points[i] = {
                    par: objPts[i]["par"],
                    index: objPts[i]["index"]
                }
                if (obj.teamCount) {
                    for (let j=1; j<=obj.teamCount; j++) {
                        let key = `Lag ${j}`
                        points[i][key] = {}
                        Object.keys(objPts[i][key]).forEach(player => {
                            const hits = objPts[i][key][player]
                            if (!hits) { return }
                            const extra = obj.calculatePlayerPar(obj.calculateHcp(player), objPts[i]["index"])
                            points[i][key][player] = extra < objPts[i][key][player] ? objPts[i][key][player] - extra : 0
                        })
                    }
                } else {
                    obj.players.forEach(player => {
                        let hits = objPts[i][player.name]
                        if (!hits) { return }
                        // points[i][player.name] = 0
                        let extra = obj.calculatePlayerPar(player.handicap, objPts[i].index)
                        points[i][player.name] = extra < hits ? hits - extra : 0
                    })
                }
            }
        }

        return points
    },
    shotgolf: (obj, keepformat=false) => {
        console.log("sub shotgolf")
        const objPts = obj.getPoints()
        let points = {}
        if (!keepformat) {
            for (let i=1; i<=obj.holes; i++) {
                points[i] = {}
                obj.players.forEach(player => {
                    points[i][player.name] = 0
                    let point = objPts[i][player.name]
                    if (!point) { return }
                    let par = objPts[i]["par"]
                    let extra = obj.calculatePlayerPar(player.handicap, objPts[i].index)
                    let hcpPoint = point - extra
                    let max = par + 5
                    points[i][player.name] = hcpPoint > max ? max : hcpPoint
                })
            }
        } else {
            // points = objPts
            for (let i=1; i<=obj.holes; i++) {
                points[i] = {
                    par: objPts[i]["par"],
                    index: objPts[i]["index"]
                }
                if (obj.teamCount) {
                    for (let j=1; j<=obj.teamCount; j++) {
                        let key = `Lag ${j}`
                        points[i][key] = {}
                        Object.keys(objPts[i][key]).forEach(player => {
                            const hits = objPts[i][key][player]
                            if (!hits) { return }
                            let par = objPts[i]["par"]
                            let index = objPts[i]["index"]
                            const extra = obj.calculatePlayerPar(obj.calculateHcp(player), index)
                            let hcpPoint = hits - extra
                            let max = par + 5
                            points[i][key][player] = hcpPoint > max ? max : hcpPoint
                        })
                    }
                } else {
                    obj.players.forEach(player => {
                        // points[i][player.name] = 0
                        let point = objPts[i][player.name]
                        if (!point) { return }
                        let par = objPts[i]["par"]
                        let extra = obj.calculatePlayerPar(player.handicap, objPts[i].index)
                        let hcpPoint = point - extra
                        let max = par + 5
                        points[i][player.name] = hcpPoint > max ? max : hcpPoint
                    })
                }
                
            }
            
        }
        // obj.calculatedPoints = points
        return points
    },
    pointbogey: (obj, keepformat=false) => {
        console.log("sub point")
        const objPts = obj.getPoints()
        let pts = {}
        if (!keepformat) {
            for (let i=1; i<=obj.holes; i++) {
                pts[i] = {}
                obj.players.forEach(player => {
                    pts[i][player.name] = 0
                    let hits = objPts[i][player.name]
                    if (!hits) { return }
                    let par = objPts[i]["par"]
                    let index = objPts[i]["index"]
                    let player_par = par + obj.calculatePlayerPar(player.handicap, index)
                    let point = 2 - (hits - player_par)
                    if (point < 0) {
                        point = 0
                    }
                    pts[i][player.name] = point
                })
            }
        } else {
            pts = {}
            for (let i=1; i<=obj.holes; i++) {
                pts[i] = {
                    par: objPts[i]["par"],
                    index: objPts[i]["index"]
                }

                if (obj.teamCount) {
                    for (let j=1; j<=obj.teamCount; j++) {
                        let key = `Lag ${j}`
                        pts[i][key] = {}
                        Object.keys(objPts[i][key]).forEach(player => {
                            const hits = objPts[i][key][player]
                            if (!hits) { return }
                            let par = pts[i]["par"]
                            let index = pts[i]["index"]
                            let player_par = par + obj.calculatePlayerPar(obj.calculateHcp(player), index)
                            let point = 2 - (hits - player_par)
                            // console.log(hits, point)
                            if (point < 0) {
                                point = 0
                            }
                            pts[i][key][player] = point
                        })
                    }
                } else {
                    obj.players.forEach(player => {
                        // pts[i][player.name] = 0
                        let hits = objPts[i][player.name]
                        if (!hits) { return }
                        let par = pts[i]["par"]
                        let index = pts[i]["index"]
                        let player_par = par + obj.calculatePlayerPar(player.handicap, index)
                        let point = 2 - (hits - player_par)
                        if (point < 0) {
                            point = 0
                        }
                        pts[i][player.name] = point
                    })
                }
            }
        }

        // obj.calculatedPoints = pts
        return pts
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
        this.subtype = null
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

    getPoints() {
        return this._points
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
        let formData = new FormData(rules.scorekeeper)
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

    calculateHcp(player) {
        let p = Object.keys(player).includes("handicap") ? player : this.players.find(x => x.name == player)
        return Math.round(p.handicap)
    }

    calculatePoints() {
        if (this.subtype && baseTypes[this.subtype]) {
            const res = baseTypes[this.subtype](this)
            this.calculatedPoints = res
            return res
        }
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
        console.log("calculateScores")
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
        const pointgame = rules.pointGames.includes(this.name) || rules.pointGames.includes(this.subtype)
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
            const scratch = !this.players.map(x=>x.handicap).find(x=>x !== 0)
            tbl += `<table class="scorecard vertical${scratch?" hide-notes":""}">
            <tr>
                <th rowspan="2">Hole</th>
                <th rowspan="2">Par</th>
                <th rowspan="2">Index</th>
            `
            tbl += this.players.map(player => `<th colspan="2">${player.name} (${this.calculateHcp(player)}hcp)</th>`).join("\n")
            tbl += `</tr><tr>`
            tbl += `<th>Slag</th><th>${match||pointgame?"Poäng":"Netto"}</th>\n`.repeat(this.playernames.length)
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
                    ${this.playernames.map(player => {
        if (match) {
            return `<td class="left-indent"><span class="super">${this.calculatePlayerPar(this.calculateHcp(player), this._points[i].index)}</span>${this._points[i][player]}</td>
            <td${this.calculatedPoints[i][player]?' class="win"':''}>${this.calculatedPoints[i][player]}</td>`
        }
        return `<td>${this._points[i][player]}</td>
        <td class="left-indent"><span class="super">${this.calculatePlayerPar(this.calculateHcp(player), this._points[i].index)}</span>
        ${this.calculatedPoints[i][player]}</td>`
    }).join("\n")}
                </tr>
                `
                if (i == 9) {
                    tbl += `
                    <tr class="sum-row">
                        <th>Ut</th>
                        <td>${sum1.par}</td>
                        <td></td>
                        ${this.playernames.map(player => `<td>${sum1[player][0]}</td><td>${sum1[player][1]}</td>`).join("\n")}
                    </tr>`
                } else if (i == 18) {
                    tbl += `
                    <tr class="sum-row">
                        <th>In</th>
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
        // if (this.info.play_as.length > 1) {
        //     const swtch = this.generateRuleSwitch()
        //     return swtch + tbl
        // }
        return tbl
    }

    generateRuleSwitch() {
        let content = '<div class="radio-group rule-switch">'
        content += this.info.play_as.map(x=> `<input type="radio" id="switch-${x}" name="ruleswitch" value="${x}"/>
            <label for="switch-${x}">${gameObject.playTypes.find(p => p.id === x).name}</label>`).join("\n")
        content += `</div>`
        return content
    }

    switchSubtype(newSubtype) {
        this.subtype = newSubtype
        // this.calculatePoints()
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
        content += `
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
        let formData = new FormData(rules.scorekeeper)
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
        }
        this.calculatedPoints = points
        // console.log(this.calculatedPoints)
        return points
    }

    calculateScores() {
        console.log("calcScores")
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
        const pointgame = rules.pointGames.includes(this.name) || rules.pointGames.includes(this.subtype)
        const scratch = !this.players.map(x=>x.handicap).find(x=>x !== 0)
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
            tbl += `<table class="scorecard vertical${scratch?" hide-notes":""}">
            <tr>
                <th rowspan="2">Hål</th>
                <th rowspan="2">Par</th>
                <th rowspan="2">Index</th>
            `
            tbl += teams.map(team => `<th colspan="${this.teeshot?3:2}">Lag ${team} (${this.calculateHcp(team)}hcp)</th>`).join("\n")
            tbl += `</tr><tr>`
            tbl += `${this.teeshot?'<th>Utslag</th>':''}<th>Slag</th><th>${match||pointgame?"Poäng":"Netto"}</th>\n`.repeat(this.teamCount)
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
                        <th>Ut</th>
                        <td>${sum1.par}</td>
                        <td class="empty"></td>
                        ${teams.map(team => `${this.teeshot?'<td class="empty"></td>':''}<td>${sum1[`Lag ${team}`][0]}</td><td>${sum1[`Lag ${team}`][1]}</td>`).join("\n")}
                    </tr>`
                } else if (i == 18) {
                    tbl += `
                    <tr class="sum-row">
                        <th>In</th>
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

class GolfSome extends TeamGame {
    constructor(players, holes, name="some") {
        super(players, holes, name)
        this.keepHcp = false
        // this.teamCount = gameObject.teamCount
    }

    calculateHcp (team) {
        let hcps = this.players.filter(x => x.team == team).map(x=>x.handicap)
        let res = 0
        hcps.map(h=>res += h*0.5)
        return Math.round(res)
    }
}

class Scram extends TeamGame {
    constructor(players, holes, name="scramble") {
        super(players, holes, name)
    }

    calculateHcp (team) {
        let hcps = this.players.filter(x => x.team == team).map(x=>x.handicap)
        hcps.sort((a,b) => a - b) // asc
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
}

class FourBall extends TeamGame {
    constructor(players, holes, name="fourball") {
        super(players, holes, name)
        this.keepHcp = false
        this.order = "desc"
    }

    setPoints(points) {
        this._points = points
        // this.calculatePoints()
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
        content += `
        <div class="col white hole" id="hole${hole}">
            <h3>Hål ${hole}</h3>
            ${topPart}`

        for (let i=1; i<=this.teamCount; i++) {
            content += `<fieldset><legend>Lag ${i}</legend>`
            content += this.players.map(player => {
                if (player.team === i) {
                    return `<label>${player.name}: <input type="number" name="team${i}-${player.name}-${hole}" min="0" max="999"></label>`
                }
            }).join("\n")
            content += `</fieldset>`
        }

        content += `</div>`

        return content
    }

    calculateHcp(player) {
        let p = Object.keys(player).includes("handicap") ? player : this.players.find(x => x.name == player)
        return this.keepHcp ? p.handicap : Math.round(p.handicap * 0.9)
    }

    readInputs() {
        let formData = new FormData(rules.scorekeeper)
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
                        playerPoints[player.name] = parseInt(formData.get(`team${j}-${player.name}-${i}`)) || 0
                    }
                })
                points[i][`Lag ${j}`] = playerPoints
            }
            // this.players.forEach(p => {
            //     points[i][p.name] = parseInt(formData.get(`${p.name}-${i}`)) || 0
            // })
        }
        this.setPoints(points)
        // console.log(points)
    }

    calculatePoints() {
        let pts = {}
        let scores
        // console.log(this.subtype)
        if (this.subtype && baseTypes[this.subtype] && !["shotcomp", "matchgame"].includes(this.subtype)) {
            // console.log("points", this._points)
            scores = baseTypes[this.subtype](this, true)
            for (let i=1; i<=this.holes; i++) {
                pts[i] = {}
                for (let j=1; j<=this.teamCount; j++) {
                    let key = `Lag ${j}`
                    pts[i][key] = 0
                    if (!scores[i][key]) { continue }
                    const comp = [...Object.values(scores[i][key])]
                    if (baseTypes.getOrder(this.subtype) === "asc") {
                        pts[i][key] = comp.length > 0 ? Math.min(...comp) : 0
                    } else {
                        pts[i][key] = comp.length > 0 ? Math.max(...comp) : 0
                    }
                }
            }
        } else {
            scores = Object.assign({}, this._points)//{...this._points}
            // console.log(this._points)
            for (let i=1; i<=this.holes; i++) {
                pts[i] = {}
                for (let j=1; j<=this.teamCount; j++) {
                    let key = `Lag ${j}`
                    pts[i][key] = 0
                    if (!scores[i][key]) { continue }
                    const comp = []
                    for (const p of Object.keys(scores[i][key])) {
                        if (!scores[i][key][p]) {continue}
                        const hcp = this.calculateHcp(p)
                        let extra = this.calculatePlayerPar(hcp, scores[i].index)
                        comp.push(extra < scores[i][key][p] ? scores[i][key][p] - extra : 0)
                    }
                    pts[i][key] = comp.length > 0 ? Math.min(...comp) : 0
                }
            }
            if (this.subtype === "matchgame") {
                const otherPoints = baseTypes.matchgame(this, true, pts)
                // console.log(otherPoints)
                pts = otherPoints
            }
        }

        this.calculatedPoints = pts
        // console.log(this.calculatedPoints)
        return pts
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
        const pointgame = rules.pointGames.includes(this.name) || rules.pointGames.includes(this.subtype)
        const scratch = !this.players.map(x=>x.handicap).find(x=>x !== 0)
        this.calculatePoints()
        const teams = [...Array(this.teamCount+1).keys()]
        teams.shift()
        // console.log(teams)
        // console.log(this.teeshot)
        const teamMembers = {}
        teams.forEach(x => {teamMembers[x] = []})
        this.players.forEach(p=>teamMembers[p.team].push(p.name))

        // console.log("scorecard: ", this._points)
        let tbl = `<div class="horizontal-scroll">`
        if (dir == "v" || dir.includes("v")) {
            tbl += `<table class="scorecard vertical${scratch?" hide-notes":""}">
            <tr>
                <th rowspan="2">Hole</th>
                <th rowspan="2">Par</th>
                <th rowspan="2">Index</th>
            `
            tbl += teams.map(team => `<th colspan="${teamMembers[team].length+1}">Lag ${team}</th>`).join("\n")
            tbl += `</tr><tr>`
            tbl += teams.map(team => `${teamMembers[team].map(p=>`<th><span class="super centered">(${this.calculateHcp(p)}hcp)</span>${p}</th>`).join("\n")}<th>${match||pointgame?"Poäng":"Netto"}</th>`).join("\n")
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
                sum1[`Lag ${team}`] = Array(teamMembers[team].length + 1).fill(0)
                sum2[`Lag ${team}`] = Array(teamMembers[team].length + 1).fill(0)
            })
            // teams.map(team => sum[`Lag ${team}`] = [0, 0])

            for (let i=1; i<=this.holes; i++) {
                (i<=9?sum1:sum2).par += this._points[i].par;
                (i<=9?sum1:sum2).index += this._points[i].index
                teams.map(team => {
                    (i<=9?sum1:sum2)[`Lag ${team}`][0] += this.calculatedPoints[i][`Lag ${team}`]
                    // iterate through team members
                    for (let j = 1; j <= teamMembers[team].length; j++) {
                        (i<=9?sum1:sum2)[`Lag ${team}`][j] += this._points[i][`Lag ${team}`][teamMembers[team][j-1]]
                    }
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
                        <th>Ut</th>
                        <td>${sum1.par}</td>
                        <td class="empty"></td>
                        ${teams.map(team => {
        let cont = ""
        for (let j = 1; j <= teamMembers[team].length; j++) {
            cont += `<td>${sum1[`Lag ${team}`][j]}</td>`
        }
        cont += `<td>${sum1[`Lag ${team}`][0]}</td>`
        return cont
    }).join("\n")}
                    </tr>`
                } else if (i == 18) {
                    tbl += `
                    <tr class="sum-row">
                        <th>In</th>
                        <td>${sum2.par}</td>
                        <td class="empty"></td>
                        ${teams.map(team => {
        let cont = ""
        for (let j = 1; j <= teamMembers[team].length; j++) {
            cont += `<td>${sum2[`Lag ${team}`][j]}</td>`
        }
        cont += `<td>${sum2[`Lag ${team}`][0]}</td>`
        return cont
    }).join("\n")}
                    </tr>`
                }
                if (i == this.holes) {
                    tbl += `
                    <tr class="sum-row">
                        <th>Total</th>
                        <td>${sum1.par + sum2.par}</td>
                        <td class="empty"></td>
                        ${teams.map(team => {
        let cont = ""
        for (let j = 1; j <= teamMembers[team].length; j++) {
            cont += `<td>${sum1[`Lag ${team}`][j] + sum2[`Lag ${team}`][j]}</td>`
        }
        cont += `<td>${sum1[`Lag ${team}`][0] + sum2[`Lag ${team}`][0]}</td>`
        return cont
    }).join("\n")}
                    </tr>`
                }
            }
        }
        tbl += `</table></div>`
        // if (this.info.play_as.length > 1) {
        //     const swtch = this.generateRuleSwitch()
        //     return swtch + tbl
        // }
        return tbl
    }


    fillInputs() {
        if (!this._points || Array.isArray(this._points)) {return}
        console.log("fill: ", this._points)
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
                    document.getElementsByName(`team${p.team}-${p.name}-${i}`)[0].value = pts
                }
            })

        }
    }
}

const rules = {
    scorekeeper: document.getElementById("scoreKeeper"),
    forms: [],
    implemented: ["shotcomp","pointbogey","matchgame", "shotgolf", 
        "copenhagener", "nassau", "foursome", "greensome", "irishgreen", "scramble", 
        "dropoutscram", "texscramble", "fourball", "fourballbewo", "fourballbeto", "tryall", "hallington", "rumble"],
    utslagGames: ["foursome", "greensome", "irishgreen", "texscramble", "some"],
    usingTopBanner: ["matchgame"],
    hcpSwitch: ["fourball", "fourballbewo", "fourballbeto", "matchgame"],
    pointGames: ["matchgame", "pointbogey", "copenhagener", "fourballbewo", "fourballbeto", "hallington"],
    matchgame: class MatchGame extends GameRules {
        constructor(players, holes) {
            super(players, holes, "matchgame")
            this.order = "desc"
            this.keepHcp = false
            this.minHcp = Math.min(...this.players.map(p => p.handicap))
        }

        calculateHcp(player) {
            let p = Object.keys(player).includes("handicap") ? player :  this.players.find(x => x.name == player)
            return this.keepHcp ? p.handicap : p.handicap - this.minHcp
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
            content += `
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
            let formData = new FormData(rules.scorekeeper)
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
            const formData = new FormData(rules.scorekeeper)
            let holePoints = {}
            let index = parseInt(formData.get(`index-${hole}`)) || 0
            
            this.players.forEach(p => {
                const hcp = this.calculateHcp(p)
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
            
            // let minHcp = Math.min(...this.players.map(p => p.handicap))
            for (let i=1; i<=this.holes; i++) {
                points[i] = {}
                let holePoints = []
                this.players.map((player) => {
                    points[i][player.name] = 0
                    let index = this._points[i]["index"]
                    let hits = this._points[i][player.name]
                    const hcp = this.calculateHcp(player)
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
            console.log("calcRelPoints")
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
            return super.generateScoreCard(dir, true)
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
    },
    nassau: class Nassau extends GameRules {
        constructor(players, holes) {
            super(players, holes, "nassau")
            this.winners = {}
            this.sumPoints = {}
        }
    
        setPoints(points) {
            this._points = points
            this.calculateScores()
        }
    
        calculatePoints() {
            if (this.subtype && baseTypes[this.subtype]) {
                this.order = baseTypes.getOrder(this.subtype)
                const points = baseTypes[this.subtype](this)
                // console.log(this.subtype, points)
                this.calculatedPoints = points
                return points
            } else {
                return super.calculatePoints()
            }
        }
    
        calculateScores() {
            // console.log("calcScores")
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
            // console.log(total)
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
    },
    hallington: class Hallington extends GameRules {
        constructor(players, holes) {
            super(players, holes, "hallington")
            this.order = "desc"
        }

        calculatePoints() {
            let points = {}
            for (let i=1; i<=this.holes; i++) {
                points[i] = {}
                this.players.forEach(player => {
                    points[i][player.name] = 0
                    let hits = this._points[i][player.name]
                    if (!this._points[i][player.name]) { return }
                    let par = this._points[i]["par"]
                    let point = par * 2 - hits
                    points[i][player.name] += point > 0 ? point : 0
                })
            }
            this.calculatedPoints = points
            return points
        }

        generateScoreCard(dir="v", match=false) {
            const pointgame = rules.pointGames.includes(this.name) || rules.pointGames.includes(this.subtype)
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
                tbl += `<th>Slag</th><th>${match||pointgame?"Poäng":"Netto"}</th>\n`.repeat(this.playernames.length)
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
                            <td>${this.calculatedPoints[i][player]}</td>`).join("\n")}
                    </tr>
                    `
                    if (i == 9) {
                        tbl += `
                        <tr class="sum-row">
                            <th>Ut</th>
                            <td>${sum1.par}</td>
                            <td></td>
                            ${this.playernames.map(player => `<td>${sum1[player][0]}</td><td>${sum1[player][1]}</td>`).join("\n")}
                        </tr>`
                    } else if (i == 18) {
                        tbl += `
                        <tr class="sum-row">
                            <th>In</th>
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
                        </tr>
                        <tr class="sum-row">
                            <th colspan="3">Slutlig poäng</th>
                            
                            ${this.players.map(player => `<td colspan="2" class="left-indent">
                                <span class="super">${player.handicap}</span>
                                ${sum1[player.name][1] + sum2[player.name][1] + player.handicap}</td>`).join("\n")}
                        </tr>
                        `
                    }
                }
            }
            tbl += `</table></div>`
            return tbl
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
            let scores
            let asc = true
            // console.log(this.subtype)
            const subbed = this.subtype && baseTypes[this.subtype] && !["shotcomp", "matchgame"].includes(this.subtype)
            if (subbed) {
                // console.log("points", this._points)
                scores = baseTypes[this.subtype](this, true)
                console.log(scores, this._points)
                asc = baseTypes.getOrder(this.subtype) == "asc"
            } else {
                scores = {...this._points}
            }
            for (let i=1; i<=this.holes; i++) {
                points[i] = {}
                let holePoints = {}
                for (let j=1; j<=this.teamCount; j++) {
                    holePoints[j] = []
                    let key = `Lag ${j}`
                    points[i][key] = 0
                    if (!scores[i][key]) { continue }
                    for (const p of Object.keys(scores[i][key])) {
                        if (!scores[i][key][p]) {
                            holePoints[j].push(asc?999:-1)
                            continue
                        }
                        if (subbed) {
                            holePoints[j].push(scores[i][key][p])
                        } else {
                            // if (!scores[i][key][p]) {continue}
                            const hcp = this.calculateHcp(p)
                            let extra = this.calculatePlayerPar(hcp, scores[i].index)
                            holePoints[j].push(extra < scores[i][key][p] ? scores[i][key][p] - extra : 0)
                        }
                    }
                }
                Object.values(holePoints).forEach(lst => lst.sort((a, b)=> asc ? a-b : b-a)) // sort team points
                // get each teams best and worst
                const bests = Object.values(holePoints).map(x => x[0])
                const worsts = Object.values(holePoints).map(x => x[1])
                // get the best and worst points
                const best = asc ? Math.min(...bests) : Math.max(...bests) 
                const beWo = asc ? Math.min(...worsts) : Math.max(...worsts)
                // get list containing best and worst
                const bestLst = Object.keys(holePoints).filter(key => holePoints[key][0] === best)
                const beWoLst = Object.keys(holePoints).filter(key => holePoints[key][1] === beWo)
                // give points if only one list matches
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
            return super.generateScoreCard(dir, true)
        }
    },
    fourballbeto: class FourballBeTo extends FourBall {
        constructor(players, holes) {
            super(players, holes)
        }

        calculatePoints() {
            let points = {}
            let scores
            let asc = true
            // console.log(this.subtype)
            const subbed = this.subtype && baseTypes[this.subtype] && !["shotcomp", "matchgame"].includes(this.subtype)
            if (subbed) {
                // console.log("points", this._points)
                scores = baseTypes[this.subtype](this, true)
                console.log(scores, this._points)
                asc = baseTypes.getOrder(this.subtype) == "asc"
            } else {
                scores = {...this._points}
            }
            for (let i=1; i<=this.holes; i++) {
                points[i] = {}
                let holePoints = {}
                for (let j=1; j<=this.teamCount; j++) {
                    holePoints[j] = []
                    let key = `Lag ${j}`
                    points[i][key] = 0
                    if (!scores[i][key]) { continue }
                    for (const p of Object.keys(scores[i][key])) {
                        if (!scores[i][key][p]) {
                            holePoints[j].push(asc?999:-1)
                            continue
                        }
                        if (subbed) {
                            holePoints[j].push(scores[i][key][p])
                        } else {
                            // if (!scores[i][key][p]) {continue}
                            const hcp = this.calculateHcp(p)
                            let extra = this.calculatePlayerPar(hcp, scores[i].index)
                            holePoints[j].push(extra < scores[i][key][p] ? scores[i][key][p] - extra : 0)
                        }
                    }
                }
                Object.values(holePoints).forEach(lst => lst.sort((a, b)=> asc ? a-b : b-a)) // sort team points
                // get each teams best and total
                const bests = Object.values(holePoints).map(x => x[0])
                const totals = Object.values(holePoints).map(x => x[0] + x[1])
                // get the best and total points
                const best = asc ? Math.min(...bests) : Math.max(...bests) 
                const beTot = asc ? Math.min(...totals) : Math.max(...totals)
                // get list containing best and total
                const bestLst = Object.keys(holePoints).filter(key => holePoints[key][0] === best)
                const beTotLst = Object.keys(holePoints).filter(key => holePoints[key][0] + holePoints[key][1] === beTot)
                // give points if only one list matches
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
            return super.generateScoreCard(dir, true)
        }
    },
    rumble: class Rumble extends FourBall {
        constructor(players, holes) {
            super(players, holes, "rumble")
        }

        calculatePoints() {
            let pts = {}
            let scores

            scores = Object.assign({}, this._points)//{...this._points}
            // console.log(this._points)
            for (let i=1; i<=this.holes; i++) {
                pts[i] = {}
                for (let j=1; j<=this.teamCount; j++) {
                    let key = `Lag ${j}`
                    pts[i][key] = 0
                    if (!scores[i][key]) { continue }
                    const comp = []
                    for (const p of Object.keys(scores[i][key])) {
                        if (!scores[i][key][p]) {continue}
                        const hcp = this.calculateHcp(p)
                        let extra = this.calculatePlayerPar(hcp, scores[i].index)
                        comp.push(extra < scores[i][key][p] ? scores[i][key][p] - extra : 0)
                    }
                    comp.sort((a,b)=>a-b)
                    if (comp.length == 0) {
                        pts[i][key] = 0
                    } else if (i<=6) {
                        pts[i][key] = comp.length >= 1 ? comp[0] : 0
                    } else if (7 <= i && i <= 12) {
                        pts[i][key] = (comp.length >= 1 ? comp[0] : 0) + (comp.length >= 2 ? comp[1] : 0)
                    } else {
                        pts[i][key] = (comp.length <= 3 ? comp : comp.slice(0, 3)).reduce((a,b)=>a+b)
                    }
                }
            }

            this.calculatedPoints = pts
            // console.log(this.calculatedPoints)
            return pts
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

export default rules