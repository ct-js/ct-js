/* eslint-disable no-empty */
/* eslint-disable no-underscore-dangle */

// eslint-disable-next-line no-warning-comments
/* Todo:
 * - Add support for ending timers after a certain amount of time
 */

(function () {
    /**
     * Timer utilities
     * @namespace
     */
    ct.timer = {
        /**
         * An object with timers. Counted in seconds.
         * @type Object<Number>
         */
        timers: {},
        /**
         * **DONT USE THIS UNLESS YOU KNOW WHAT YOU ARE DOING**
         * @private
         */
        _timers: {},
        /**
         * **DONT USE THIS UNLESS YOU KNOW WHAT YOU ARE DOING**
         * @private
         */
        _timersUi: {},
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
            const _startTime = startTime * 60; // Convert to ct.delta time
            if (uiDelta) {
                this._timersUi[name.toString()] = Number(_startTime);
                this.timers[name.toString()] = Number(startTime);
            } else {
                this._timers[name.toString()] = Number(_startTime);
                this.timers[name.toString()] = Number(startTime);
            }
        },
        /**
         * Removes the timer with the given name
         * 
         * @param {string} name The name of the timer, which you used to access the timer from `ct.timer.timers`.
         * @returns {void}
         */
        removeTimer(name) {
            try {
                delete this._timers[name.toString()];
                delete this.timers[name.toString()];
            } catch (e) {
                try {
                    delete this._timersUi[name.toString()];
                    delete this.timers[name.toString()];
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
            this.timers = {};

            if (Object.keys(this._timers).length > 0) for (const timerName in this._timers) {
                this._timers[timerName] += ct.delta;
                this.timers[timerName] = this._timers[timerName];
            }

            if (Object.keys(this._timersUi).length > 0) for (const timerName in this._timersUi) {
                this._timersUi[timerName] += ct.deltaUi;
                this.timers[timerName] = this._timersUi[timerName];
            }

            if (Object.keys(this._timersInternal).length > 0) for (const timerName in this._timersInternal) {
                this._timersInternal[timerName] += ct.deltaUi;
                this.timers[timerName] = this._timersInternal[timerName];
            }

            //var temp1 = this._timers;
            //this.timers = ct.u.ext(temp1, this._timersUi);

            if (Object.keys(this.timers).length > 0) for (const timerName in this.timers) {
                this.timers[timerName] /= 60; // Change the time to seconds
            }
        }
    };
})();
