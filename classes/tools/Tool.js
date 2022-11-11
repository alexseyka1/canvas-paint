class Tool extends EventTarget {
  paintCanvas
  cursorCanvas

  /** @type {string} */
  name
  /** @type {string} */
  icon
  /** @type {{eventName: string, callback: Function, context: string}[]} */
  events = []

  constructor(name, icon) {
    super()

    this.name = name
    this.icon = icon

    this.addEventListener("activate", this.onActivate)
    this.addEventListener("deactivate", this.onDeactivate)
  }

  setPaintCanvas(canvas) {
    this.paintCanvas = canvas
  }

  setCursorCanvas(canvas) {
    this.cursorCanvas = canvas
  }

  registerEvent(eventName, callback, context = null) {
    this.events.push({
      eventName,
      callback,
      context: context || this,
    })
  }

  /**
   * @param {Event} e
   */
  onActivate(e) {
    const toolOptions = document.querySelector(".toolOptions")
    toolOptions.innerHTML = ""

    for (let { eventName, callback, context } of this.events) {
      context.addEventListener(eventName, callback)
    }
  }

  /**
   * @param {Event} e
   */
  onDeactivate(e) {
    const toolOptions = document.querySelector(".toolOptions")
    toolOptions.innerHTML = ""

    for (let { eventName, callback, context } of this.events) {
      context.removeEventListener(eventName, callback)
    }
  }
}
