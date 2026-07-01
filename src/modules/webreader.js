/**
 * @module webreader
 */

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
            }
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

export { webReader }