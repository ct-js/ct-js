# Desktop features - App & Window Management

Since ct.js desktop exports use [Electron](https://electronjs.org/), the app and window can be managed using javascript. With the help of [IPC (Inter-Process Communication) in Electron](https://www.electronjs.org/docs/latest/tutorial/ipc) and this module, ct.desktop, you can easily controll your app and it's window in ct.js!

The default behavior of your game's desktop exports can be set under `Project` > `Render Options` > `Desktop builds`. This module, ct.desktop, lets you change these settings in-game; programatically. It also lets you set some more advanced settings.

Below is a list of methods and functions that ct.desktop provides for interacting with the app and it's window.

## .quit()

Closes the game

### Example:

```javascript
if (itsTimeToExit === true) {
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

Restores the window to its previous state

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
