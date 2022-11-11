const Helper = {
  /**
   * @returns {Vector}
   */
  getCursorPosition(event, canvas) {
    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    return new Vector(Math.floor(x), Math.floor(y))
  },
}
