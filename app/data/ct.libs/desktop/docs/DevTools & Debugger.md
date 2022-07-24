# Desktop features - DevTools & Debugger

Since ct.js desktop exports use [Electron](https://electronjs.org/), they come with a built in devtools/debugger pannel. (this is the same devtools/debugger pannel found in most chromium based browsers such as chrome, opera & opera gx, brave browser, and more)

However, by default the devtools/debugger pannel is hidden so that players aren't startled or confused by it.

Below is a list of methods and functions that ct.desktop provides for interacting with the devtools/debugger pannel.

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
