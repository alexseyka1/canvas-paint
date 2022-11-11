class Line {
  /** @type {Vector} */
  startPoint
  /** @type {Vector} */
  endPoint

  /**
   * @param {Vector} startPoint
   * @param {Vector} endPoint
   */
  constructor(startPoint, endPoint) {
    this.startPoint = startPoint
    this.endPoint = endPoint
  }

  static detection = {
    /**
     * Check whether point is on the line or not
     * @param {Line} line
     * @param {point} point
     * @returns {boolean}
     */
    onLine(line, point) {
      return (
        point.x <= Math.max(line.startPoint.x, line.endPoint.x) &&
        point.x <= Math.min(line.startPoint.x, line.endPoint.x) &&
        point.y <= Math.max(line.startPoint.y, line.endPoint.y) &&
        point.y <= Math.min(line.startPoint.y, line.endPoint.y)
      )
    },

    /**
     * @param {Vector} a
     * @param {Vector} b
     * @param {Vector} c
     * @returns {number}
     */
    direction(a, b, c) {
      const val = (b.y - a.y) * (c.x - b.x) - (b.x - a.x) * (c.y - b.y)

      if (val == 0) {
        return 0 // Colinear
      } else if (val < 0) {
        return 2 // Anti-clockwise direction
      }
      return 1 // Clockwise direction
    },

    /**
     * @param {Line} firstLine
     * @param {Line} secondLine
     * @returns {boolean}
     */
    isIntersect(firstLine, secondLine) {
      // Four direction for two lines and points of other line
      const dir1 = this.direction(firstLine.startPoint, firstLine.endPoint, secondLine.startPoint),
        dir2 = this.direction(firstLine.startPoint, firstLine.endPoint, secondLine.endPoint),
        dir3 = this.direction(secondLine.startPoint, secondLine.endPoint, firstLine.startPoint),
        dir4 = this.direction(secondLine.startPoint, secondLine.endPoint, firstLine.endPoint)

      // When intersecting
      if (dir1 != dir2 && dir3 != dir4) return true

      // When p2 of line2 are on the line1
      if (dir1 == 0 && this.onLine(firstLine, secondLine.startPoint)) return true

      // When p1 of line2 are on the line1
      if (dir2 == 0 && this.onLine(firstLine, secondLine.endPoint)) return true

      // When p2 of line1 are on the line2
      if (dir3 == 0 && this.onLine(secondLine, firstLine.startPoint)) return true

      // When p1 of line1 are on the line2
      if (dir4 == 0 && this.onLine(secondLine, firstLine.endPoint)) return true

      return false
    },
  }
}
