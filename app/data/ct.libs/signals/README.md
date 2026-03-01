# Signals

Signals is a tiny event emitter / message system for ct.js. It provides a simple way to implement the observer pattern, allowing different parts of your game to communicate without tight coupling.

## Overview

Signals lets you:
- Emit named events with optional data
- Listen for events with persistent or one-time handlers
- Create isolated signal instances for specific purposes
- Use events directly in templates and rooms through the editor

The recommended way to use Signals is through the editor's event system and using `signals.emit` alone, as it properly handles listeners and removes them when their owning copies or rooms are removed. However, you can also use it manually.

## Using Signals in Templates and Rooms

The Signals module integrates with ct.js's event system, allowing you to listen for signals directly in the room and template editors.

### Adding a Signal Event

1. Open your template or room in the editor;
2. Add a new event;
3. Select **On Signal** from the Signals category;
4. Specify the signal name;
5. Optionally check "Execute once" to make this event one-time.

### Accessing Signal Data

Inside the signal event code, use the `data` variable to access emitted data:

```js
// In a template's "On Signal" event
this.score += data.points;
```

## Manual usage

For project scripts and other cases, you might want to work on the signals catmod directly:

> **Note: the `signals` namespace resets every time you switch a room** to prevent memory leaks if you accidentally capture a whole room or copies and forget to remove listeners. If you want to avoid it, create an instance of the `signals` catmod (section "Creating Custom Signal") and store it in a global variable.

```js
// Listen for a signal. You need to keep a reference to the listening function to remove it later.
const myHandler = (data) => {
    console.log('Score:', data.points);
};
signals.on('scoreUpdated', myHandler);

// Emit a signal. You can pass any data you want in the second argument, or pass nothing.
signals.emit('scoreUpdated', { points: 100 });

// Listen once (fires only once)
const victoryHandler = () => {
  sounds.play('Victory');
};
signals.once('levelFinished', victoryHandler);

// Stop listening for signals.
// Do call this when a signal is no longer needed or when its parent copy or room is removed,
// or you will have a memory leak if you capture copies' or rooms' properties.
signals.off('scoreUpdated', myHandler);
signals.off('levelFinished', victoryHandler);
// It is fine to call this even if a signal was already removed or triggered.
```

## Global Signals API

The global `signals` object provides methods for messaging that trigger copies' and rooms' events.

### signals.emit(event, data)

Emits a named signal to all listeners.

- **event** (string): The signal name
- **data** (any): Optional data to pass to listeners

```js
signals.emit('playerDied', { level: 3 });
```

### signals.on(event, listener)

Registers a persistent listener for a signal. The listener will be called every time the signal is emitted.

- **event** (string): The signal name
- **listener** (function): Callback function receiving the data

```js
signals.on('enemyKilled', (data) => {
    score += data.points;
});
```

### signals.once(event, listener)

Registers a one-time listener. After the signal fires once, the listener is automatically removed.

- **event** (string): The signal name
- **listener** (function): Callback function

```js
signals.once('initialLoad', () => {
    showMainMenu();
});
```

### signals.off(event, listener)

Removes a specific listener from a signal.

- **event** (string): The signal name
- **listener** (function): The callback to remove

```js
var handler = (data) => { /* ... */ };
signals.on('update', handler);
// Later...
signals.off('update', handler);
```

### signals.removeAll(event)

Removes all listeners for a specific signal.

- **event** (string): The signal name

```js
signals.removeAll('playerDied');
```

### signals.reset()

Removes all listeners from all signals, resetting the system to its initial state.

```js
// Call when starting a new game
signals.reset();
```

## Creating Custom Signal Instances

For more complex scenarios, you can create isolated Signals instances:

```js
// Create a new signals instance
var mySignals = signals.create();

// Same methods like on the global object
mySignals.on('customEvent', () => {
    console.log('Custom event received!');
});

mySignals.emit('customEvent');
```

This is useful for:
- Creating per-copy or per-room event systems;
- Managing events for specific, isolated game systems;
- Avoiding namespace conflicts.
