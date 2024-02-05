
import Identifier from './identifier.js';

export default class SingleCharacter {
  constructor(character) {
    this.character = character;
    this.type = new Identifier('char');
  }

  generate(environment) {
    var m = environment.module;
    var c = this.character;
    return m.i32.const( c.charCodeAt(0) );
  }
};
