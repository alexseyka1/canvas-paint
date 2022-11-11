class PolygonTool extends ToolWithColors {
  NODE_RADIUS = 5

  MODE_NODE_ADDING = 0
  MODE_NODE_MOVING = 1
  MODE_POLYGON_MOVING = 2

  /** @type {Polygon} */
  polygon
  mode
  isMouseDown = false
  /** @type {Vector} */
  selectedPoint
  /** @type {Vector} */
  mouseDownPosition
  /** @type {Polygon} */
  mouseDownPolygon

  applyButton
  cancelButton

  constructor(paintCanvas, cursorCanvas) {
    super("Polygon tool", "fa fa-draw-polygon")
    this.setPaintCanvas(paintCanvas)
    this.setCursorCanvas(cursorCanvas)
    this.polygon = new Polygon()
    this.#createActionButtons()

    this.onKeyPress = this.onKeyPress.bind(this)
    this.onCancelButtonPressed = this.onCancelButtonPressed.bind(this)
    this.onApplyButtonPressed = this.onApplyButtonPressed.bind(this)

    this.registerEvent("mouse-down", this.#onMouseDown)
    this.registerEvent("mouse-up", this.#onMouseUp)
    this.registerEvent("mouse-move", this.#onMouseMove)
    this.registerEvent("keydown", this.onKeyPress, window)
    this.registerEvent("click", this.onCancelButtonPressed, this.cancelButton)
    this.registerEvent("click", this.onApplyButtonPressed, this.applyButton)

    this.mode = this.MODE_NODE_ADDING
  }

  #reset() {
    this.polygon = new Polygon()
    this.mode = this.MODE_NODE_ADDING
    this.isMouseDown = false
    this.selectedPoint = null
    this.mouseDownPosition = null
    this.mouseDownPolygon = null
  }

  #createActionButtons() {
    const applyButton = document.createElement("div")
    applyButton.className = "btn btn-success"
    applyButton.innerHTML = "<span class='fa fa-fw fa-check'></span> Apply"

    const cancelButton = document.createElement("div")
    cancelButton.className = "btn"
    cancelButton.innerHTML = "<span class='fa fa-fw fa-times'></span> Cancel"

    this.applyButton = applyButton
    this.cancelButton = cancelButton
  }

  #initActionButtons() {
    const wrapper = document.querySelector(".bottomBar .toolOptions")
    wrapper.append(this.applyButton)
    wrapper.append(this.cancelButton)
  }

  onActivate() {
    super.onActivate()
    this.#initActionButtons()
  }

  onDeactivate() {
    super.onDeactivate()
    this.#reset()
  }

  onCancelButtonPressed() {
    this.#reset()
    this.#drawFrame()
  }

  onApplyButtonPressed() {
    this.#drawFrame()
    window.dispatchEvent(new Event("main-canvas-render"))
    this.#reset()
    this.#drawFrame()
  }

  #onMouseDown(e) {
    /** @type {Vector} */
    const position = e.detail
    this.isMouseDown = true
    this.mouseDownPosition = null
    this.mouseDownPolygon = null

    /** Select and grab one of the points */
    for (let point of this.polygon.iteratePoints()) {
      if (this.#isInPointMoveArea(point, position)) {
        this.selectedPoint = point
        break
      }
    }

    if (this.selectedPoint) {
      this.cursorCanvas.style.cursor = "move"
      this.mode = this.MODE_NODE_MOVING
    } else {
      /** If we haven't selected point */
      /** Setting the current mode if cursor inside the polygon */
      if (Polygon.detection.isPointInside(this.polygon, position)) {
        this.mode = this.MODE_POLYGON_MOVING
        this.cursorCanvas.style.cursor = "grabbing"
        this.mouseDownPosition = position
        this.mouseDownPolygon = this.polygon.clone()
      } else {
        this.mode = this.MODE_NODE_ADDING
        this.polygon.pushPoint(position)
        this.#drawFrame()
      }
    }
  }

  #onMouseUp(e) {
    /** @type {Vector} */
    const position = e.detail
    this.isMouseDown = false

    if (this.selectedPoint) this.selectedPoint = null
    if (this.MODE_POLYGON_MOVING) this.cursorCanvas.style.cursor = "grab"
  }

  #isInPointMoveArea(point, cursorPosition) {
    return (
      cursorPosition.x >= point.x - this.NODE_RADIUS &&
      cursorPosition.x <= point.x + this.NODE_RADIUS &&
      cursorPosition.y >= point.y - this.NODE_RADIUS &&
      cursorPosition.y <= point.y + this.NODE_RADIUS
    )
  }

  #onMouseMove(e) {
    /** @type {Vector} */
    const position = e.detail

    if (this.isMouseDown) {
      switch (this.mode) {
        case this.MODE_NODE_ADDING:
        case this.MODE_NODE_MOVING:
          /** Add new point to polygon or move the existing one */
          let point = this.selectedPoint ? this.selectedPoint : this.polygon.getLastPoint()
          ;[point.x, point.y] = [position.x, position.y]
          break
        case this.MODE_POLYGON_MOVING:
          /** Move the polygon */
          const deltaX = position.x - this.mouseDownPosition.x,
            deltaY = position.y - this.mouseDownPosition.y

          for (let pointIndex = 0; pointIndex < this.polygon.getPointsCount(); pointIndex++) {
            const existingPoint = this.polygon.points[pointIndex],
              mouseDownPoint = this.mouseDownPolygon.points[pointIndex]
            existingPoint.x = mouseDownPoint.x + deltaX
            existingPoint.y = mouseDownPoint.y + deltaY
          }
          break
      }

      this.#drawFrame()
    } else {
      this.cursorCanvas.style.cursor = "default"

      let isCursorOnPoint = false
      for (let point of this.polygon.iteratePoints()) {
        if (this.#isInPointMoveArea(point, position)) {
          isCursorOnPoint = true
          break
        }
      }

      if (isCursorOnPoint) {
        this.cursorCanvas.style.cursor = "move"
      } else if (Polygon.detection.isPointInside(this.polygon, position)) {
        this.cursorCanvas.style.cursor = "grab"
      }
    }
  }

  onKeyPress(e) {
    switch (e.key) {
      case "Backspace":
        this.polygon.popPoint()
        break
      case "Escape":
        this.polygon = new Polygon()
        this.mode = this.MODE_NODE_ADDING
        break
      case "Enter":
        this.onApplyButtonPressed()
        break
    }

    this.#drawFrame()
  }

  #drawFrame() {
    /** @type {CanvasRenderingContext2D} */
    const paintContext = this.paintCanvas.getContext("2d"),
      cursorContext = this.cursorCanvas.getContext("2d")

    paintContext.clearRect(0, 0, this.paintCanvas.width, this.paintCanvas.height)
    cursorContext.clearRect(0, 0, this.cursorCanvas.width, this.cursorCanvas.height)

    if (!this.polygon.getPointsCount()) return

    /** Draw polygon on paint canvas */
    paintContext.save()
    paintContext.fillStyle = this.primaryColor
    paintContext.beginPath()

    let index = 0
    for (let point of this.polygon.iteratePoints()) {
      if (index === 0) {
        paintContext.moveTo(point.x, point.y)
      } else {
        paintContext.lineTo(point.x, point.y)
      }
      index++
    }
    paintContext.fill()
    paintContext.restore()

    /** Draw node points on cursor canvas */
    cursorContext.save()
    for (let point of this.polygon.iteratePoints()) {
      cursorContext.fillStyle = "#ffffff"
      cursorContext.beginPath()
      cursorContext.arc(point.x, point.y, this.NODE_RADIUS + 1, 0, Math.PI * 2) // shadow
      cursorContext.fill()

      cursorContext.fillStyle = "#000000"
      cursorContext.beginPath()
      cursorContext.arc(point.x, point.y, this.NODE_RADIUS, 0, Math.PI * 2)
      cursorContext.fill()
    }
    cursorContext.restore()
  }

  setPrimaryColor(e) {
    super.setPrimaryColor(e)
    this.#drawFrame()
  }
}
