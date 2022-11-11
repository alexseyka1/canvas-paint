class BrushTool extends ToolWithColors {
  MIN_BRUSH_SIZE = 1
  MAX_BRUSH_SIZE = 500

  brushSize = 40
  brushSizeRangeInput

  isMouseDown = false
  paths = []

  constructor(paintCanvas, cursorCanvas) {
    super("Brush tool", "fa-solid fa-paintbrush")
    this.setPaintCanvas(paintCanvas)
    this.setCursorCanvas(cursorCanvas)

    this.#createBrushSizeRangeInput()

    this.onChangeBrushSize = this.onChangeBrushSize.bind(this)
    this.onContextMenu = this.onContextMenu.bind(this)

    this.registerEvent("change", this.onChangeBrushSize, this.brushSizeRangeInput)
    this.registerEvent("wheel-scrolled", this.#onWheelScrolled)
    this.registerEvent("draw-cursor", this.#onDrawCursor)
    this.registerEvent("mouse-down", this.#onMouseDown)
    this.registerEvent("mouse-up", this.#onMouseUp)
    this.registerEvent("mouse-move", this.#onMouseMove)
    this.registerEvent("mouse-leave", this.#onMouseLeave)
    this.registerEvent("contextmenu", this.onContextMenu, this.cursorCanvas)
  }

  onActivate() {
    super.onActivate()

    const toolOptions = document.querySelector(".toolOptions")
    toolOptions.append(this.brushSizeRangeInput)

    this.cursorCanvas.style.cursor = "none"
  }

  onDeactivate() {
    super.onDeactivate()

    this.cursorCanvas.style.cursor = "default"
  }

  /**
   * @param {Event} e
   */
  onContextMenu(e) {
    e.preventDefault()
    this.primaryColorInput.click()
  }

  /**
   * @param {Event} e
   */
  #onWheelScrolled(e) {
    let newBrushSize = +this.brushSize + e.detail.deltaY * -0.01
    newBrushSize = Math.min(Math.max(this.MIN_BRUSH_SIZE, newBrushSize), this.MAX_BRUSH_SIZE)
    this.#setBrushSize(newBrushSize)
  }

  /** @type {Event} */
  onChangeBrushSize(e) {
    this.#setBrushSize(e.target.value)
  }

  /**
   * @param {number} size
   */
  #setBrushSize(size) {
    this.brushSize = size
    this.brushSizeRangeInput.value = size
  }

  #createBrushSizeRangeInput() {
    const range = document.createElement("input")
    range.type = "range"
    range.name = "brushSize"
    range.min = this.MIN_BRUSH_SIZE
    range.max = this.MAX_BRUSH_SIZE
    this.brushSizeRangeInput = range
  }

  #onDrawCursor(e) {
    /** @type {Vector} */
    const position = e.detail
    const context = this.cursorCanvas.getContext("2d")

    context.clearRect(0, 0, this.cursorCanvas.width, this.cursorCanvas.height)

    context.strokeStyle = "#ffffff"
    context.fillStyle = this.primaryColor

    context.lineWidth = 2

    context.beginPath()
    context.arc(position.x, position.y, this.brushSize / 2, 0, Math.PI * 2)
    context.fill()

    context.beginPath()
    context.arc(position.x, position.y, this.brushSize / 2 + context.lineWidth / 2, 0, Math.PI * 2)
    context.stroke()

    if (this.brushSize < 10) {
      const distance = 5,
        length = 10,
        drawCrosshair = () => {
          context.beginPath()
          context.moveTo(position.x - distance - length, position.y)
          context.lineTo(position.x - distance, position.y)
          context.moveTo(position.x + distance, position.y)
          context.lineTo(position.x + distance + length, position.y)
          context.moveTo(position.x, position.y - distance - length)
          context.lineTo(position.x, position.y - distance)
          context.moveTo(position.x, position.y + distance)
          context.lineTo(position.x, position.y + distance + length)
          context.stroke()
        }

      context.lineWidth = 1
      context.strokeStyle = "#000000"
      drawCrosshair()

      /** White shadow */
      context.lineWidth = 3
      context.strokeStyle = "#ffffff"
      drawCrosshair()
    }
  }

  #onMouseDown(e) {
    /** @type {Vector} */
    const position = e.detail

    this.paths.push([position])
    this.isMouseDown = true
  }

  #onMouseUp(e) {
    /** @type {Vector} */
    const position = e.detail

    this.isMouseDown = false

    this.#drawFrame()
    this.paths = []
    window.dispatchEvent(new Event("main-canvas-render"))
  }

  #drawFrame() {
    if (!this.paths.length) return
    const context = this.paintCanvas.getContext("2d")

    context.clearRect(0, 0, this.paintCanvas.width, this.paintCanvas.height)

    for (var pathIndex = 0; pathIndex < this.paths.length; pathIndex++) {
      const path = this.paths[pathIndex]
      if (path.length < 1) continue

      context.strokeStyle = this.primaryColor
      context.lineWidth = this.brushSize

      if (path.length == 1) {
        context.fillStyle = context.strokeStyle
        context.beginPath()
        context.arc(path[0].x, path[0].y, this.brushSize / 2, 0, Math.PI * 2)
        context.fill()
      } else {
        context.lineCap = "round"
        context.lineJoin = "round"
        context.beginPath()
        context.moveTo(path[0].x, path[0].y)

        for (var vectorIndex = 1; vectorIndex < path.length; ++vectorIndex) {
          context.lineTo(path[vectorIndex].x, path[vectorIndex].y)
        }

        context.stroke()
      }
    }
  }

  #onMouseMove(e) {
    /** @type {Vector} */
    const position = e.detail

    if (this.isMouseDown && this.paths.length) {
      this.paths[this.paths.length - 1].push(position)
    }

    this.#drawFrame()
  }

  #onMouseLeave() {
    this.cursorCanvas.getContext("2d").clearRect(0, 0, this.cursorCanvas.width, this.cursorCanvas.height)
  }
}
