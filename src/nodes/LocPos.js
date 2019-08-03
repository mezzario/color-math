export default class LocPos {
  constructor(ln, col, i) {
    this.ln = ln
    this.col = col
    this.i = i
  }

  toString() {
    return `${this.ln}:${this.col},${this.i}`
  }
}
