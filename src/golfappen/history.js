/**
 * @module history
 */

import { gameObject, data } from "./golfappen.js"
import rules from "./golf-rules.js"

const storage = window.localStorage //window.sessionStorage
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
        const repaired = list.filter(item => {
            const game = historyManager.getGame(item)
            if (!game) {return false}
            if (!rules[game.gameType]) {
                storage.removeItem(item)
                return false
            }
            return item && typeof item == 'string'
        })
        console.log("history repair", list, repaired)
        historyManager.setHistory(repaired)
    },
    getLatest: function() {
        const his = this.getHistory()
        return this.getGame(his[0])
    },
    populateHistory: async function(iteration=1) {
        const games = this.getHistory()
        this.plays = await data.loadPlayTypes()
        this.clubs = await data.loadGolfClubs()
        try {
            document.querySelector("#historyView .list").innerHTML = games.map(x => {
                const game = historyManager.getGame(x)
                let clubLine = ""
                let winLine = ""
                const subline = game.subtype ? `<p>Variant: ${this.plays.find(p => p.id === game.subtype).name}</p>` : ""
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
                ${subline}
                ${winLine}
                <div class="collapsed scores"></div>
                <div class="horizontal-flex">
                    ${!Array.isArray(game.scores) ? '<button class="expand">Visa scorekort</button>': ''}
                    <button class="continue">Fortsätt</button>
                </div>
            </div>`
            }).join("\n")
        } catch (err) {
            console.log(err)
            if (iteration >= 3) {
                document.querySelector("#historyView .list").innerHTML = games.map(x => {
                    try {
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
                    } catch {
                        return `<p>error with ${x}</p>`
                    }
                }).join("\n")
            } else {
                await historyManager.repairHistory()
                console.log("Fixing history")
                return historyManager.populateHistory(iteration+1)
            }
        }
        games.map(x => {
            const parent = document.getElementById(x)
            if (!parent) {return}
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
                if (game.subtype) { ruleset.subtype = game.subtype}
                ruleset.setPoints(game.scores)
                ruleset.calculatePoints()
                cont.innerHTML = ruleset.generateScoreCard("v")
            }
            
        } else {
            ele.querySelector(`.expand`).innerText = "Visa scorekort"
        }
        cont.classList.toggle("collapsed")
    }
}

export default historyManager