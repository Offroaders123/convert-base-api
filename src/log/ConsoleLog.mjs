import {AbstractLog} from "./AbstractLog.mjs";

/**
 * Class ConsoleLog
 */
class ConsoleLog extends AbstractLog {
    /**
     * @param {string} log
     */
    log(log) {
        console.log(log);
    }

    /**
     * @param {string} log
     */
    warn(log) {
        this.warnCount();

        console.warn("\x1b[33m\x1b[40m", `WARNING: ${log}`, "\x1b[0m");
    }
}

export {ConsoleLog};
