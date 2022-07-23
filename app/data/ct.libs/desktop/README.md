# Desktop features

A module that provides useful desktop-specific features, such as quitting the game, toggling the debugger/devtools, and more!

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
if (itsTimeToExit === true) {
    ct.desktop.quit();
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
