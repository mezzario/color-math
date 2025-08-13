import LocPos from './LocPos';

export default class Loc {
  constructor(loc) {
    this.start = new LocPos(loc.first_line, loc.first_column, loc.range[0]);
    this.end = new LocPos(loc.last_line, loc.last_column, loc.range[1]);
  }

  toString() {
    return `${this.start}..${this.end}`;
  }
}
