// import * as htmlToImage from '../../node_modules/html-to-image/dist/html-to-image.js'
// // import { toPng, toJpeg, toBlob, toPixelData, toSvg } from '/node_modules/html-to-image/dist/html-to-image.js'
// import * as download from '../../node_modules/downloadjs/download.js'

class ExportManager {
    constructor(content, manner="download") {
        this.content = content
        this.manner = manner
        this.populate()
    }

    populate() {
        this.container = document.createElement("div")
        this.container.className = "popup-window export"
        this.closeButton = document.createElement("button")
        this.closeButton.innerText = "X"
        this.closeButton.className = "close-button"
        this.container.appendChild(this.closeButton)
        this.closeButton.onclick = () => this.close()

        let main = document.createElement("div")
        this.container.appendChild(main)
        main.innerText = this.manner
    }

    open() {
        // document.body.appendChild(this.container)
        this.toImg()
    }

    close() {
        this.container.remove()
    }

    toPdf() {
        html2pdf().from(this.content).save()
    }

    toImg() {
        htmlToImage
            .toPng(this.content, {backgroundColor: "white", style: {margin: 0}})
            .then((dataUrl) => download(dataUrl, 'resultat.png'))
    }

    print() {
        // newWindow object can only be created by window.open()
        // in an event listener.
        // If we call it elsewhere, null will be returned
        const newWindow = window.open()

        // creating a new html node
        const html = document.createElement("html")

        // We can load the CSS by cloning the document head
        // NOTE: since we are going to move node to a foreign 
        // window object, we need to clone the DOM nodes.
        // If we dont clone, the node in this original window 
        // will disappear, because we have moved it to a new location.
        // cloneNode(true) will perform a deep clone 
        const head = document.head.cloneNode(true)

        // creating a new body element for our newWindow
        const body = document.createElement("body")

        // grab the elements that you want to convert to PDF
        const section = this.content
            .cloneNode(true)

        // you can append as many child as you like
        // this is where we add our elements to the new window.
        body.appendChild(section)

        html.appendChild(head)
        html.appendChild(body)

        // write content to the new window's document.
        newWindow.document.write(html.innerHTML)

        // close document to stop writing
        // otherwise new window may hang
        newWindow.document.close()
        
        // print content in new window as PDF
        newWindow.print()

        // close the new window after printing
        newWindow.close()
    }
}

export default ExportManager