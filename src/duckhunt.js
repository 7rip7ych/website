// responsiveness
const menuToggle = document.getElementById('menu-toggle')
const navLinks = document.getElementById('nav-links')

menuToggle.addEventListener('click', () => {
  navLinks.classList.toggle('show')
})


// example animations
const examples = document.querySelectorAll("img.example")
if (examples) {
  examples.forEach(ex => ex.addEventListener("click", () => {
    ex.classList.add("animate")
    setTimeout(() => {
      ex.classList.remove("animate")
    }, 1000)
  }))
}


screen.orientation.addEventListener("change", () => {
  document.body.style.display = "none"
  gameWindow.orient = screen.orientation.type
  gameObject.getSizeFactor()
  duck.size = gameObject.size * gameObject.sizeFactor
  setTimeout(() => {
    document.body.style.display = "block"
  }, 10)
})

window.addEventListener("touchstart", () => {
  gameWindow.clickType = "touch"
}, { once: true })

// duckhunt 2
const imgUrl = "https://raw.githubusercontent.com/7rip7ych/duckhunt-images/refs/heads/main/"

let gameWindow = {
  clickType: "mouse",
  orient: screen.orientation.type,
  mute: false,
  container: document.getElementById("gameContainer"),
  view: document.getElementById("gameView"),
  form: document.getElementById("duckhuntSetup"),
  inactive: document.getElementById("inactiveDisplay"),
  loading: '<div class="game-menu"><h2>Loading...</h2></div>',
  quit: document.getElementById("quitGame"),
  titleScreen: document.getElementById("titleScreen"),
  open: async function() {
    // intro animation
    gameWindow.titleScreen.classList.add("animate-fade-in")
    gameWindow.playSound("titleSound")
    document.body.classList.add("hide")
    let closeTitle = setTimeout(() => {
      gameWindow.titleScreen.classList.remove("animate-fade-in")
      gameWindow.openSettings()
    }, 5000)

    gameWindow.titleScreen.addEventListener("click", () => {
      clearTimeout(closeTitle)
      gameWindow.stopSound("titleSound")
      gameWindow.titleScreen.classList.remove("animate-fade-in")
      gameWindow.openSettings()
    })

    this.getWindowDimensions()
    gameWindow.background = await gameObject.loadImage(imgUrl + "setup-background.jpg")
  },
  openSettings: function() {
    gameWindow.container.className = "col game-container fullscreen background"
    gameWindow.container.style.backgroundImage = `url(${gameWindow.background})`
    gameWindow.view.classList.add("background")
    gameWindow.inactive.className = "hidden"
    gameWindow.form.className = "game-form"
    gameWindow.view.className = "game-view fullscreen hidden"
    gameWindow.quit.className = "button game-button quit-button"

    document.addEventListener("keydown", gameWindow.handleKeypress)
  },
  close: function() {
    gameWindow.playSound("quitSound")
    gameWindow.container.classList.add("animate-close")
    
    setTimeout(() => {
      duck.ongoing = false
      gameWindow.container.className = "col game-container"
      gameWindow.container.style.backgroundImage = "none"
      gameWindow.form.className = "game-form hidden"
      gameWindow.view.className = "game-view fullscreen hidden"
      gameWindow.inactive.classList.remove("hidden")
      gameWindow.quit.classList.add("hidden")
      document.body.classList.remove("hide")
      document.removeEventListener("keydown", gameWindow.handleKeypress)
    }, 250)
  },
  handleKeypress: function(e) {
    if (e.key == "Escape") {
      gameWindow.close()
    } else if (e.key == "m") {
      gameWindow.mute = gameWindow.mute ? false : true
    }
  },
  playSound: function(id)  {
    if (this.mute) { return }
    var sound = document.getElementById(id)
    sound.play()
  },
  stopSound: function(id) {
    var sound = document.getElementById(id)
    sound.pause()
  },
  getWindowDimensions: function() {
    this.window = {
      width: parseInt(window.innerWidth),
      height: parseInt(window.innerHeight)
    }
  },
  getPixelValue: function(num=gameObject.size) {
    return this.window.width * (num / 100)
  }
}


gameWindow.container.querySelectorAll('.game-button').forEach(button => {
  button.addEventListener("mousedown", () => {
    gameWindow.playSound("clickSound")
  })
})
gameWindow.quit.addEventListener("click", () => gameWindow.close())
document.getElementById("openGame").addEventListener("click", () => gameWindow.open())
gameWindow.form.querySelector("#showAdvanced").addEventListener("click", (e) => {
  e.preventDefault()
  gameWindow.form.querySelector("#advancedOptions").classList.toggle("hidden")
})

gameWindow.form.addEventListener("submit", (e) => {
  e.preventDefault()
  gameObject.setupGame()
})




let gameObject = {
  sizeFactor: 1,
  setupGame: async function() {
    gameWindow.form.classList.add("hidden")
    gameWindow.view.classList.remove("hidden")
    gameWindow.view.innerHTML = '<div class="game-menu"><h2>Loading...</h2></div>'
    this.duration = parseInt(gameWindow.form.querySelector('input[name="duration"]:checked').value)
    this.difficulty = gameWindow.form.querySelector('input[name="difficulty"]:checked').value
    await this.loadConfig(this.difficulty)

    if (!gameWindow.form.querySelector("#advancedOptions").classList.contains("hidden")) {
      var speed = gameWindow.form.querySelector('input[name="speed"]:checked')
      var movement = gameWindow.form.querySelector('input[name="movement"]:checked')
      var filter = gameWindow.form.querySelector('input[name="filter"]:checked')
      var back = gameWindow.form.querySelector('input[name="background"]:checked')
      var size = gameWindow.form.querySelector('input[name="size"]:checked')
      speed ? this.speed = parseInt(speed.value) : null
      movement ? this.movement = movement.value : null
      filter ? this.filter = filter.value : null
      back ? this.background = back.value : null
      size ? this.size = parseInt(size.value) : null
    }

    if (gameWindow.clickType === "touch" && gameWindow.orient.includes("portrait")) {
      this.sizeFactor = 4
    } else if (gameWindow.clickType === "touch") {
      this.sizeFactor = 2
    }
    await this.loadAllImages()

    gameWindow.view.style.backgroundImage = `url(${this.background})`
    gameWindow.view.classList.add("background")

    this.showStartScreen()
  },
  loadAllImages: async function() {
    this.duck = await this.loadImage(imgUrl + "duck.png")
    this.bomb = await this.loadImage(imgUrl + "bomb.svg")
    this.diamond = await this.loadImage(imgUrl + "diamond.svg")
    // add debuff duck

    if (this.background == 0) {
      this.background = Math.floor(Math.random() * 5 + 1).toString()
    }
    let url = imgUrl + this.backgrounds[this.background].name
    this.background = await this.loadImage(url)
  },
  loadImage: async function(url) {
    let temp = await fetch(url)
    let blob = await temp.blob()
    let img = URL.createObjectURL(blob)
    return img
  },
  showStartScreen: function() {
    gameWindow.view.innerHTML = `<div class="game-header"><span id="hitCounter">0</span><span id="gameMessage">Ready</span><span id="gameTimer">${gameObject.duration}</span></div>`
    
    let cont = document.createElement("div")
    cont.className = "game-menu"
    cont.innerHTML = "<p>The game is ready. What would you like to do?</p>"

    let startBtn = document.createElement("button")
    startBtn.id = "startGame"
    startBtn.className = "button game-button"
    startBtn.innerText = "Start game"
    startBtn.onclick = () => { duck.startGame() }

    let endBtn = document.createElement("button")
    endBtn.id = "endGame"
    endBtn.className = "button game-button"
    endBtn.innerText = "Go back"
    endBtn.onclick = () => { gameWindow.openSettings() }

    cont.appendChild(startBtn)
    cont.appendChild(endBtn)
    //gameWindow.view.append(header)
    gameWindow.view.appendChild(cont)
    gameWindow.view.querySelectorAll('.game-button').forEach(button => {
      button.addEventListener("mousedown", () => {
        gameWindow.playSound("clickSound")
      })
    })
  },
  loadConfig: async function(lvl) {
    let conf = await fetch(`../project-resources/${lvl}.json`)
    conf = await conf.json()
    this.backgrounds = await fetch('../project-resources/backgrounds.json')
    this.backgrounds = await this.backgrounds.json()
    this.backgrounds = this.backgrounds[lvl]

    this.speed = conf.speed
    this.movement = conf.movement
    this.size = conf.size
    this.instructions = conf.instructions
    this.filter = conf.filter
    this.background = 0
    this.bonusTime = parseInt(conf.bonusTime) * 1000
    this.debuffTime = parseInt(conf.debuff) * 1000
  },
  getSizeFactor: function() {
    this.sizeFactor = 1
    if (gameWindow.clickType === "touch" && gameWindow.orient.includes("portrait")) {
      this.sizeFactor = 4
    } else if (gameWindow.clickType === "touch") {
      this.sizeFactor = 2
    }
  }
}




let duck = {
  highscores: [],
  objects: [],
  startGame: function() {
    gameWindow.view.innerHTML = `<div class="game-header"><span id="hitCounter">0</span><span id="gameMessage">Ready</span><span id="gameTimer">${gameObject.duration}</span></div>`
    // get header
    this.hitsDisplay = document.getElementById("hitCounter")
    this.gameTimer = document.getElementById("gameTimer")
    this.messageBox = document.getElementById("gameMessage")
    this.timeLeft = gameObject.duration
    this.createObjects()

    gameWindow.view.appendChild(this.sprite)

    // listen for hits
    this.sprite.addEventListener("click", (e) => { 
      e.preventDefault()
      if (!this.ongoing) {
        return
      }
      this.hit(e)
      var randomNum = Math.floor(Math.random() * 3 + 1)
      if (randomNum === 1) {
        this.plantBonus()
      }
    })

    gameWindow.container.addEventListener("click", (e) => {
      if (this.ongoing && e.target.tagName !== "IMG" && e.target.tagName !== "BUTTON") {
        // wrong click has possibility to create bomb
        var randomNum = Math.floor(Math.random() * 3 + 1)
        if (randomNum === 1) {
          duck.plantBomb(e)
        }
      }
    })
    
    window.onresize = () => { 
      gameWindow.getWindowDimensions()
      var size = gameWindow.getPixelValue(duck.size)
      this.duckMax = this.getMax(size, size)
      this.diamondMax = this.getMax(size/2, size/2)
    }
    this.ongoing = true // set variable to validate hit points
    this.score = 0 // set start score

    this.timer = setInterval(() => {
      this.timeLeft--
      this.gameTimer.innerText = this.timeLeft
      if (this.timeLeft < 1 || !this.ongoing) {
        this.endGame()
      }
    }, 1000)
    
    this.move()
  },
  createObjects: function() {
    this.size = gameObject.size * gameObject.sizeFactor
    // create duck
    this.sprite = document.createElement("img")
    this.sprite.src = gameObject.duck
    this.sprite.alt = "Duck"
    this.sprite.id = "duck"
    this.sprite.classList.add("game-sprite")
    if (gameObject.movement == "smooth") {
      this.sprite.classList.add("smooth")
    } else if (gameObject.movement == "nonstop") {
      this.sprite.classList.add("nonstop")
    }
    // size
    this.sprite.style.width = this.size + "vw"
    this.sprite.style.height = this.size + "vw"
    this.sprite.style.filter = gameObject.filter

    var pix = gameWindow.getPixelValue(this.size)
    this.duckMax = this.getMax(pix, pix)

    // bomb
    this.bomb = document.createElement("img")
    this.bomb.src = gameObject.bomb
    this.bomb.alt = "Bomb"
    this.bomb.style.width = this.size + "vw"
    this.bomb.style.height = this.size + "vw"
    this.bomb.classList.add("bomb")

    // diamond
    this.diamond = document.createElement("img")
    this.diamond.src = gameObject.diamond
    this.diamond.alt = "Diamond"
    this.diamond.classList.add("diamond")
    this.diamond.style.width = this.size / 2 + "vw"
    this.diamond.style.height = this.size / 2 + "vw"
    this.diamondMax = this.getMax(pix / 2, pix / 2)
  },
  getMax: function(width, height) {
    return {
      left: gameWindow.window.width - width,
      top: gameWindow.window.height - height
    }
  },
  randomPosition: function(object=this.sprite, max=this.duckMax) {
    let left = Math.floor(Math.random() * (max.left + 1))
    let top = Math.floor(Math.random() * (max.top + 1))
    object.style.left = left + "px"
    object.style.top = top + "px"
  },
  move: function() {
    if (gameObject.movement == "nonstop") {
      // nonstop
      clearInterval(this.interval)
      var deg = Math.floor(Math.random() * 360)
      let x = Math.cos(deg) * 10
      let y = Math.sin(deg) * 10
      this.interval = setInterval(() => {
        let ele = window.getComputedStyle(this.sprite)
        let left = parseInt(ele.getPropertyValue('left'))
        let top = parseInt(ele.getPropertyValue('top'))
        let newX = left + x*(4-gameObject.speed)
        let newY = top + y*(4-gameObject.speed)
        if (0 <= newX && newX <= this.duckMax.left && 0 <= newY && newY <= this.duckMax.top) {
          this.sprite.style.left = newX + "px"
          this.sprite.style.top = newY + "px"
        } else {
          this.move()
        }
      }, 100)
    } else {
      clearTimeout(this.timeout)
      this.randomPosition()

      // settimeout
      this.timeout = setTimeout(() => { this.move() }, gameObject.speed * 1000)
    }
  },
  hit: function(e) {
    var anim = gameWindow.clickType === "mouse" ? "animate-hit" : "animate-plop"
    this.sprite.classList.add(anim)
    clearInterval(this.interval)
    clearTimeout(this.timeout)
    gameWindow.playSound("hitSound")
    var delay = gameWindow.clickType === "mouse" ? 500 : 150
    setTimeout(() => {
      if (!this.ongoing) {
        return
      }
      this.sprite.classList.remove(anim)
      this.move()
    }, delay)
    let score = this.calculatePoints(e)
    this.messageBox.innerHTML = "+" + score
    this.score += score
    this.hitsDisplay.innerText = this.score
  },
  calculatePoints: function(e) {
    // base points after click
    let score = 1
    var size = gameWindow.getPixelValue(this.size)
    let offset = Math.abs((size / 2) - e.layerX) + Math.abs((size / 2) - e.layerY)
    if (offset < size / 5) {
      // dead center
      score = 3
    } else if (offset < size / 3) {
      // center
      score = 2
    }
    return score
  },
  endGame: function() {
    clearTimeout(this.timeout)
    clearInterval(this.timer)
    clearInterval(this.interval)
    
    if (!this.ongoing) { return }

    this.ongoing = false
    this.scoreboard()

    // menu
    let cont = document.createElement("div")
    cont.className = "game-menu sideline"
    cont.innerHTML = `<h1>Game Over</h1><p>You scored ${this.score} points.</p>`

    // replay button
    let startBtn = document.createElement("button")
    startBtn.id = "startGame"
    startBtn.className = "button game-button"
    startBtn.innerText = "Replay"
    startBtn.onclick = () => { this.startGame() }

    // quit button
    let endBtn = document.createElement("button")
    endBtn.id = "endGame"
    endBtn.className = "button game-button"
    endBtn.innerText = "Go back"
    endBtn.onclick = () => { gameWindow.openSettings() }

    cont.appendChild(startBtn)
    cont.appendChild(endBtn)
    gameWindow.view.appendChild(cont)
  },
  scoreboard: function() {
    let newScore = {
      score: this.score,
      difficulty: gameObject.difficulty,
      time: new Date()
    }
    this.highscores.push(newScore)

    let highestScore = this.highscores.reduce((highest, obj) => {return obj.score > highest.score ? obj : highest})

    // highscore list
    let scoreList = document.createElement("table")
    scoreList.className = "highscore-list"
    let listContent = "<tr><th>Time</th><th>Level</th><th>Score</th></tr>"
    this.highscores.forEach((highscore) => {
      var rowClass = ""
      if (highscore.time == highestScore.time) {
        rowClass = ` class="highscore"`
      }
      listContent += `<tr${rowClass}>
      <td>${highscore.time.toLocaleTimeString()}</td>
      <td>${highscore.difficulty}</td>
      <td>${highscore.score}</td></tr>`
    })
    scoreList.innerHTML = listContent

    // new high score
    if (newScore.time == highestScore.time) {
      gameWindow.playSound("achievementSound")
    }

    gameWindow.view.appendChild(scoreList)
  },
  plantBomb: function(e) {
    this.messageBox.innerHTML = "Watch out.."
    var bomb = this.bomb.cloneNode(true)
    bomb.style.left = e.clientX + "px"
    bomb.style.top = e.clientY + "px"
    gameWindow.view.appendChild(bomb)

    bomb.addEventListener("click", (e) => { 
      e.preventDefault()
      this.explode(e)
    })

    var obj = {
      node: bomb,
      timeout: setTimeout(() => {
        gameWindow.view.removeChild(bomb)
        var i = duck.objects.findIndex(ele => ele.node == bomb)
        duck.objects.splice(i, 1)
      }, gameObject.debuffTime)
    }
    this.objects.push(obj)

  },
  explode: function(e) {
    console.log("boom")
    var bomb = this.objects.find(obj => obj.node === e.target)
    clearTimeout(bomb.timeout)
    e.target.classList.add("explode")
    this.messageBox.innerHTML = "Oh no.."
    this.score -= 1
    this.hitsDisplay.innerText = this.score
    this.move()
    setTimeout(() => {
      for (let i = 0; i < duck.objects.length; i++) {
        clearTimeout(duck.objects[i].timeout)
        gameWindow.view.removeChild(duck.objects[i].node)
      }
      this.objects = []
    }, 200)
    gameWindow.playSound("explosionSound")
  },
  plantBonus: function() {
    this.messageBox.innerHTML = "Wow, so shiny.."
    let bonus = this.diamond.cloneNode(true)
    this.randomPosition(bonus, this.diamondMax)
    gameWindow.view.appendChild(bonus)

    bonus.addEventListener("click", (e) => { 
      e.preventDefault()
      this.reward(e)
    })

    var obj = {
      node: bonus,
      timeout: setTimeout(() => {
        gameWindow.view.removeChild(bonus)
        var i = duck.objects.findIndex(ele => ele.node == bonus)
        duck.objects.splice(i, 1)
      }, gameObject.bonusTime)
    }
    this.objects.push(obj)
  },
  reward: function(e) {
    if (!this.ongoing) {
      return
    }
    console.log("ka-ching")
    var bonus = this.objects.find(obj => obj.node === e.target)
    clearTimeout(bonus.timeout)
    e.target.classList.add("animate-plop")
    this.messageBox.innerHTML = "Nice!"
    this.score += 5
    this.hitsDisplay.innerText = this.score
    gameWindow.playSound("hitSound")
    setTimeout(() => {
      gameWindow.view.removeChild(bonus.node)
      var i = duck.objects.indexOf(bonus)
      duck.objects.splice(i, 1)
    }, 150)
  },
  nuke: function() {
    // chose not to use
    this.messageBox.innerHTML = "Incoming..."
    var bomb = this.bomb.cloneNode(true)
    let rnd = Math.floor(Math.random() * 90)
    bomb.style.left = rnd + "%"
    gameWindow.view.appendChild(bomb)

    bomb.addEventListener("click", (e) => { 
      e.preventDefault()
      this.explode(e)
    })
    
    bomb.classList.add("animate-fall")

    setTimeout(() => {
      duck.bomb.classList.remove("animate-fall")
      gameWindow.view.removeChild(bomb)
    }, 4000)
  }
}
