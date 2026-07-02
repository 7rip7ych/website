/**
 * @module webreader
 */

const fs = require('fs/promises')

const webReader = {
    fetchAsJson: async function fetchURLAsJSON (url) {
        let response = await fetch(url)
        response = await response.json()
        return response
    },

    fetchAsText: async function fetchUrl(url) {
        let response = await fetch(url, {
            headers: {
                "Access-Control-Allow-Origin": "https://www.caddee.se/klubb/"
            },
            method: "GET"
        })
        return await response.text()
    },

    getContentByHtmlId: function getContentByHtmlId(id, htmlContent) {
        // console.log(htmlContent.length)
        let re = new RegExp(String.raw`<[^>]*id="${id}"[^>]*>(?<content>[^<]*)<\/[^>]*>`, "gm")
        let match = re.exec(htmlContent)
        try {
            let content = match.groups.content
            // console.log(content)
            return content
        } catch (e) {
            console.log(e)
            return "{}"
        }

    }
}


let blockingInterval
const clubs = {
    list: [],
    data: {},
    cluburl: "https://www.caddee.se/anslutna-klubbar",
    baseurl: "https://www.caddee.se/klubb/",
    getClubs: async function() {
        const page = await webReader.fetchAsText(this.cluburl)
        const re = new RegExp(String.raw`<a [^>]*class="ClubItem__GoToLink-sc-655ca86b-6 dnaAPa"[^>]*href="\/klubb\/(?<id>[^"]*)"[^>]*>(?<name>[^<]*)<\/a>`, 'gm')
        let matches = [...page.matchAll(re)]
        let clublist = []
        matches.forEach((match)=> {
            clublist.push({
                id: match.groups.id,
                name: match.groups.name
            })
        })
        console.log("Antal klubbar:", clublist.length)
        await fs.writeFile('../../assets/golfbanor.json', JSON.stringify(clublist, null, 2))
    },
    getClubData: async function(club) {
        const page = await webReader.fetchAsText(this.baseurl + club)
        let data = await webReader.getContentByHtmlId("__NEXT_DATA__", page)
        data = await JSON.parse(await data)
        return await data || {}
    },
    saveToFile: async function() {
        await fs.writeFile('../../assets/caddee-data.json', JSON.stringify(clubs.data, null, 2))
        clearInterval(blockingInterval)
    }
}

async function main() {
    const courses = await fs.readFile('../../assets/golfbanor.json', 'utf8')
    
    clubs.list = await JSON.parse(courses).map(x => x.id)
    console.log(courses, clubs.list)
    let data = {}
    let prom = new Promise((resolve, reject) => {
        clubs.list.forEach(async(club, index) => {
            data[club] = await clubs.getClubData(club)
            // console.log(73, data[club])
            if (index == clubs.list.length -1) {
                if (Object.keys(data).length < clubs.list.length) {
                    let lastCount = Object.keys(data).length
                    let iterations = 0
                    while (Object.keys(data).length < clubs.list.length) {
                        if (iterations > 5) {break}
                        clubs.list.forEach(async(club) => {
                            if (!data[club]) {
                                data[club] = await clubs.getClubData(club)
                            }
                        })
                        lastCount = Object.keys(data).length
                        iterations++
                    }
                    console.log(iterations, lastCount)
                }
                resolve()
            } 
        })
    })
    prom.then(()=> {
        clubs.data = data
        blockingInterval = setInterval(()=> undefined, 100)
        clubs.saveToFile()
    })
}

// clubs.getClubs()
main()

exports = {webReader}