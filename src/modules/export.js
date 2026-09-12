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
        document.body.appendChild(this.container)
    }

    close() {
        this.container.remove()
    }

    toPdf() {}

    toImg() {}
}

export default ExportManager