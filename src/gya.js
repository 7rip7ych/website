//var declarations
const player = document.getElementById("player")
const b2start = document.getElementById("back2start")
const s2end = document.getElementById("skip2end")
const rewind = document.getElementById("rewind")
const forward = document.getElementById("forward")
let slider = document.getElementById("myRange")
const outputThis = document.getElementById("currentTimeDemo")
const slideCont = document.getElementById("slidecontainer")
const percBtn = document.getElementById("percBtn")
let ttSwitch = document.getElementById("ttForm")
let heatSwitch = document.getElementById("slideForm")
let dataTable = document.getElementById("dataTable")
let tblMach = document.getElementById("selMachDrop")
const myForm = document.getElementById("inData")
let allMachs
let dataArray = []
let formatted
let formatted2
let timePeriod
let jsonArr = []
let machArray = []
const nodeList = document.querySelectorAll('.machineBox')
nodeList.forEach(item => {
    let firstWord = item.className.split(' ')
    let maMach = firstWord[0]
    if (maMach != "machineBox") {
        let svMach = "SV" + maMach
        machArray.push(svMach)
    }
})
let startDate
let endDate
//overview vars
let wcount = 0
let wtime = 0
let wshort = 0
let wlong = 0
let icount = 0
let itime = 0
let ishort = 0
let ilong = 0
let scount = 0
let stime = 0
let sshort = 0
let slong = 0
let fcount = 0
let ftime = 0
let fshort = 0
let flong = 0
let w2s = 0
let wper = 0
let iper = 0
let sper = 0
let fper = 0
let cwper = 0
let ciper = 0
let csper = 0
let cfper = 0
let oact = 0
let arrza = []

//call function declarations
/**
 * Calculate durations or differences.
 * @param {*} startThee 
 * @param {*} endThee 
 * @returns {Array} An array of objects with startTime, endTime and sum.
 */
const getThineTime = (startThee, endThee) => {
    const res = []
    var res1 = []
    for (let i = 0; i < startThee.length; i++) {
        const el = Math.abs((startThee[i] || 0) - (endThee[i] || 0))
        res[i] = el / 1000
        res1[i] = {
            "startTime": startThee[i],
            "endTime": endThee[i],
            "sum": res[i]
        }
    };
    return res1
}

/**
 * Calculates the sum of the sum properties.
 * @param {Array} theChosen 
 * @returns {Number} The total sum.
 */
const totSum = theChosen => {
    let smums = theChosen.map(x => x.sum)
    let summer = smums.reduce((a, b) => a + b, 0)
    return summer
}

/**
 * Format time duration to hh mm ss format.
 * @param {Number} outTime 
 * @returns {String} Formatted time.
 */
const hourMinSecs = outTime => {
    let workHour = Math.floor(Math.floor(outTime / 60) / 60)
    let workMin = Math.floor(outTime / 60) - workHour * 60
    let workSec = Math.round(outTime - Math.floor(outTime / 60) * 60)
    return workHour + "h " + workMin + "min " + workSec + "s "
}

/**
 * Get rows with duration < 300.
 * @param {Array} table The Array to filter.
 * @returns {Array} The filtered Array.
 */
const shortTime = table => {
    let shawty = table.filter(x => x.sum < 300).length
    return shawty
}

/**
 * Get rows with duration > 300.
 * @param {Array} table The Array to filter.
 * @returns {Array} The filtered Array.
 */
const longTime = table => {
    let shawty = table.filter(x => x.sum >= 300).length
    return shawty
}

/**
 * Read the inputted files.
 */
function getFiles() {
    //read file
    const files = document.getElementById("fileIn").files
    for (var i = 0; i < files.length; i++) {
        var file = files[i]
        var reader = new FileReader()
        reader.onload = function(e) {
            const textString = e.target.result
            var arr = textString.split('\n')
            var headers = arr[0].split(',')
            for (var j = 1; j < arr.length; j++) {
                var data = arr[j].split(',')
                var obj = {}
                for (var k = 0; k < data.length; k++) {
                    obj[headers[k].trim()] = data[k].trim()
                }
                jsonArr[j - 1] = obj
            }
        }
        reader.readAsText(file)
    }
    //convert dates
    formatted = jsonArr.map(function(item) {
        var formattedItem = {}
        Object.keys(item).forEach(function(key) {
            if (key === "startTime") {
                formattedItem[key] = new Date(item[key])
            } else if (key === "endTime") {
                formattedItem[key] = new Date(item[key])
            } else {
                formattedItem[key] = item[key]
            }
        })
        return formattedItem
    })
    //get machines
    const listt = jsonArr.map(x => x.equipment)
    allMachs = [...new Set(listt)]
    allMachs.pop()
    if (tblMach.options.length < 4) {
        for (var j = 0; j < allMachs.length; j++) {
            var option = allMachs[j]
            tblMach.options.add(new Option(option))
        }
    };
    console.log(formatted)
}

/**
 * Filter data by timeframe.
 * Results stored in formatted2.
 * @returns 
 */
function getTime() {
    const timeStartIn = document.getElementById('timeStartIn').value
    const timeStopIn = document.getElementById('timeStopIn').value
    // let startDate
    // let endDate
    let timeframe
    if (!timeStartIn | !timeStopIn) {
        timeframe = getTimeframe(formatted)
        console.log(timeframe)
    }
    if (timeStartIn) {
        startDate = new Date(timeStartIn)
    } else {
        startDate = timeframe[0]
    }
    if (timeStopIn) {
        endDate = new Date(timeStopIn)
    } else {
        endDate = timeframe[1]
    };
    timePeriod = (endDate - startDate) / 1000
    
    if (!timeStartIn & !timeStopIn) {
        formatted2 = formatted
        return
    }
    //limit to time period w/o overflow
    formatted2 = formatted.filter(x => x.startTime <= endDate && x.endTime >= startDate).map(function(item) {
        var formattedItem2 = {}
        Object.keys(item).forEach(function(key) {
            var val
            if (key === "startTime") {
                val = item[key]
                if (val < startDate) {
                    formattedItem2[key] = startDate
                } else {
                    formattedItem2[key] = item[key]
                }
            } else if (key === "endTime") {
                val = item[key]
                if (val > endDate) {
                    formattedItem2[key] = endDate
                } else {
                    formattedItem2[key] = item[key]
                }
            } else {
                formattedItem2[key] = item[key]
            }
        })
        return formattedItem2
    })
}

/**
 * Get the min startDate and max endDate of the data.
 * @param {*} data 
 * @returns {Array} The timeframe start and end.
 */
function getTimeframe(data) {
    // Get min and max dates by sorting starttimes and endtimes.
    const starts = data.map(x => x.startTime)
    const ends = data.map(x => x.endTime)
    let sorted_starts = starts.sort((a, b) => a - b) // sort asc
    let sorted_ends = ends.sort((a, b) => b - a) // sort desc
    let start = sorted_starts[0]
    let end = sorted_ends[0]
    return [start, end]
}

/**
 * Calculate the percentages.
 */
function proCalc() {
    dataArray = []
    wcount = 0
    wtime = 0
    wshort = 0
    wlong = 0
    icount = 0
    itime = 0
    ishort = 0
    ilong = 0
    scount = 0
    stime = 0
    sshort = 0
    slong = 0
    fcount = 0
    ftime = 0
    fshort = 0
    flong = 0
    w2s = 0
    wper = 0
    iper = 0
    sper = 0
    fper = 0
    cwper = 0
    ciper = 0
    csper = 0
    cfper = 0
    oact = 0
    allMachs.forEach(mach => {
        let formatted3 = formatted2.filter(x => x.equipment == mach)
        let workStartThee = formatted3.filter(x => x.reasonCode === "Working").map(x => x.startTime)
        let workEndThee = formatted3.filter(x => x.reasonCode === "Working").map(x => x.endTime)
        let idleStartThee = formatted3.filter(x => x.reasonCode === "Idle").map(x => x.startTime)
        let idleEndThee = formatted3.filter(x => x.reasonCode === "Idle").map(x => x.endTime)
        let stopStartThee = formatted3.filter(x => x.reasonCode === "Stopped").map(x => x.startTime)
        let stopEndThee = formatted3.filter(x => x.reasonCode === "Stopped").map(x => x.endTime)
        let warnStartThee = formatted3.filter(x => x.reasonCode === "Warning").map(x => x.startTime)
        let warnEndThee = formatted3.filter(x => x.reasonCode === "Warning").map(x => x.endTime)
        //make table of times and sums
        let working_table = getThineTime(workStartThee, workEndThee)
        let idle_table = getThineTime(idleStartThee, idleEndThee)
        let stopped_table = getThineTime(stopStartThee, stopEndThee)
        let warning_table = getThineTime(warnStartThee, warnEndThee)
        let outWork = totSum(working_table)
        let outIdle = totSum(idle_table)
        let outStop = totSum(stopped_table)
        let outWarn = totSum(warning_table)
        let outAct = outWork + outIdle + outStop
        let ttDivider = (ttSwitch.checked) ? timePeriod : outAct
        let getPerc = out => {
            let a = Math.round(out * 10000 / ttDivider) / 100
            return a
        }
        let workCount = working_table.length
        let idleCount = idle_table.length
        let stopCount = stopped_table.length
        let warnCount = warning_table.length
        //warn->stop
        let kay = formatted3.map(x => x.reasonCode)
        const me = kay.reduce((a, e, i) => {
            if (e === "Warning") a.push(i)
            return a
        }, [])
        let formatme = []
        me.forEach(function(index) {
            formatme[index] = kay[index + 1]
        })
        let bishop = Object.values(formatme).filter(x => x === "Stopped")
        //variables
        let tt = getPerc(outWork) + getPerc(outIdle)
        wcount += workCount
        wtime += outWork
        wshort += shortTime(working_table)
        wlong += longTime(working_table)
        wper += getPerc(outWork)
        icount += idleCount
        itime += outIdle
        ishort += shortTime(idle_table)
        ilong += longTime(idle_table)
        iper += getPerc(outIdle)
        scount += stopCount
        stime += outStop
        sshort += shortTime(stopped_table)
        slong += longTime(stopped_table)
        sper += getPerc(outStop)
        fcount += warnCount
        ftime += outWarn
        fshort += shortTime(warning_table)
        flong += longTime(warning_table)
        fper += getPerc(outWarn)
        w2s += bishop.length
        oact += outAct
        let countArr = []
        let timeArr = []
        let percArr = []
        let avgArr = []
        let shortArr = []
        let longArr = []
        countArr = [workCount, idleCount, stopCount, warnCount]
        timeArr = [outWork, outIdle, outStop, outWarn]
        percArr = [getPerc(outWork), getPerc(outIdle), getPerc(outStop), getPerc(outWarn)]
        avgArr = [(Math.round(outWork / workCount)), (Math.round(outIdle / idleCount)), (Math.round(outStop / stopCount)), (Math.round(outWarn / warnCount))]
        shortArr = [shortTime(working_table), shortTime(idle_table), shortTime(stopped_table), shortTime(warning_table)]
        longArr = [longTime(working_table), longTime(idle_table), longTime(stopped_table), longTime(warning_table)]
        arrza = {
            "Machine": mach,
            "Count": countArr,
            "Time": timeArr,
            "Percent": percArr,
            "Average_time": avgArr,
            "Short_time": shortArr,
            "Long_time": longArr,
            "Warn2stop": bishop.length,
            "TT": tt
        }
        dataArray.push(arrza)
    })
    //calc perc overview
    if (ttSwitch.checked) {
        const oPer = xper => {
            let a = Math.round(xper * 10000 / oact) / 100
            return a
        }
        cwper = oPer(wtime)
        ciper = oPer(itime)
        csper = oPer(stime)
        cfper = oPer(ftime)
    } else {
        const sPer = xper => {
            let a = Math.round(xper * 100 / allMachs.length) / 100
            return a
        }
        cwper = sPer(wper)
        ciper = sPer(iper)
        csper = sPer(sper)
        cfper = sPer(fper)
    }
}

/**
 * Draw the heatmap.
 */
function displayHM() {
    document.body.style.cursor = "wait"
    let playerInterval
    let formatted4
    if (heatSwitch.checked) {
        slideCont.style.display = "block"
        percBtn.style.display = "none"
        // const secTime=timePeriod/1000
        slider.setAttribute("max", Math.round(timePeriod))

        function realUpd() {
            nodeList.forEach(item => {
                let firstWord = item.className.split(' ')
                let maMach = firstWord[0]
                let svMach = "SV" + maMach
                //real time vis
                if (allMachs.includes(svMach)) {
                    item.addEventListener("click", function() {
                        tblMach.value = svMach
                        disTbl()
                    })
                    let currentCode = formatted4.filter(x => x.equipment === svMach)
                    let codeLength = currentCode.length
                    if (codeLength === 0) {
                        item.style.background = "#A4A4A4"
                    } else if (codeLength === 1) {
                        let relEl = currentCode[0].reasonCode
                        if (relEl === "Working") {
                            item.style.background = "white"
                        } else if (relEl === "Idle") {
                            item.style.background = "#46d446"
                        } else if (relEl === "Stopped") {
                            item.style.background = "#ba2323"
                        } else {
                            item.style.background = "#ff9029"
                        }
                    } else if (codeLength === 2) {
                        item.style.background = "#ff9029"
                    }
                } else {
                    item.style.background = "repeating-linear-gradient(45deg,#DEDEDE,#DEDEDE 3px,#BEBEBE 3px,#BEBEBE 6px)"
                }
            })
        }
        // update slider
        const update = value => {
            let t = new Date(startDate)
            let newSeconds = t.getSeconds() + parseInt(value)
            // console.log("update", t, value, newSeconds)

            if (newSeconds <= timePeriod) {
                t.setSeconds(newSeconds)
            } else {
                slider.value = timePeriod
                if (playerInterval){
                    clearInterval(playerInterval)
                }
                return
            }

            outputThis.innerHTML = t.toLocaleString()
            formatted4 = formatted.filter(x => x.startTime <= t && x.endTime >= t)
            realUpd()
        }
        update(slider.value)
        slider.addEventListener("input", function() {
            // console.log(slider.value)
            update(slider.value)
        })
        //buttons
        var clickCounter = 0
        player.addEventListener("click", function() {
            var element = document.getElementById("play-btn")
            clickCounter++
            if (clickCounter % 2 === 1) {
                element.classList.add('fa-pause')
                element.classList.remove('fa-play')
                player.classList.add('pause-btn')
            } else {
                element.classList.remove('fa-pause')
                element.classList.add('fa-play')
                player.classList.remove('pause-btn')
            }

            function playInterval() {
                if (clickCounter % 2 === 1) {
                    forward.click()
                }
            }
            playerInterval = setInterval(playInterval, 100)
        })
        let speedSel = 0
        b2start.addEventListener("click", function() {
            slider.value = 0
            update(slider.value)
        })
        rewind.addEventListener("click", function() {
            speedSel = parseInt(document.getElementById("speed").value)
            slider.stepDown(speedSel)
            update(slider.value)
        })
        forward.addEventListener("click", function() {
            speedSel = parseInt(document.getElementById("speed").value)
            slider.stepUp(speedSel)
            update(slider.value)
        })
        s2end.addEventListener("click", function() {
            slider.value = timePeriod// / 1000
            update(slider.value)
        })
    } else {
        //overview
        //get perclimits
        const color1 = document.getElementById("color1").value
        const color2b = document.getElementById("color2b").value
        const color2t = document.getElementById("color2t").value
        const color3b = document.getElementById("color3b").value
        const color3t = document.getElementById("color3t").value
        const color4b = document.getElementById("color4b").value
        const color4t = document.getElementById("color4t").value
        const color5 = document.getElementById("color5").value

        slideCont.style.display = "none"
        percBtn.style.display = "block"
        nodeList.forEach(item => {
            let firstWord = item.className.split(' ')
            let maMach = firstWord[0]
            let svMach = "SV" + maMach
            if (allMachs.includes(svMach)) {
                item.addEventListener("click", function() {
                    tblMach.value = svMach
                    disTbl()
                })
                let machObj = dataArray.filter(x => x.Machine == svMach)
                let TT = machObj[0].TT
                //display heatmap
                if (TT === 0) {
                    item.style.background = "#A4A4A4"
                } else if (TT >= color1) {
                    item.style.background = "green"
                } else if (TT >= color2b && TT < color2t) {
                    item.style.background = "lime"
                } else if (TT >= color3b && TT < color3t) {
                    item.style.background = "yellow"
                } else if (TT >= color4b && TT < color4t) {
                    item.style.background = "orange"
                } else if (TT <= color5) {
                    item.style.background = "red"
                };
            } else {
                item.style.background = "repeating-linear-gradient(45deg,#DEDEDE,#DEDEDE 3px,#BEBEBE 3px,#BEBEBE 6px)"
            }
        })
    }
    document.body.style.cursor = "default"
}

/**
 * Generate table.
 */
function disTbl() {
    if (allMachs.includes(tblMach.value)) {
        let count
        let time
        let per
        let avg
        let short
        let long
        let bis
        let machArr = dataArray.filter(x => x.Machine === tblMach.value)
        count = machArr[0].Count
        time = machArr[0].Time
        per = machArr[0].Percent
        avg = machArr[0].Average_time
        short = machArr[0].Short_time
        long = machArr[0].Long_time
        bis = machArr[0].Warn2stop
        //display in table 
        dataTable.rows[1].cells[1].innerHTML = count[0]
        dataTable.rows[2].cells[1].innerHTML = count[1]
        dataTable.rows[3].cells[1].innerHTML = count[2]
        dataTable.rows[4].cells[1].innerHTML = count[3]
        dataTable.rows[1].cells[2].innerHTML = hourMinSecs(time[0])
        dataTable.rows[2].cells[2].innerHTML = hourMinSecs(time[1])
        dataTable.rows[3].cells[2].innerHTML = hourMinSecs(time[2])
        dataTable.rows[4].cells[2].innerHTML = hourMinSecs(time[3])
        dataTable.rows[1].cells[3].innerHTML = per[0]
        dataTable.rows[2].cells[3].innerHTML = per[1]
        dataTable.rows[3].cells[3].innerHTML = per[2]
        dataTable.rows[4].cells[3].innerHTML = per[3]
        if (avg[0]) {
            dataTable.rows[1].cells[4].innerHTML = hourMinSecs(avg[0])
        };
        if (avg[1]) {
            dataTable.rows[2].cells[4].innerHTML = hourMinSecs(avg[1])
        };
        if (avg[2]) {
            dataTable.rows[3].cells[4].innerHTML = hourMinSecs(avg[2])
        };
        if (avg[3]) {
            dataTable.rows[4].cells[4].innerHTML = hourMinSecs(avg[3])
        };
        dataTable.rows[3].cells[7].innerHTML = bis
        dataTable.rows[1].cells[5].innerHTML = short[0]
        dataTable.rows[2].cells[5].innerHTML = short[1]
        dataTable.rows[3].cells[5].innerHTML = short[2]
        dataTable.rows[4].cells[5].innerHTML = short[3]
        dataTable.rows[1].cells[6].innerHTML = long[0]
        dataTable.rows[2].cells[6].innerHTML = long[1]
        dataTable.rows[3].cells[6].innerHTML = long[2]
        dataTable.rows[4].cells[6].innerHTML = long[3]
    } else if (tblMach.value == "overview") {
        //display in table 
        dataTable.rows[1].cells[1].innerHTML = wcount
        dataTable.rows[2].cells[1].innerHTML = icount
        dataTable.rows[3].cells[1].innerHTML = scount
        dataTable.rows[4].cells[1].innerHTML = fcount
        dataTable.rows[1].cells[2].innerHTML = hourMinSecs(wtime)
        dataTable.rows[2].cells[2].innerHTML = hourMinSecs(itime)
        dataTable.rows[3].cells[2].innerHTML = hourMinSecs(stime)
        dataTable.rows[4].cells[2].innerHTML = hourMinSecs(ftime)
        dataTable.rows[1].cells[3].innerHTML = cwper
        dataTable.rows[2].cells[3].innerHTML = ciper
        dataTable.rows[3].cells[3].innerHTML = csper
        dataTable.rows[4].cells[3].innerHTML = cfper
        if (wtime / wcount) {
            dataTable.rows[1].cells[4].innerHTML = hourMinSecs(Math.round(wtime / wcount))
        };
        if (itime / icount) {
            dataTable.rows[2].cells[4].innerHTML = hourMinSecs(Math.round(itime / icount))
        };
        if (stime / scount) {
            dataTable.rows[3].cells[4].innerHTML = hourMinSecs(Math.round(stime / scount))
        };
        if (ftime / fcount) {
            dataTable.rows[4].cells[4].innerHTML = hourMinSecs(Math.round(ftime / fcount))
        };
        dataTable.rows[3].cells[7].innerHTML = w2s
        dataTable.rows[1].cells[5].innerHTML = wshort
        dataTable.rows[2].cells[5].innerHTML = ishort
        dataTable.rows[3].cells[5].innerHTML = sshort
        dataTable.rows[4].cells[5].innerHTML = fshort
        dataTable.rows[1].cells[6].innerHTML = wlong
        dataTable.rows[2].cells[6].innerHTML = ilong
        dataTable.rows[3].cells[6].innerHTML = slong
        dataTable.rows[4].cells[6].innerHTML = flong
    }
}

document.getElementById("fileIn").addEventListener("input", getFiles)
myForm.addEventListener("submit", function(e) {
    e.preventDefault()
    getFiles()
    getTime()
    console.log(timePeriod)
    proCalc()
    displayHM()
    disTbl()
    ttSwitch.addEventListener("click", function() {
        proCalc()
        disTbl()
        if (!heatSwitch.checked) {
            displayHM()
        }
    })
    heatSwitch.addEventListener("click", displayHM)
})
tblMach.addEventListener("change", disTbl)