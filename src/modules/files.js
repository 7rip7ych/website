/**
 * @module files
 */

/**
 * Reads a file (duplicate from kmom05).
 * @param {string} url The url or path to the file.
 * @returns {object} The file contents, not necessarily an object.
 */
async function getFile (url) {
    let response = await fetch(url)
    response = await response.json()
    return response
}

export { getFile }