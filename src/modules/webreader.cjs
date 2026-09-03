/**
 * @module webreader
 */

const fs = require('fs/promises')
const { getFile } = require('./files.js')
const allClubs = ["1 A6 Golfklubb","2 Abbekås Golfklubb","3 AIK Golfklubb","4 Albatross Golfklubb","5 Ale Golfklubb","6 Alfta-Edsbyns Golfklubb","7 Alingsås Golfklubb","8 Allerum Golf","9 Allerum Golfklubb","10 Allmag Golf & Country Club","11 Alvesta Golfklubb","12 Araslöv Golf & Resort","13 Arboga Golfklubb","14 Arlandastad Golfklubb","15 Arninge Golfklubb","16 Arvidsjaurs Golfklubb","17 Arvika Golfklubb","18 Askersunds Golfklubb","19 Avesta Golfklubb","20 Backa Säteri IF","21 Barsebäck Golf & Resort","22 Bedinge Golfklubb","23 Billeruds Golfklubb","24 Billingens Golfklubb","25 Binga Golf","26 Bjurholms Golfklubb","27 Bjäre Golfklubb","28 Björkenäs Golf","29 Björkhagens Golfklubb","30 Björklidens Golfklubb","31 Björnhults Golfklubb","32 Blixtorps Golf","33 Boa Golfklubb Olofström","34 Bodens Golfklubb","35 Bokskogens Golfklubb","36 Bolidens Golfklubb","37 Bollnäs Golfklubb","38 Borås Golfklubb","39 Bosjökloster Golfklubb","40 Botkyrka Golfklubb","41 Brastad Golfklubb","42 Bredareds Golfklubb","43 Brevikens Golfklubb","44 Bro Hof Golf förening","45 Bro Hof Slott Golf Club","46 Bro-Bålsta Golfklubb","47 Bryngfjordens Golfklubb","48 Bryttsätter Golfklubb","49 Bråvikens Golfklubb","50 Burviks Golfklubb","51 Byxelkroks Golfklubb","52 Båstad Golfklubb","53 Böda Sands Golfklubb","54 Carlskrona Golfklubb","55 Chalmers Golfklubb","56 Cloud Golf Club","57 Crownwood Golf","58 Dagsholm Golfklubb","59 Dalsjö Golfklubb","60 Danderyds Golfklubb","61 Degeberga-Widtsköfle Golfklubb","62 Degerfors Golf","63 Delsjö Golfklubb","64 Djurgårdens IF Golfförening","65 Djursholms Golfklubb","66 Dynekilens Golfklubb","67 Eda Golfklubb","68 Ekarnas Golfklubb","69 Ekerum Golfklubb","70 Ekholmsnäs Golf Lidingö","71 Eksjö Golfklubb","72 Elisefarm Golf Club","73 Emmaboda Golfklubb","74 Enköpings Golfklubb","75 Eskilstuna Golfklubb","76 Eslövs Golfklubb","77 Fagersta Golfklubb","78 Falkenbergs Golfklubb","79 Falköpings Golfklubb","80 Falsterbo Golfklubb","81 Falun-Borlänge Golfklubb","82 Finspångs Golfklubb","83 Fjällbacka Golfklubb","84 Flemminge Golfklubb","85 Flens Golfklubb","86 Flommens Golfklubb","87 Flygstadens Golfklubb","88 Fogdö Golfklubb","89 Fors Golf","90 Forsbacka Golfklubb","91 Forsgårdens Golfklubb","92 Forshaga Golfklubb","93 Friiberghs Golfklubb","94 Frösåker Golf & Country Club","95 Fullerö Golfklubb","96 Funäsfjällens Golfklubb","97 Furudals-Bruks Golfklubb","98 Fågelbro Golf & Country Club","99 Gagnefs Golfklubb","100 Glasrikets Golfklubb Växjö","101 GolfStar Golf Club","102 GolfUppsala","103 GolfUppsala Allmänna Idrottsklubb","104 Gotska Golfklubb","105 Granöbygdens Golfklubb","106 Grindslanten Golfklubb","107 Gripsholms Golfklubb","108 Gränna Golfklubb","109 Gräppås Golfklubb","110 Grönlund Golfklubb","111 Gullbringa Golf & Country Club","112 Gumbalde Resort","113 Gunnarns Golfklubb","114 Gällivare-Malmbergets Golfklubb","115 Gävle Golfklubb","116 Götaströms Golfklubb","117 Göteborgs Golf Klubb","118 Hagge Golfklubb","119 Hallstaviks Golfklubb","120 Halmstad Golfarena","121 Halmstad Golfklubb","122 Hammarby IF Golfförening","123 Hammarö Golfklubb","124 Haninge Golfklubb","125 HaningeStrand Golfklubb","126 Haparanda Golfklubb","127 Happy Golfers","128 Harabäckens Golfklubb","129 Hasselabygdens Golfklubb","130 Haverdals Golfklubb","131 Hedemora Golfklubb","132 Hede-Vemdalens Golfklubb","133 Helsingborgs Golfklubb","134 Herrljunga Golfklubb","135 HG Golf Glumslöv","136 Hills Golf & Sports Club","137 Hills Golfklubb","138 Hinton Golf Club","139 Hofgårds Golfklubb","140 Hofors Golfklubb","141 Holma Stångenäs Golf","142 Holms Golfklubb","143 Hooks Golfklubb","144 Hudiksvalls Golfklubb","145 Hulta-Bollebygd Golfklubb","146 Hussborg Golfklubb","147 Huvudstadens Golfklubb","148 Hälla Golfklubb","149 Härnösands Golfklubb","150 Hässelby Golfklubb","151 Hässlegårdens Golfklubb","152 Höganäs Golfklubb","153 Högbo Golfklubb","154 Hökensås Golfklubb","155 Hörlycke Golfklubb","156 Idrefjällens Golfklubb","157 Idrottshögskolans Golfklubb","158 Ingarö Golf","159 Ingarö Golfklubb","160 Ingelsta Golfklubb","161 Isaberg Golfklubb","162 Jarlabanke Golfklubb","163 Johannesberg Golfklubb","164 Järfälla Golfklubb","165 Järvsöbadens Golfklubb","166 Jönköpings Golfklubb","167 Jönåkers Golfklubb","168 Kalix Golfklubb","169 Kallfors Golf","170 Kalmar Golfklubb","171 Karlshamns Golfklubb","172 Karlskoga Golfklubb","173 Karlstads Golfklubb","174 Katrineholms Golfklubb","175 Kiladalens Golfklubb","176 Kils Golfklubb","177 Kinda Golfklubb","178 Kinds Golfklubb","179 Kiruna Golfklubb","180 Klosterfjordens Golfklubb","181 Klövsjö-Vemdalens Golfklubb","182 Knistad Golf & Country Club","183 Koberg Golfklubb","184 Kristianstads Golfklubb","185 Kristinehamns Golfklubb","186 Kumla Golfklubb","187 Kungl. Drottningholms Golfklubb","188 Kungsbacka Golfklubb","189 Kungälv-Kode Golfklubb","190 Kvicksund Golfklubb","191 Kårsta Golfklubb","192 Kävlinge Golfklubb","193 Köpings Golfklubb","194 Lagans Golfklubb","195 Laholms Golfklubb","196 Landeryds Golfklubb","197 Landskrona Golfklubb","198 Lanna Golfklubb","199 Lannalodge Golfresort","200 Leksands Golfklubb","201 Lerjedalens Golfklubb","202 Leråkra Golfklubb","203 Lidingö Golfklubb","204 Lidköpings Golfklubb","205 Lindesbergs Golfklubb","206 LinksGolf Öland i Grönhögen","207 Linköpings Golfklubb","208 Ljugarns Golfklubb","209 Ljungbyheds Golfklubb","210 Ljunghusens Golfklubb","211 Ljusdals Golfklubb","212 Ljusterö Golfklubb","213 Loftahammars Golfklubb","214 Luleå Golfklubb","215 Lunds Akademiska Golfklubb","216 Lundsbergs Golfklubb","217 Lundsbrunn Golfklubb","218 Lycke Golf & Country Club Marstrand","219 Lyckorna Golfklubb","220 Lycksele Golfklubb","221 Lydinge Golfklubb","222 Lysegårdens Golfklubb","223 Lysingsbadets Golfklubb","224 Läckö Golfklubb","225 Lökeberg Golfklubb","226 Mackmyra Golf","227 Malmö Burlöv Golfklubb","228 Malungs Golfklubb","229 Mariestads Golfklubb","230 Marks Golfklubb","231 Mauritzbergs Slott & Golf","232 Melleruds Golfklubb","233 Mjölby Golfklubb","234 Mjölkeröds Golfklubb","235 Mora Golfklubb","236 Motala Golfklubb","237 Myra Golfklubb","238 Mälarbadens Golfklubb","239 Mälarö Golfklubb Skytteholm","240 Mölle Golfklubb","241 Mölndals Golfklubb","242 Mönsterås Golfklubb","243 Möre Golfklubb","244 Nacka Golfklubb","245 Naturligtvis Golf & Country Club","246 Nicklastorp Golfklubb","247 Nora Golfklubb","248 Norderöns Golfklubb/Njord","249 Norra Backa Golf Fjällbacka","250 Norrby Golf","251 Norrfällsvikens Golfklubb","252 Norrköping Söderköping Golfklubb","253 Norråva Golfklubb","254 Norsjö Golfklubb","255 Nya Ullared Flädje Golfklubb","256 Nybro Golfklubb","257 Nyköpings Golfklubb","258 Nynäshamns Golfklubb","259 När Golfklubb","260 Nässjö Golfklubb","261 Olandsbygdens Golfklubb","262 Ombergs Golf Resort","263 Onsjö Golfklubb","264 Orresta Golfklubb","265 Orust Golfklubb","266 Oskarshamns Golfklubb","267 Oxie Golfklubb","268 Partille Golfklubb","269 Perstorps Golfklubb","270 Piteå Golfklubb","271 Porjus Golfklubb","272 Ramkvilla Golfklubb","273 Reftele Golfklubb","274 Ribbingsfors Golf & Kultur","275 Ringenäs Golfklubb","276 Robertsfors Golfklubb","277 Romeleåsens Golfklubb","278 Ronneby Golfklubb","279 Roslagens Golfklubb Norrtälje","280 Rossöns Golfklubb","281 Rya Golfklubb","282 Rydö Golfklubb","283 Ryfors Golfklubb","284 Rättviks Golfklubb","285 S:t Arild Golfklubb","286 S:t Ibbs Golfklubb","287 SAIK Golfklubb","288 Sala Golfklubb","289 Salems Golfklubb","290 Saltsjöbadens Golfklubb","291 Samuelsdals Golfklubb","292 Sand Golf Club","293 Sandnäset Golf","294 Sankt Jörgen Park Golf","295 Saxnäs Golfklubb","296 Saxå Golfklubb","297 Sigtuna Golfklubb","298 Sisjö Golfklubb","299 Sjöbo Golfklubb","300 Sjögärde Golfklubb","301 Skaftö Golfklubb","302 Skellefteå Golfklubb","303 Skepparslövs Golfklubb","304 Skepptuna Golfklubb Valla","305 Skerike Golfklubb","306 Skinnarebo Golf & Country Club","307 Skogaby Golfklubb","308 Skyrups Golfklubb","309 Skövde Golfklubb","310 Slite Golfklubb","311 Smådalarö Golf","312 Snöå Golfklubb","313 Solbacka Golfklubb","314 Sollefteå Golfklubb","315 Sollentuna Golfklubb","316 Sommarro Golf","317 Sotenäs Golfklubb","318 Sparren Golfklubb","319 Stannum Golfklubb","320 Stenungsund Golfklubb","321 Stjernfors Golfklubb","322 Stockholms Golfklubb","323 Storsjöbygdens Golfklubb","324 Strand Golf","325 Strands Golfklubb","326 Strandtorps Golfklubb","327 Strängnäs Golfklubb","328 Strömsholms Golfklubb","329 Strömstad Golfklubb","330 Strömsunds Golfklubb","331 Sundsta Golf Norrtälje","332 Sundsvalls Golfklubb","333 Sunne Golfklubb","334 Surahammars Golfklubb","335 Svegs Golfklubb","336 Sälenfjällens Golfklubb","337 Särö Golf Club","338 Säters Golfklubb","339 Söderhamns Golfklubb","340 Söderslätts Golfklubb","341 Söderåsens Golfklubb","342 Sölvesborgs Golfklubb","343 Sönnertorps Golfklubb","344 Sörfjärdens Golfklubb","345 Tegelberga Golfklubb","346 The National Golfresort","347 Timrå Golfklubb","348 Tjusta Golf","349 Tjörns Golfklubb","350 Tobo Golfklubb","351 Tomelilla Golfklubb","352 Torekovs Golfklubb","353 Torreby Golfklubb","354 Torsby Golfklubb","355 Torshälla Golfklubb","356 Torslanda Golfklubb","357 Tortuna Golfklubb","358 Tranås Golfklubb","359 Trelleborgs Golfklubb","360 Trosa Golfklubb","361 Troxhammar Golfklubb","362 Trummenäs Golfklubb","363 Tureholms Nya Golfklubb","364 Tyresö Golf","365 Täby Golfklubb","366 Tällbergsbyarnas Golfklubb","367 Tönnersjö Golfklubb","368 Töreboda Golfklubb","369 Uddeholms Golfklubb","370 Uddevalla Golfklubb","371 Ullna Golf & Country Club","372 Ulricehamns Golfklubb","373 Ulriksdals Golfklubb","374 Umeå Golfklubb","375 Umeå Norrmjöle Golfklubb","376 Umeå Sörfors Golfklubb","377 Uppvidinge Golfklubb","378 Upsala Golfklubb","379 Vadstena Golfklubb","380 Vallda Golf & Country Club","381 Vallentuna Golfklubb","382 Valley Golfklubb","383 Vallgårdens Golfklubb Åkarp","384 Vara-Bjertorp Golfklubb","385 Varbergs Golfklubb","386 Vasatorps Golfklubb","387 Vassunda Golfklubb","388 Veckefjärdens Golf Club","389 Vellinge Golfklubb","390 Vetlanda Golfklubb","391 Vidbynäs Golf","392 Viksbergs Golfklubb","393 Viksjö Golfklubb","394 Villa Baro Golf Åtvidaberg","395 Vimmerby Golfklubb","396 Vinbergs Golfklubb","397 Vingåkers Golfklubb","398 Vippy Junior Golfklubb","399 Visby Golfklubb","400 Visingsö Links Golfklubb","401 Vreta Kloster Golfklubb","402 Vårdsbergs Golfklubb","403 Vårgårda Golfklubb","404 Väddö Golfklubb","405 Värnamo Golfklubb","406 Värpinge Golfklubb","407 Västerviks Golf","408 Västerås Golfklubb","409 Växjö Golfklubb","410 Waldemarsviks Golfbana","411 Wasa Golfklubb","412 Wattholma Golfklubb","413 Waxholms Golfklubb","414 Wermdö Golf & Country Club","415 Wiredaholm Golf & Konferens","416 Wittsjö Golfklubb","417 Woodlands Golf & Country Club","418 World of Golf City Club","419 Wäsby Golfklubb","420 Ystad Golfklubb","421 Åda Golf & Country Club","422 Ågesta Golfklubb","423 Åkagårdens Golfklubb","424 Åkersberga Golfklubb","425 Åre Golfklubb","426 Årjängs Golfklubb","427 Åsele Nya Golfklubb","428 Åsundsholms Golfklubb","429 Älmhults Golfklubb","430 Älvdalens Golfklubb","431 Älvkarleby Golfklubb","432 Ängelholms Golfklubb","433 Ängsö Golfklubb","434 Öijared Golfklubb","435 Öjestrand Golf Club","436 Ölands Golfklubb","437 Örbyhus Golfklubb","438 Örebro City Golf & Country Club","439 Öregrunds Golfklubb","440 Örestads Golfklubb","441 Öresunds Golf","442 Örnsköldsviks Golfklubb Puttom","443 Östad Golf Väderstad","444 Österlens Golfklubb","445 Östersund-Frösö Golfklubb","446 Österåkers Golfklubb","447 Östra Göinge Golfklubb"]
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
        // try {
        let content = match.groups.content
        // console.log(content)
        return content
        // } catch (e) {
        //     console.log(e)
        //     return "{}"
        // }

    }
}


let blockingInterval
const clubs = {
    list: [],
    data: {},
    cluburl: "https://www.caddee.se/anslutna-klubbar",
    baseurl: "https://www.caddee.se/klubb/",
    getClubList: async function() {
        let courses = await fs.readFile('../../assets/golfklubbar.json', 'utf8')

        return await JSON.parse(courses)
    },
    getExistingData: async function() {
        let clubdata = await fs.readFile('../../assets/caddee-data.json', 'utf8')

        return await JSON.parse(clubdata)
    },
    count: async function() {
        let clublist = this.getClubList()
        console.log(clublist.length)
        return clublist.length
    },
    getClubs: async function() {
        const page = await webReader.fetchAsText(this.cluburl)
        const re = new RegExp(String.raw`<a [^>]*class="ClubItem__GoToLink-sc-655ca86b-6 dnaAPa"[^>]*href="\/klubb\/(?<id>[^"]*)"[^>]*>(?<name>[^<]*)<\/a>`, 'gm')
        let matches = [...page.matchAll(re)]
        let clublist = []
        matches.forEach((match)=> {
            clublist.push({
                id: match.groups.id.toString().replace("&amp;", "&"),
                name: match.groups.name
            })
        })
        console.log("Antal klubbar:", clublist.length)
        clublist = clubs.complementList(clublist)
        console.log("Antal klubbar (komplement):", clublist.length)
        await fs.writeFile('../../assets/golfklubbar.json', JSON.stringify(clublist, null, 2))
    },
    generateClubId: function(name) {
        let str = name.toLowerCase()
        str = str.replace(/^\d+\s/, "")
        str = str.replace(/[åä]/g, "a")
        str = str.replaceAll("ö", "o")
        str = str.replace(/\s?&(amp;)?\s?/g, " ")
        str = str.trim()
        str = str.replace(/\s+/g, "-")
        return str
    },
    formatClubName: (name) => {
        let str = name.replace(/^\d+\s/, "")
        str = str.replaceAll("GK", "Golfklubb")
        return str
    },
    complementList: function(clublist) {
        allClubs.map(club => {
            const name = club.replace(/^\d+\s/, "")
            if (!clublist.find(x => x.name == name)) {
                let id = clubs.generateClubId(name)
                if (!clublist.find(x=> [id, id.replace("klubb",""), id+"klubb"].includes(x.id))) {
                    clublist.push({
                        id: id,
                        name: name
                    })
                }
                
            }
        })
        return clublist
    },
    getClubData: async function(club) {
        try {
            const page = await webReader.fetchAsText(this.baseurl + club)
            let data = await webReader.getContentByHtmlId("__NEXT_DATA__", page)
            data = await JSON.parse(await data)
            return await data || {}
        } catch {
            console.log(club)
            return {}
        }
    },
    saveToFile: async function() {
        await fs.writeFile('../../assets/caddee-data.json', JSON.stringify(clubs.data, null, 2))
        clearInterval(blockingInterval)
    },
    getMissing: function(courses, clubdata) {
        const clublist = Object.keys(clubdata)
        console.log(courses.length, clublist.length)
        const missing = courses.filter(x => !clublist.includes(x))
        return missing
    },
    getEmpty: function(courses, clubdata) {
        // const clublist = Object.keys(clubdata)
        console.log(courses.length, Object.keys(clubdata).length)
        const empty = courses.filter(x => !Object.keys(clubdata[x]).length)
        return empty
    }
}

// get data
async function main() {
    clubs.list = await clubs.getClubList()
    clubs.list = await clubs.list.map(x => x.id)
    console.log(clubs.list)
    let data = {}
    let prom = new Promise((resolve, reject) => {
        try {
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
                        console.log("iterations, finalCount: ", iterations, lastCount)
                    }
                    resolve()
                }
            })
        } catch {reject()}
        
    })
    prom.then(()=> {
        clubs.data = data
        blockingInterval = setInterval(()=> undefined, 100)
        clubs.saveToFile()
    })
}

// complete missing data
async function second() {
    let courses = await clubs.getClubList()
    courses = await courses.map(x => x.id)
    let data = await clubs.getExistingData()
    // console.log(courses, data)
    let missing = clubs.getMissing(await courses, await data)
    console.log("missing: ", missing.length)

    let prom = new Promise((resolve, reject) => {

        missing.forEach(async(club, index) => {
            data[club] = await clubs.getClubData(club)
            // console.log(73, data[club])
            if (index == missing.length -1) {
                resolve()
            }
        })
        
    })
    prom.then(()=> {
        clubs.data = data
        blockingInterval = setInterval(()=> undefined, 100)
        clubs.saveToFile()
        let newMissing = clubs.getMissing(courses, data)
        console.log("missing clubs: ", newMissing)
        console.log("effective ", newMissing.length !== missing.length)
    })
}

async function golfstarComplement() {
    const url = "https://www.caddee.se/klubb/golfstar-golf-club"
    let clublist = await clubs.getClubList()
    let courses = await clublist.map(x => x.id)
    let data = await clubs.getExistingData()
    let empty = clubs.getEmpty(await courses, await data)
    if (!empty) {return}
    const starData = await clubs.getClubData("golfstar-golf-club")
    empty.forEach(id => {
        let name = clublist.find(x => x.id == id).name
        let filtered = starData.props.pageProps.club.courses.filter(course => {
            let extracted = course.name.split(" ")[2]
            return name.includes(extracted)
        })
        if (filtered.length) {
            data[id] = {
                "props": {
                    "pageProps": {
                        "club": {
                            "name": name,
                            "slug": id,
                            "courses": filtered
                        }
                    }
                }
            }
        }
        
    })
    clubs.data = data
    blockingInterval = setInterval(()=> undefined, 100)
    clubs.saveToFile()
    let newEmpty = clubs.getEmpty(courses, data)
    console.log("empty clubs: ", newEmpty)
    console.log("effective ", newEmpty.length !== empty.length)
}

(async function() {
    let courses
    let data
    let res
    switch(process.argv[2]) {
        case "count":
            clubs.count()
            break
        case "missing":
            courses = await clubs.getClubList()
            courses = await courses.map(x => x.id)
            data = await clubs.getExistingData()
            res = clubs.getMissing(await courses, await data)
            console.log(res)
            break
        case "empty":
            courses = await clubs.getClubList()
            courses = await courses.map(x => x.id)
            data = await clubs.getExistingData()
            res = clubs.getEmpty(await courses, await data)
            console.log(res)
            break
        case "list":
        case "clubs":
        case "ls":
            clubs.getClubs()
            break
        case "second":
            second()
            break
        case "golfstar":
        case "get empty":
        case "complement":
            golfstarComplement()
            break
        case "main":
        default:
            main()
            break
    }
})()
// clubs.getClubs()
// main()
// second()

exports = {webReader}