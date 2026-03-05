# General use of `ct.pointer`

How do you use `ct.pointer`?

For newcomers, you will probably start with the following:

* Use the Actions system to read global pointer input. For example, you can have an action `Jump` that is triggered by pointer's primary button, so your character can jump when you click with your mouse or press with your finger.
* To position objects under the cursor, use `pointer.x` and `pointer.y` for gameplay elements and `pointer.xui` and `pointer.yui` for UI elements.
* To get if a player is pressing your button, in its On Step event use the following code:
  ```js
  if (pointer.collides(this)) {
      // Do something! :D
      // The pointer is currently pressed
  }
  ```
  This code can also be expanded to account for hover and idle state:
  ```js
  if (pointer.collides(this)) {
      // Do something! :D
      // The pointer is currently down
  } else if (pointer.hovers(this)) {
    // The pointer hovers the current copy
  } else {
    // The pointer is outside the current copy
  }
  ```
* `pointer.collides` returns `true` continuously while the pointer's button is held down. If you want to do something once the button is released, use its expanded form that catches only released buttons:
  ```js
  // Second argument is a specific pointer to check against.
  // We pass undefined, meaning that we pass no pointer at all,
  // so it checks against all the pointers.
  // The third argument tells to check against released pointer events.
  if (pointer.collides(this, undefined, true)) {
      sound.spawn('UI_Blep');
  }
  ```

> ⚠️ **Note:** we do not recommend to use the `pointer` module for UI elements; instead, use the built-in Pointer events in templates and rooms as they work better for UI elements, accounting for all the possible parent transforms while not causing clicks for background stacked elements. Note that since v5.3.0, the Pointer events are available in room events as well, allowing you to track clicks in the whole viewport.
>
> The `pointer` module, however, can be used for more complex interactions, such as drag-and-drop or custom pointer-based controls like harvesting tons of crops in one swipe or slicing fruits in a Fruit Ninja-like game.
