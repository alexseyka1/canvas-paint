class SelectTool extends Tool {
  MODE_SELECTING = 1
  MODE_MOVING = 2

  mode
  isMouseDown = false
  startPosition
  endPosition

  mouseDownPosition
  moveStartPositions = {}

  constructor(mainCanvas, cursorCanvas) {
    super("Select tool", "fa-solid fa-arrow-pointer")
    this.setPaintCanvas(mainCanvas)
    this.setCursorCanvas(cursorCanvas)

    this.onKeyPress = this.onKeyPress.bind(this)

    this.registerEvent("mouse-down", this.#onMouseDown)
    this.registerEvent("mouse-up", this.#onMouseUp)
    this.registerEvent("mouse-move", this.#onMouseMove)
    this.registerEvent("keydown", this.onKeyPress, window)

    this.mode = this.MODE_SELECTING
  }

  onKeyPress(e) {
    switch (true) {
      case e.key === "Escape":
        this.startPosition = null
        this.endPosition = null
        this.mouseDownPosition = null
        this.moveStartPositions = {}
        this.mode = this.MODE_SELECTING
        this.isMouseDown = false
        this.#drawFrame()
        break
      case ["Backspace", "Delete"].includes(e.key):
        this.#removeSelectedArea()
        this.#drawFrame()
        break
    }
  }

  #removeSelectedArea() {
    /** @type {CanvasRenderingContext2D} */
    const context = this.paintCanvas.getContext("2d")

    context.clearRect(
      this.startPosition.x,
      this.startPosition.y,
      this.endPosition.x - this.startPosition.x,
      this.endPosition.y - this.startPosition.y
    )
  }

  #onMouseDown(e) {
    /** @type {Vector} */
    const position = e.detail

    this.isMouseDown = true

    if (!this.endPosition) {
      this.mode = this.MODE_SELECTING
      this.startPosition = position
    } else {
      this.mode = this.MODE_MOVING
      if (this.#getIsInMoveArea(position)) {
        this.mouseDownPosition = position
        this.moveStartPositions = { start: this.startPosition.clone(), end: this.endPosition.clone() }
      }
    }
  }

  #onMouseUp(e) {
    /** @type {Vector} */
    const position = e.detail

    this.isMouseDown = false
    this.mouseDownPosition = null
    this.moveStartPositions = {}

    if (this.mode === this.MODE_SELECTING) {
      this.endPosition = position
    }
    this.#drawFrame()
  }

  #onMouseMove(e) {
    /** @type {Vector} */
    const position = e.detail,
      inMoveArea = this.#getIsInMoveArea(position)

    if (this.isMouseDown) {
      if (this.mode === this.MODE_SELECTING) {
        this.endPosition = position
      } else {
        if (this.moveStartPositions.start) {
          const deltaX = position.x - this.mouseDownPosition.x,
            deltaY = position.y - this.mouseDownPosition.y

          this.startPosition.x = this.moveStartPositions.start.x + deltaX
          this.startPosition.y = this.moveStartPositions.start.y + deltaY

          this.endPosition.x = this.moveStartPositions.end.x + deltaX
          this.endPosition.y = this.moveStartPositions.end.y + deltaY
        }
      }
    } else {
      if (inMoveArea) {
        this.cursorCanvas.style.cursor = "move"
      } else {
        this.cursorCanvas.style.cursor = "default"
      }
    }

    this.#drawFrame()
  }

  #getIsInMoveArea(position) {
    if (!this.startPosition || !this.endPosition) return false

    return (
      position.x >= this.startPosition.x &&
      position.x <= this.endPosition.x &&
      position.y >= this.startPosition.y &&
      position.y <= this.endPosition.y
    )
  }

  #drawFrame() {
    /** @type {CanvasRenderingContext2D} */
    const context = this.cursorCanvas.getContext("2d")

    context.clearRect(0, 0, this.cursorCanvas.width, this.cursorCanvas.height)

    if (!this.startPosition || !this.endPosition) return

    context.save()
    context.strokeStyle = "#333333"
    context.beginPath()
    context.setLineDash([8])
    context.strokeRect(
      this.startPosition.x,
      this.startPosition.y,
      this.endPosition.x - this.startPosition.x,
      this.endPosition.y - this.startPosition.y
    )
    context.stroke()
    context.restore()
  }
}
