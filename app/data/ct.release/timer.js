const internalTimerSymbol = Symbol('_timersInternal');

const ctTimerName = Symbol('_name');
const ctTimerTime = Symbol('_time');
const ctTimerRoomName = Symbol('_roomName');
const ctTimerTimeLeftOriginal = Symbol('_timeLeftOriginal');

class CtTimer {
    /**
     * An object for holding a timer
     * 
     * @param {string} name The name of the timer
     * @param {number} [timeMs=0] The length of the timer, **in milliseconds**
     * @param {boolean} [uiDelta=false] If `true`, it will use `ct.deltaUi` for counting time. if `false`, it will use `ct.delta` for counting time.
     * @param {boolean} [addTimer=false] **For internal methods only**
     */
    constructor(name, timeMs = 0, uiDelta = false, addTimer = false) {
        this[ctTimerRoomName] = ct.room.name || '';
        this[ctTimerName] = name.toString();
        this.uiDelta = uiDelta;
        this[ctTimerTime] = 0; //startTime / 1000 * ct.speed;
        this.time = this[ctTimerTime] * 1000 / ct.speed;
        this[ctTimerTimeLeftOriginal] = timeMs;
        this.timeLeft = this[ctTimerTimeLeftOriginal];
        this.promise = new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        });
        this.rejected = false;
        this.done = false;
        if (!addTimer) ct.timer.timers[name.toString()] = this;
    }

    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     *
     * @param {any} onfulfilled The callback to execute when the Promise is resolved.
     * @param {any} [onrejected] The callback to execute when the Promise is rejected.
     * @returns {void}
     * //@returns {Promise} A Promise for the completion of which ever callback is executed.
     */
    then(...args) {
        this.promise.then(...args);
        //return this.promise.then(...args);
    }

    /**
     * Updates the timer. **DONT CALL THIS UNLESS YOU KNOW WHAT YOU ARE DOING**
     *
     * @returns {void}
     * @private
     */
    update() {
        if (this.rejected === true || this.done === true) return;
        this[ctTimerTime] += this.uiDelta ? ct.deltaUi : ct.delta;
        this.time = this[ctTimerTime] * 1000 / ct.speed;
        if (ct.room.name !== this[ctTimerRoomName] && this[ctTimerRoomName] !== '') {
            //this[ctTimerRoomName] = ct.room.name;
            this.reject({
                info: 'Room switch',
                from: 'ct.timer'
            }); // Reject if the room was switched
            this.rejected = true;
        }

        // If the timer is supposed to end
        if (this.timeLeft !== 0) {
            this.timeLeft = this[ctTimerTimeLeftOriginal] - this.time;
            if (this.timeLeft <= 0) {
                this.resolve();
                this.done = true;
            }
        }
    }
}

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
     * Adds a new timer with the given name
     *
     * @param {string} name The name of the timer, which you use to access it from `ct.timer.timers`.
     * @param {number} [timeMs=0] The length of the timer, **in milliseconds**
     * @param {boolean} [uiDelta=false] If `true`, it will use `ct.deltaUi` for counting time. if `false`, it will use `ct.delta` for counting time.
     * @returns {CtTimer} The timer
     */
    addTimer(name, timeMs = 0, uiDelta = false) {
        this.timers[name.toString()] = new CtTimer(name, timeMs, uiDelta, true);
        return this.timers[name.toString()];
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
            console.warn(`[ct.timer] Timer '${name.toString()}' does not exist!`);
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

        if (Object.keys(this[internalTimerSymbol]).length > 0) for (const timerName in this[internalTimerSymbol]) {
            //this[internalTimerSymbol][timerName] += ct.deltaUi;
            if (typeof this[internalTimerSymbol][timerName] === CtTimer) {
                if (this[internalTimerSymbol][timerName].done) delete this[internalTimerSymbol][timerName];
                this[internalTimerSymbol][timerName].update();
            } else this[internalTimerSymbol][timerName] += ct.deltaUi;
        }

        if (Object.keys(this.timers).length > 0) for (const timerName in this.timers) {
            this.timers[timerName].update();
        }

        //var temp1 = this._timers;
        //this.timers = ct.u.ext(temp1, this._timersUi);

        //if (Object.keys(this.timers).length > 0) for (const timerName in this.timers) {
        //this.timers[timerName] /= ct.speed; // Change the time to seconds
        //}
    }
};
/**
 * **DONT USE THIS UNLESS YOU KNOW WHAT YOU ARE DOING**
 * @private
 */
ct.timer[internalTimerSymbol] = {};

//(function () {})();
