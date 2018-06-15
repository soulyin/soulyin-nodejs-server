'use strict';

class MiniM {
  constructor(date) {
    this.date = date || new Date();
  }
  static unix() {
    return Math.floor((new Date()).getTime() / 1000);
  }
}
module.exports = MiniM;
