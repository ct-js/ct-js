# transition

This module allows making transitions between rooms, camera frames, and whenever you want. Transitions are made in a separate UI layer that will overlap everything in your room.

This module needs `tween` enabled. It is installed in ct.js by default.

Each transition consists of two parts: the one that hides your room (e.g. `transition.fadeOut`) and the other that reveals new content (`transition.fadeIn`).

## Examples

### A circled transition between rooms, triggered by a button

Write this code in OnStep of your button (assuming that the room you are switching to is called `InGame`):

```js
if (mouse.pressed) {
    if (mouse.hovers(this)) {
        transition.circleOut()
        .then(() => {
            rooms.switch('InGame');
        });
    }
}
```

Then, in the `InGame` room, add this line to its OnCreate code:

```js
transition.circleIn();
```

Voila!

### A faded transition with camera teleportation

This will be useful while making cutscenes, or when moving your character between distant areas in your level.

```js
var targetX = 1024,
    targetY = 1024;
transition.fadeOut()
.then(() => {
    // The screen is now fully black. Time to move the camera!
    camera.teleportTo(targetX, targetY)
})
.then(() => camera.fadeIn())
.then(() => {
    // Transition is complete! We can start our cutscene here,
    // for example.
});
```

> **Note:** Here we wrote both `fadeOut` and `fadeIn` in on promise chain. This is handy; it allows us to write all the transition code in one place. Still, we need to split it if we switch to another room at the center of a transition (see above, or below).

### Colored, asymmetric transition

This is the same example as the first one, but with two different types of transitions combined!

The OnStep code of a button:

```js
if (mouse.pressed) {
    if (mouse.hovers(this)) {
        transition.fadeOut(1000, 0xffd300) // Yellow color fade, 1s to fade out
        .then(() => {
            rooms.switch('InGame');
        });
    }
}
```

Then, in the `InGame` room:

```js
transition.circleIn(500, 0xffd300); // Yellow color, 0.5s to fade in, transitions in a circular shape
```
