type Listener<T = any> = (data: T) => void;

interface EventMap {
    [eventName: string]: any;
}

declare class Signals {
    private events: Record<string, {
        fn: Listener<TEvents[K]>;
        once: boolean;
        called?: boolean;
    }[]>;

    constructor();

    /**
     * Creates a new Signals instance
     */
    create(): Signals;

    /**
     * Register a persistent listener for an event.
     * @param event - The event name.
     * @param listener - The callback function.
     */
    on(event: string, listener: Listener): void;

    /**
     * Register a one-time listener for an event.
     * @param event - The event name.
     * @param listener - The callback function.
     */
    once(event: string, listener: Listener): void;

    /**
     * Remove a specific listener from an event.
     * @param event - The event name.
     * @param listener - The callback to remove.
     */
    off(event: string, listener: Listener): void;

    /**
     * Remove all listeners for a given event.
     * @param event - The event name.
     */
    removeAll(event: string): void;

    /**
     * Remove all listeners from all events (reset to initial state).
     */
    reset(): void;

    /**
     * Emit an event, calling all registered listeners with the provided data.
     * @param event - The event name.
     * @param data - Optional data to pass to each listener.
     */
    emit(event: string, data?: any): void;
}

// Duplicated as namespace for Catnip.
declare namespace signals {
    /**
     * Emit an event, calling all registered listeners with the provided data.
     * @param event - The event name.
     * @param data - Optional data to pass to each listener.
     * @catnipName Emit a signal
     */
    function emit(event: string, data?: any): void;
    /**
     * Creates a new Signals instance
     * @catnipIgnore
     */
    function create(): Signals;

    /**
     * Register a persistent listener for an event.
     * @param event - The event name.
     * @param listener - The callback function.
     * @catnipName Start listening for a signal
     */
    function on(event: string, listener: Listener): void;

    /**
     * Register a one-time listener for an event.
     * @param event - The event name.
     * @param listener - The callback function.
     * @catnipName Listen for a signal once
     */
    function once(event: string, listener: Listener): void;

    /**
     * Remove a specific listener from an event.
     * @param event - The event name.
     * @param listener - The callback to remove.
     * @catnipName Stop listening for a signal
     */
    function off(event: string, listener: Listener): void;

    /**
     * Remove all listeners for a given event.
     * @param event - The event name.
     * @catnipName Remove all listeners for a signal
     */
    function removeAll(event: string): void;

    /**
     * Remove all listeners from all events (reset to initial state).
     * @catnipName Stop listening to all signals
     */
    function reset(): void;
}
