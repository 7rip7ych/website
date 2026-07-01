/**
 * @module webreader
 */

let fs = require('fs')
const { getFile } = require("./files.js")

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
        let re = new RegExp(String.raw`<[^>]*id="${id}"[^>]*>(?<content>[^<]*)</[^>]*>`, "gm")
        let match = re.exec(htmlContent)
        // console.log(match)
        let content = match.groups.content
        // console.log(content)
        return content
    }
}



const clubs = {
    list: [],
    data: {},
    baseurl: "https://www.caddee.se/klubb/",
    getClubData: async function(club) {
        const page = await webReader.fetchAsText(this.baseurl + club)
        console.log(page)
        let data = webReader.getContentByHtmlId("__NEXT_DATA__", await page)
        data = JSON.parse(data)
        console.log(JSON.stringify(data))
        return data
    },
    saveToFile: function() {
        fs.writeFile('caddee-data.json', JSON.stringify(clubs.data), 'utf8', (err, data) => {
            if (err) throw err
            console.log(data)
        })
    }
};

(async function() {
    
    const courses = await fs.readFileSync('./golfbanor.json', 'utf8')// getFile("/home/u7rip7ych/website7/src/modules/golfbanor.json")
    console.log(courses)
    clubs.list = await JSON.parse(courses).map(x => x.id)
    clubs.list.forEach(async(club) => {
        clubs.data[club] = await clubs.getClubData(club)
    })
    clubs.saveToFile()
})()

// export { webReader }