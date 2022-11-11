class Polygon {
  /** @type {Vector[]} */
  points = []

  constructor(points = []) {
    this.points = points
  }

  /**
   * @param {Vector} point
   */
  pushPoint(point) {
    this.points.push(point)
  }

  /**
   * @returns {Vector}
   */
  popPoint() {
    return this.points.pop()
  }

  /**
   * @returns {number}
   */
  getPointsCount() {
    return this.points.length
  }

  *iteratePoints() {
    for (let pointIndex = 0; pointIndex < this.getPointsCount(); pointIndex++) {
      yield this.points[pointIndex]
    }
  }

  /**
   * @returns {Vector}
   */
  getLastPoint() {
    const point = this.points[this.getPointsCount() - 1]
    return point ?? null
  }

  static detection = {
    /**
     * @param {Polygon} polygon
     * @param {Vector} point
     * @returns
     */
    isPointInside(polygon, point) {
      // When polygon has less than 3 edge, it is not polygon
      const n = polygon.getPointsCount()
      if (n < 3) return false

      // Create a point at infinity, y is same as point p
      const exline = new Line(point, new Vector(9999, point.y))

      let count = 0
      let i = 0
      do {
        // Forming a line from two consecutive points of polygon
        const side = new Line(polygon.points[i], polygon.points[(i + 1) % n])
        if (Line.detection.isIntersect(side, exline)) {
          // If side is intersects exline
          if (Line.detection.direction(side.startPoint, point, side.endPoint) == 0)
            return Line.detection.onLine(side, point)
          count++
        }

        i = (i + 1) % n
      } while (i != 0)

      // When count is odd
      return count & 1
    },
  }

  /**
   * @returns {Polygon}
   */
  clone() {
    const clonedPoints = []
    for (let point of this.iteratePoints()) {
      clonedPoints.push(point.clone())
    }

    return new Polygon(clonedPoints)
  }
}
