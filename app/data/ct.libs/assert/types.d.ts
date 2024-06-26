/**
 * A tiny module to simplify tests in ct.js projects.
 * @param condition may be either boolean or a function — other values
 * (numbers, strings) will fail. Functions are executed first and then tested
 * against their returned result.
 * @param message The message to show in console.
 */
declare function assert(condition: boolean | (() => unknown), message: string): void;

declare namespace assert {
    /**
     * Displays a summary with a number of failed and passed tasks,
     * and resets the counter of failed and passed tasks.
     */
    function summary(): void;
}
