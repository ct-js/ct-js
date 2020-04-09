/* eslint-disable no-empty */
/* eslint-disable no-underscore-dangle */

// eslint-disable-next-line no-warning-comments
/* Todo:
 * - Add support for ending timers after a certain amount of time
 */

class CtTimer {
    /**
     * An object for holding a timer
     * 
     * @param {string} name The name of the timer
     * @param {boolean} [uiDelta=false] If `true`, it will use `ct.deltaUi` for counting time. if `false`, it will use `ct.delta` for counting time.a
     * @param {number} [startTime=0] The amout of time to start at, **in milliseconds**
     */
    constructor(name, uiDelta = false, startTime = 0) {
        this._name = name;
        this.uiDelta = uiDelta;
        this._time = startTime / 1000 * 60;
        this.time = this._time * 1000 / 60;
    }

    /**
     * Updates the timer. **DONT CALL THIS UNLESS YOU KNOW WHAT YOU ARE DOING**
     *
     * @returns {void}
     * @private
     */
    update() {
        this._time += this.uiDelta ? ct.deltaUi : ct.delta;
        this.time = this._time * 1000 / 60;
    }
}

class CtTimedTimer extends CtTimer {
    /**
     * An object for holding a timed timer
     *
     * @param {string} name The name of the timer
     * @param {number} length The length for the timed timer, **in milliseconds**
     * @param {function} callback The function to call when the timer ends.
     * @param {boolean} [uiDelta=false] If `true`, it will use `ct.deltaUi` for counting time. if `false`, it will use `ct.delta` for counting time.a
     * @param {number} [startTime=0] The amout of time to start at, **in milliseconds**
     */
    constructor(name, length, callback, uiDelta = false, startTime = 0) {
        super(name, uiDelta, startTime);
        this.length = length; // / 1000;
        this.callback = callback;
        this.done = false;
    }

    /**
     * Updates the timer. **DONT CALL THIS UNLESS YOU KNOW WHAT YOU ARE DOING**
     *
     * @returns {void}
     * @private
     */
    update() {
        super.update();
        if (this.time >= this.length && this.done !== true) {
            this.done = true;
            this.callback();
        }
    }
}

(function () {
    /**
     * Timer utilities
     * @namespace
     */
    ct.timer = {
        /**
         * An object with timers.
         * @type Object<CtTimer>
         */
        timers: {},
        /**
         * An object with timed timers.
         * @type Object<CtTimedTimer>
         */
        timedTimers: {},
        /**
         * **DONT USE THIS UNLESS YOU KNOW WHAT YOU ARE DOING**
         * @private
         */
        _timersInternal: {},
        /**
         * Adds a new timer with the given name
         *
         * @param {string} name The name of the timer, which you use to access it from `ct.timer.timers`.
         * @param {boolean} [uiDelta=false] If the timer should be counted using `ct.deltaUi`
         * @param {number} [startTime=0] The amount of time to start at. Counted in seconds.
         * @returns {void}
         */
        addTimer(name, uiDelta = false, startTime = 0) {
            this.timers[name.toString()] = new CtTimer(name, uiDelta, startTime);
        },
        /**
         * Adds a new timed timer with the given name
         *
         * @param {string} name The name of the timer
         * @param {number} length The length for the timed timer, **in milliseconds**
         * @param {function} callback The function to call when the timer ends.
         * @param {boolean} [uiDelta=false] If `true`, it will use `ct.deltaUi` for counting time. if `false`, it will use `ct.delta` for counting time.a
        * @param {number} [startTime=0] The amout of time to start at, **in milliseconds**
         * @returns {void}
         */
        addTimedTimer(name, length, callback, uiDelta = false, startTime = 0) {
            this.timedTimers[name.toString()] = new CtTimedTimer(name, length, callback, uiDelta, startTime);
        },
        /**
         * Removes the timer with the given name
         * 
         * @param {string} name The name of the timer, which you used to access the timer from `ct.timer.timers` or `ct.timer.timedTimers`.
         * @returns {void}
         */
        removeTimer(name) {
            try {
                delete this.timers[name.toString()];
            } catch (e) {
                try {
                    delete this.timedTimers[name.toString()];
                } catch (e2) {
                    console.warn(`[ct.timer] Timer '${name.toString()}' does not exist!`);
                }
            }
        },
        /**
         * Updates the timers. **DONT CALL THIS UNLESS YOU KNOW WHAT YOU ARE DOING**
         * 
         * @returns {void}
         * @private
         */
        updateTimers() {
            //this.timers = {};
            //this.timedTimers = {};

            /*if (Object.keys(this._timers).length > 0) for (const timerName in this._timers) {
                this._timers[timerName] += ct.delta;
                this.timers[timerName] = this._timers[timerName];
            }

            if (Object.keys(this._timersUi).length > 0) for (const timerName in this._timersUi) {
                this._timersUi[timerName] += ct.deltaUi;
                this.timers[timerName] = this._timersUi[timerName];
            }*/

            if (Object.keys(this._timersInternal).length > 0) for (const timerName in this._timersInternal) {
                this._timersInternal[timerName] += ct.deltaUi;
            }

            if (Object.keys(this.timers).length > 0) for (const timerName in this.timers) {
                this.timers[timerName].update();
            }

            // Timed timers

            if (Object.keys(this.timedTimers).length > 0) for (const timerName in this.timedTimers) {
                this.timedTimers[timerName].update();
            }

            //var temp1 = this._timers;
            //this.timers = ct.u.ext(temp1, this._timersUi);

            //if (Object.keys(this.timers).length > 0) for (const timerName in this.timers) {
            //this.timers[timerName] /= 60; // Change the time to seconds
            //}
        }
    };
})();
