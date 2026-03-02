/**
 * signals - A tiny observable-like event emitter.
 * @class
 */
class Signals {
    constructor() {
    /** @private {Object.<string, Array<{fn: Function, once: boolean}>>} */
        this.events = {};
    }

    // eslint-disable-next-line class-methods-use-this
    create() {
        return new Signals();
    }

    /**
     * Register a persistent listener for an event.
     * @param {string} event - The event name.
     * @param {Function} listener - The callback function.
     */
    on(event, listener) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push({
            fn: listener, once: false
        });
    }

    /**
     * Register a one-time listener for an event.
     * @param {string} event - The event name.
     * @param {Function} listener - The callback function.
     */
    once(event, listener) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push({
            fn: listener, once: true
        });
    }

    /**
     * Remove a specific listener from an event.
     * @param {string} event - The event name.
     * @param {Function} listener - The callback to remove.
     */
    off(event, listener) {
        const listeners = this.events[event];
        if (!listeners) {
            return;
        }
        for (let i = listeners.length - 1; i >= 0; i--) {
            if (listeners[i].fn === listener) {
                listeners.splice(i, 1);
            }
        }
    }

    /**
     * Remove all listeners for a given event.
     * @param {string} event - The event name.
     */
    removeAll(event) {
        delete this.events[event];
    }

    /**
     * Remove all listeners from all events (reset to initial state).
     */
    reset() {
        this.events = {};
    }

    /**
     * Emit an event, calling all registered listeners with the provided data.
     * @param {string} event - The event name.
     * @param {*} [data] - Optional data to pass to each listener.
     */
    emit(event, data) {
        const listeners = this.events[event];
        if (!listeners) {
            return;
        }

        const snapshot = listeners.slice();
        for (let i = 0; i < snapshot.length; i++) {
            const entry = snapshot[i];
            if (entry.once) {
                entry.called = true;
            }
            entry.fn(data);
        }

        // Clean up called once‑listeners
        for (let i = listeners.length - 1; i >= 0; i--) {
            if (listeners[i].called) {
                listeners.splice(i, 1);
            }
        }
    }
}

const signals = new Signals();
if (settings.isDebug) {
    window.signals = signals;
    window.Signals = Signals;
}
