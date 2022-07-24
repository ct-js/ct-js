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
         * Check wheather or not the built in developer tools pannel/debugger is opened
         */
        function isDevToolsOpened(): boolean;
        /**
         * Close the game
         */
        function quit(): void;
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
