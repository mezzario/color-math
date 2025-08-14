import {Node} from './Node.js';

export class Expr extends Node {
  constructor($type, $loc) {
    super(`expr.${$type}`, $loc);
  }
}
