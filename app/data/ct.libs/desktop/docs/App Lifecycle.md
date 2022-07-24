# Desktop features - App Lifecycle

Since ct.js desktop exports use [Electron](https://electronjs.org/), the app's lifecycle can be manipulated and controlled using javascript. With the help of [IPC (Inter-Process Communication) in Electron](https://www.electronjs.org/docs/latest/tutorial/ipc) and this ct.desktop module, you can easily controll your app's lifecycle in ct.js!

As of right now, there is only one method ct.desktop provides for app lifecycle management, which is quitting the app.
The method, its usage, and an example is below.

## .quit()

Closes the game

### Example:

```javascript
if (itsTimeToExit === true) {
    ct.desktop.quit();
}
```
