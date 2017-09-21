/**
 * Simple class for easier logging
 */
class Logger {
    constructor(name) {
        this.prefix = name + " ";
        this.c = console;
        this.c.debug = this.c.debug || this.c.log;
    }

    d(msg, ...args) {
        arguments[0] = this.prefix + arguments[0];
        this.c.debug.apply(this.c, arguments);
    }

    l(msg, ...args) {
        arguments[0] = this.prefix + arguments[0];
        this.c.log.apply(this.c, arguments);
    }

    i(msg, ...args) {
        arguments[0] = this.prefix + arguments[0];
        this.c.info.apply(this.c, arguments);
    }

    w(msg, ...args) {
        arguments[0] = this.prefix + arguments[0];
        this.c.warn.apply(this.c, arguments);
    }

    e(msg, ...args) {
        arguments[0] = this.prefix + arguments[0];
        this.c.error.apply(this.c, arguments);
    }
}

export default Logger;