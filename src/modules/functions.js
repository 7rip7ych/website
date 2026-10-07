/**
 * @module functions
 */


function copyToClipboard(str) {
    console.log(str)
    navigator.clipboard.writeText(str)
}

export { copyToClipboard }