function raise(message) {
  throw new Error(message);
}

class Path {
  constructor(path) {
    this.commands = [];
    if (path instanceof Path) {
      this.init(path);
    } else if(path instanceof Path2D) {
      this.computed = path;
    } else if(typeof path === "string") {
      this.parse(path);
    } else if(!!path) {
      throw (new Error("Unexpected argument"));
    }
    }

    toString() {
      return this.commands.join(' ');
    }

    init(path) {
    }

    parse(svgpath) {
      let path = svgpath.trim().split(/\s+|\B(?=\d(?=\B))/);
      let op = path.shift();
      while (op) {
        let relative = op.toLowerCase() === op;
         let command = Command.command(op);
         let args = [];
         let cardinality = command.cardinality;
         switch(cardinality)
         {
           default: {
             let arg = path.shift();
             let a = +arg;
             do {
               args.push(command.constructor.arg.apply(
                 undefined,
                 [a].concat(
                   path
                     .slice(0, cardinality - 1)
                     .map(v => ((v = +v),
                                isNaN(v) ? raise("Unexpected argument") : v)))));
               path = path.slice(cardinality - 1);
               arg = path.shift();
               a = +arg;
             } while (!isNaN(a))

             op = arg;
             break;
           }
           case 0: {
             op = path.shift();
             break;
           }
         }
         this.commands.push(new command.constructor(relative, args));
       }
     }
 }

 class Command {
   constructor(relative, parameters) {
     this.relative = relative;
     this.parameters = parameters || [];
   }

   static command(type) {
     switch(type)
     {
       case 'm': case 'M': return Command.M;
       case 'h': case 'H': return Command.H;
       case 'v': case 'V': return Command.V;
       case 'z': case 'Z': return Command.Z;
       case 'c': case 'C': return Command.C;
       case 's': case 'S': return Command.S;
       default: return raise("Unknown command");
     }
   }

    get flat() {
      return this.parameters;
    }

    flatten(acc, v) {
      return acc.push(v), acc;
    }

    static arg(a) {
      return a;
    }

    toString() {
      let command = (this.relative ? "".toLowerCase : "".toUpperCase).call(this.constructor.name);
      let parameters = this.parameters.reduce(this.flatten, []);
      return [command].concat(parameters).join(' ');
    }
}

class M extends Command {
  constructor(relative, parameters) {
    super(relative, parameters);
  }

  flatten(acc, {x, y}) {
    return acc.push(x, y), acc;
  }

  static arg(x, y) {
    return {x, y};
  }
}

class H extends Command {
  constructor(relative, parameters) {
    super(relative, parameters);
  }
}

class V extends Command {
  constructor(relative, parameters) {
    super(relative, parameters);
  }
}

class Z extends Command {
  constructor(relative) {
    super(relative);
  }
}

class C extends Command {
  constructor(relative, parameters) {
    super(relative, parameters);
  }

  flatten(acc, {cpx0, cpy0, cpx1, cpy1, x, y}) {
    return acc.push(cpx0, cpy0, cpx1, cpy1, x, y), acc;
  }

  static arg(cpx0, cpy0, cpx1, cpy1, x, y) {
    return {cpx0, cpy0, cpx1, cpy1, x, y};
  }
}

class S extends C {
  constructor(relative, parameters) {
    super(relative, parameters);
  }

  flatten(acc, {cpx1, cpy1, x, y}) {
    return acc.push(cpx1, cpy1, x, y), acc;
  }

  static arg(cpx1, cpy1, x, y) {
    return {cpx1, cpy1, x, y};
  }
}

class Q extends Command {
  constructor(relative, parameters) {
    super(relative, parameters);
  }

  flatten(acc, {cpx1, cpy1, x, y}) {
    return acc.push(cpx1, cpy1, x, y), acc;
  }

  static arg(cpx1, cpy1, x, y) {
    return {cpx1, cpy1, x, y};
  }
}

class T extends Q {
  constructor(relative, parameters) {
    super(relative, parameters);
  }

  flatten(acc, {x, y}) {
    return acc.push(x, y), acc;
  }

  static arg(x, y) {
    return {x, y};
  }
}

class A extends Command {
  constructor(relative, parameters) {
    super(relative, parameters);
  }

  flatten(acc, {rx, ry, xrotation, arcflag, sweepflag, x, y}) {
    return acc.push(rx, ry, xrotation, arcflag, sweepflag, x, y), acc;
  }

  static arg(x, y) {
    return {rx, ry, xrotation, arcflag, sweepflag, x, y};
  }
}

Command.M = { constructor: M, cardinality: 2 };
Command.H = { constructor: H, cardinality: 1 };
Command.V = { constructor: V, cardinality: 1 };
Command.Z = { constructor: Z, cardinality: 0 };
Command.C = { constructor: C, cardinality: 6 };
Command.S = { constructor: S, cardinality: 4 };
Command.Q = { constructor: Q, cardinality: 4 };
Command.T = { constructor: T, cardinality: 2 };
Command.A = { constructor: A, cardinality: 7 };
