class App {
  canvasWrapper
  mainCanvas
  paintCanvas
  cursorCanvas
  isMouseDown = false

  /** @type {CanvasRenderingContext2D} */
  mainContext
  /** @type {CanvasRenderingContext2D} */
  paintContext
  /** @type {CanvasRenderingContext2D} */
  cursorContext

  tools = []
  /** @type {Tool} */
  currentTool

  constructor(canvas) {
    this.canvasWrapper = canvas.parentNode
    this.mainCanvas = canvas
    this.mainContext = this.mainCanvas.getContext("2d")

    this.#createPaintCanvas()
    this.#createCursorCanvas()
    this.#createTools()
    this.#activateEvents()
    this.#adaptCanvas()

    this.onDownloadImage = this.onDownloadImage.bind(this)
    const saveImageButton = document.getElementById("saveImage")
    saveImageButton.addEventListener("click", this.onDownloadImage)
  }

  /**
   * @param {Tool} tool
   */
  #setCurrentTool(tool) {
    if (this.currentTool) {
      if (this.currentTool === tool) return
      this.currentTool.dispatchEvent(new Event("deactivate"))
    }

    this.currentTool = tool
    this.currentTool.dispatchEvent(new Event("activate"))
  }

  #createTools() {
    const brushTool = new BrushTool(this.paintCanvas, this.cursorCanvas),
      polygonTool = new PolygonTool(this.paintCanvas, this.cursorCanvas)

    this.tools = [new SelectTool(this.mainCanvas, this.cursorCanvas), brushTool, polygonTool]

    this.#setCurrentTool(polygonTool)
    this.#renderToolBar()
  }

  #renderToolBar() {
    const toolBar = document.querySelector(".toolButtons")
    toolBar.innerHTML = ""

    for (let i = 0; i < this.tools.length; i++) {
      /** @type {Tool} */
      const tool = this.tools[i]

      const toolButton = document.createElement("div")
      toolButton.className = "toolButton"
      toolButton.title = tool.name
      if (this.currentTool === tool) {
        toolButton.classList.add("active")
      }

      toolButton.innerHTML = `<span class="${tool.icon}"></span>`
      toolButton.addEventListener("click", (e) => {
        this.#setCurrentTool(tool)
        this.#renderToolBar()
      })
      toolBar.append(toolButton)
    }
  }

  #createPaintCanvas() {
    this.paintCanvas = document.createElement("canvas")
    this.paintCanvas.className = "canvas cursorCanvas"
    this.canvasWrapper.append(this.paintCanvas)

    this.paintContext = this.paintCanvas.getContext("2d")
  }

  #createCursorCanvas() {
    this.cursorCanvas = document.createElement("canvas")
    this.cursorCanvas.className = "canvas cursorCanvas"
    this.canvasWrapper.append(this.cursorCanvas)

    this.cursorContext = this.cursorCanvas.getContext("2d")
  }

  #adaptCanvas() {
    const { width, height } = document.querySelector(".canvasWrapper").getBoundingClientRect()
    ;[this.mainCanvas.width, this.mainCanvas.height] = [width, height]
    ;[this.paintCanvas.width, this.paintCanvas.height] = [width, height]
    ;[this.cursorCanvas.width, this.cursorCanvas.height] = [width, height]
    ;[this.mainCanvas.style.width, this.mainCanvas.style.height] = [width + "px", height + "px"]
    ;[this.paintCanvas.style.width, this.paintCanvas.style.height] = [width + "px", height + "px"]
    ;[this.cursorCanvas.style.width, this.cursorCanvas.style.height] = [width + "px", height + "px"]
  }

  #activateEvents() {
    /**
     * On LEFT mouse button click
     */
    this.cursorCanvas.addEventListener("mousedown", (e) => {
      if (e.button !== 0) return
      const position = Helper.getCursorPosition(e, this.mainCanvas)

      if (this.currentTool) {
        this.currentTool.dispatchEvent(new CustomEvent("mouse-down", { detail: position }))
      }
    })
    this.cursorCanvas.addEventListener("mouseup", (e) => {
      const position = Helper.getCursorPosition(e, this.mainCanvas)

      if (this.currentTool) {
        this.currentTool.dispatchEvent(new CustomEvent("mouse-up", { detail: position }))
      }
    })

    /**
     * On mouse move
     */
    this.cursorCanvas.addEventListener("mousemove", (e) => {
      const position = Helper.getCursorPosition(e, this.mainCanvas)
      const coordsBlock = document.getElementById("coords")
      coordsBlock.innerText = `${position.x};${position.y}`

      if (this.currentTool) {
        this.currentTool.dispatchEvent(new CustomEvent("mouse-move", { detail: position }))
        this.currentTool.dispatchEvent(new CustomEvent("draw-cursor", { detail: position }))
      }
    })

    this.cursorCanvas.addEventListener("mouseleave", (e) => {
      if (this.currentTool) {
        this.currentTool.dispatchEvent(new Event("mouse-leave"))
      }
    })

    /**
     * On scroll
     */
    this.cursorCanvas.addEventListener("wheel", (e) => {
      const position = Helper.getCursorPosition(e, this.mainCanvas)
      e.preventDefault()

      if (this.currentTool) {
        this.currentTool.dispatchEvent(new CustomEvent("wheel-scrolled", { detail: e }))
        this.currentTool.dispatchEvent(new CustomEvent("draw-cursor", { detail: position }))
      }
    })

    /** On draw */
    window.addEventListener("main-canvas-render", (e) => {
      this.mainContext.drawImage(this.paintCanvas, 0, 0)
      this.paintContext.clearRect(0, 0, this.paintCanvas.width, this.paintCanvas.height)

      if (this.currentTool) {
        this.currentTool.dispatchEvent(new Event("frame-drawed"))
      }
    })
  }

  /**
   * @param {Event} e
   */
  onDownloadImage(e) {
    const link = document.createElement("a")
    link.download = "canvas-" + Date.now() + ".png"
    link.href = this.mainCanvas.toDataURL("image/png")
    link.click()
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new App(document.getElementById("canvas"))
})
