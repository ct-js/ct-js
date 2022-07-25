declare namespace ct {
  /**
  * A module that provides desktop features,
  * such as quitting the game, toggling the debugger/devtools, and more!
  */
    namespace desktop {
        /**
         * Open the built-in developer tools pannel/debugger
         */
        function openDevTools(options?: { mode: 'left' | 'right' | 'bottom' | 'undocked' | 'detach', activate: boolean }): void;
        /**
         * Close the built-in developer tools pannel/debugger
         */
        function closeDevTools(): void;
        /**
         * Close the game
         */
        function quit(): void;
        /**
         * Show and focus onto the window
         */
        function show(): void;
        /**
         * Hide the window
         */
        function hide(): void;
        /**
         * Maximize the window; and also show (but not focus) the window if it isn't already visible
         */
        function maximize(): void;
        /**
         * Unmaximize the window
         */
        function unmaximize(): void;
        /**
         * Minimize the window
         */
        function minimize(): void;
        /**
         * Restore the window to its previous state
         */
        function restore(): void;
        /**
         * Enter fullscreen mode
         */
        function fullscreen(): void;
        /**
         * Leave fullscreen mode
         */
        function unfullscreen(): void;
        /**
         * Whether or not the game is running as a desktop app
         */
        var isDesktop: boolean;
        /**
         * Whether or not the game is running as a desktop app using NW.js
         */
        var isNw: boolean;
        /**
         * Whether or not the game is running as a desktop app using Electron
         */
        var isElectron: boolean;
    }
}
