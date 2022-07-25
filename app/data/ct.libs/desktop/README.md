# Desktop features

A module that provides useful desktop-specific features, such as quitting the game, toggling the debugger/devtools, and more!

Below is a list of all methods, functions, and properties that ct.desktop currently provides.

See the other ct.desktop documentation pages for further information and more detailed examples.

## .openDevTools(options)

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

## .closeDevTools()

Closes the built-in developer tools pannel/debugger

### Example:

```javascript
if (aReasonToCloseDebugger === true) {
    ct.desktop.closeDevTools();
}
```

## .quit()

Closes the game

### Example:

```javascript
if (itsTimeToExitNow === true) {
    ct.desktop.quit();
}
```

## .show()

Shows and focuses on the window

### Example:

```javascript
if (reasonToFocusWindow === true) {
    ct.desktop.show();
}
```

## .hide()

Hides the window

### Example:

```javascript
if (timeToHide === true) {
    ct.desktop.hide();
}
```

## .maximize()

Maximizes the window; this will also show (but not focus) the window if it isn't already visible

### Example:

```javascript
if (maximizeMe === true) {
    ct.desktop.maximize();
}
```

## .unmaximize()

Unmaximizes the window

### Example

```javascript
if (maximizeMe === false) {
    ct.desktop.unmaximize();
}
```

## .minimize()

Minimizes the window

### Example

```javascript
if (minimizeMe === true) {
    ct.desktop.minimize();
}
```

## .restore()

Restores the window from to its previous state

### Example

```javascript
if (reasonToResetWindow) {
    ct.desktop.restore();
}
```

## .fullscreen()

Enters fullscreen mode

### Example

```javascript
if (BE_FULLSCREEN === true) {
    ct.desktop.fullscreen();
}
```

## .unfullscreen()

Leaves fullscreen mode

### Example

```javascript
if (BE_FULLSCREEN === false) {
    ct.desktop.unfullscreen();
}
```


## .isDesktop

Whether or not the game is running as a desktop app

### Example:

```javascript
if (ct.desktop.isDesktop === true) {
    /* Do something only in the desktop app */
}
```

## .isNw

Whether or not the game is running as a desktop app using NW.js

### Example:

```javascript
if (ct.desktop.isNw === true) {
    /* Do something only in nw.js */
}
```

## .isElectron

Whether or not the game is running as a desktop app using Electron

### Example:

```javascript
if (ct.desktop.isElectron === true) {
    /* Do something only in Electron */
}
```
