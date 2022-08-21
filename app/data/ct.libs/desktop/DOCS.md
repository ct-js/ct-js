## ct.desktop.openDevTools(options)

- `options` object (optional)
  - `mode` string - Opens the devtools with specified dock state, can be `left`, `right`, `bottom`, `undocked`, or `detach`.
  - `activate` boolean (optional) - Whether to bring the opened devtools window to the foreground. The default is `true`.

Opens the built-in developer tools pannel/debugger

### Example:

```javascript
if (aReasonToOpenDebugger === true) {
  ct.desktop.openDevTools({ mode: "right" });
}
```

## ct.desktop.closeDevTools()

Closes the built-in developer tools pannel/debugger

### Example:

```javascript
if (aReasonToCloseDebugger === true) {
    ct.desktop.closeDevTools();
}
```

## ct.desktop.isDevToolsOpen()

Checks whether the built-in developer tools pannel/debugger is open

Returns `boolean`

### Example:

```javascript
if (ct.desktop.isDevToolsOpen() === true) {
    /* do something if devtools is open */
} else if (ct.desktop.isDevToolsOpen() === false) {
    /* do something if devtools is not open */
}
```

## ct.desktop.quit()

Closes the game

### Example:

```javascript
if (itsTimeToExitNow === true) {
    ct.desktop.quit();
}
```

## ct.desktop.show()

Shows and focuses on the window

### Example:

```javascript
if (reasonToFocusWindow === true) {
    ct.desktop.show();
}
```

## ct.desktop.hide()

Hides the window

### Warning:

`.hide()` will make the window completly invisible and will not show the window in any operating system menus (Although the app's process will still show in task manager) It will appear as if the app isnt open at all (even though it is actually running)

**It's nearly impossible to close the window when it's hidden, so make sure you use `.show()` later in your code to make sure the user can see your app!** The only way to close a window hidden with `.hide()` is to kill it's process. 

### Example:

```javascript
if (timeToHide === true) {
    ct.desktop.hide();
}
```

## ct.desktop.isVisible()

Checks whether or not the window is visible

Returns `boolean`

### Example:

```javascript
if (ct.desktop.isVisible() === true) {
    /* do something if the window is showing */
} else if (ct.desktop.isVisible() === false) {
    /* do something if the window is hidden */
}
```

## ct.desktop.maximize()

Maximizes the window; this will also show (but not focus) the window if it isn't already visible

### Example:

```javascript
if (maximizeMe === true) {
    ct.desktop.maximize();
}
```

## ct.desktop.unmaximize()

Unmaximizes the window

### Example

```javascript
if (maximizeMe === false) {
    ct.desktop.unmaximize();
}
```

## ct.desktop.isMaximized()

Checks whether or not the window is maximized

Returns `boolean`

### Example:

```javascript
if (ct.desktop.isMaximized() === true) {
    /* do something if the window is maximized */
} else if (ct.desktop.isMaximized() === false) {
    /* do something if the window is maximized */
}
```

## ct.desktop.minimize()

Minimizes the window

### Example

```javascript
if (minimizeMe === true) {
    ct.desktop.minimize();
}
```

## ct.desktop.restore()

Restores the window from to its previous state

### Example

```javascript
if (reasonToResetWindow) {
    ct.desktop.restore();
}
```

## ct.desktop.isMinimized()

Checks whether or not the window is maximized

Returns `boolean`

### Example:

```javascript
if (ct.desktop.isMinimized() === true) {
    /* do something if the window is minimized */
} else if (ct.desktop.isMinimized() === false) {
    /* do something if the window is minimized */
}
```

## ct.desktop.fullscreen()

Enters fullscreen mode

### Example

```javascript
if (BE_FULLSCREEN === true) {
    ct.desktop.fullscreen();
}
```

## ct.desktop.unfullscreen()

Leaves fullscreen mode

### Example

```javascript
if (BE_FULLSCREEN === false) {
    ct.desktop.unfullscreen();
}
```

## ct.desktop.isFullscreen()

Checks whether or not the window is fullscreen

Returns `boolean`

### Example:

```javascript
if (ct.desktop.isFullscreen() === true) {
    /* do something if the window is fullscreen */
} else if (ct.desktop.isFullscreen() === false) {
    /* do something if the window is fullscreen */
}
```

## ct.desktop.isDesktop

Whether or not the game is running as a desktop app

### Example:

```javascript
if (ct.desktop.isDesktop === true) {
    /* Do something only in the desktop app */
} else if (ct.desktop.isDesktop === false) {
    /* Do something on all platforms other than desktop */
}
```

## ct.desktop.isNw

Whether or not the game is running as a desktop app using NW.js

### Example:

```javascript
if (ct.desktop.isNw === true) {
    /* Do something only in nw.js */
}
```

## ct.desktop.isElectron

Whether or not the game is running as a desktop app using Electron

### Example:

```javascript
if (ct.desktop.isElectron === true) {
    /* Do something only in Electron */
}
```

## ct.desktop.desktopFeature(feature)

- `feature` object
  - `name` string
  - `parameter` string (optional) - Defaults to `undefined`
  - `nw` object - Options for NW.js
    - `namespace` string
    - `method` string (optional) - Defaults to `feature.name`
    - `parameter` string (optional) - Defaults to `feature.parameter`
  - `electron` object - Options for Electron
    - `namespace` string
    - `method` string (optional) - Defaults to `feature.name`
    - `parameter` string (optional) - Defaults to `feature.parameter`

Validates environment and runs framework-specific methods depending on detected environment and configured options

Returns `feature.nw.namespace[feature.nw.method](feature.nw.parameter)` or `feature.electron.namespace[feature.electron.method](feature.electron.parameter)`

(i.e. Returns the function defined in the `namespace` and `method` properties of the current environment)

### Example:

```javascript
ct.desktop.desktopFeature({
    name: 'customDesktopStuff',
    parameter: someParameter,
    nw: {
        namespace: 'win.something',
        method: 'someNwFunction'
    },
    electron: {
        namespace: 'mainWindow.something',
        method: 'someElectronFunction'
    }
});
/* Will run win.something.someNwFunction('abc') on NW.js */
/* Will run mainWindow.something.someElectronFunction('abc') on Electron */
```
