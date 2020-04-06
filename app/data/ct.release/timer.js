/* eslint-disable no-underscore-dangle */
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
         * Adds the timer with the given name
         *
         * @param {string} name The name of the timer, which you use to access it from `ct.timer.timers`.
         * @param {boolean} [uiDelta=false] If the timer should be counted using `ct.deltaUi`
         * @param {number} [startTime=0] The amount of time to start at. Counted in seconds.
         * @returns {void}
         */
        addTimer(name, uiDelta = false, startTime = 0) {
            const _startTime = startTime * 60; // Convert to ct.delta time
            if (uiDelta) {
                this._timersUi[name.toString()] = _startTime;
                this.timers[name.toString()] = startTime;
            } else {
                this._timers[name.toString()] = _startTime;
                this.timers[name.toString()] = startTime;
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
            for (let timer of this._timers) {
                if (!(timer instanceof Number)) console.warn(`[ct.timer] ${timer} is not a number!`);
                timer += ct.delta;
            }

            for (let timer of this._timersUi) {
                if (!(timer instanceof Number)) console.warn(`[ct.timer] ${timer} is not a number!`);
                timer += ct.deltaUi;
            }

            var temp1 = this._timers;
            var temp2 = ct.u.ext(temp1, this._timersUi);
            this.timers = temp2;

            for (let timer of this.timers) {
                timer /= 60; // Change the time to seconds
            }
        }
    };
})();
