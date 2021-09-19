# Manipulating copies.

`ct.matter` requires you to use specific methods to move and transform your copies. Usual parameter-based manipulations won't work.

## `ct.matter.teleport(copy, x, y);`

Moves a copy to a new position without changing its velocity.

| Argument | Type     | Description                 |
| -------- | -------- | --------------------------- |
| `copy`   | `Copy`   | The ct.js copy to teleport. |
| `x`      | `number` | The new X coordinate.       |
| `y`      | `number` | The new Y coordinate.       |

## `ct.matter.push(copy, forceX, forceY, fromX, fromY);`

Applies a force onto a copy. The resulting velocity depends on object's mass and friction.
You can optionally define a point from which the force is applied to make the copy spin.

| Argument           | Type     | Description                                             |
| ------------------ | -------- | ------------------------------------------------------- |
| `copy`             | `Copy`   | The copy that should be pushed.                         |
| `forceX`           | `number` | The force applied along the horizontal axis.            |
| `forceY`           | `number` | The force applied along the vertical axis.              |
| `fromX` (optional) | `number` | An optional X coordinate from which to apply the force. |
| `fromY` (optional) | `number` | An optional Y coordinate from which to apply the force. |

## `ct.matter.spin(copy, speed);`

Sets copy's angular velocity.

| Argument | Type     | Description                      |
| -------- | -------- | -------------------------------- |
| `copy`   | `Copy`   | The copy that should be spinned. |
| `speed`  | `number` | New angular velocity             |

## `ct.matter.rotate(copy, angle);`

Rotates copy to the defined angle.

| Argument | Type     | Description                      |
| -------- | -------- | -------------------------------- |
| `copy`   | `Copy`   | The copy that should be rotated. |
| `angle`  | `number` | New angle.                       |

## `ct.matter.rotateBy(copy, angle);`

Rotates copy by the defined angle.

| Argument | Type     | Description                      |
| -------- | -------- | -------------------------------- |
| `copy`   | `Copy`   | The copy that should be rotated. |
| `angle`  | `number` | How much to turn the copy.       |

## `ct.matter.scale(copy, x, y);`

Scales the copy and its physical object.

| Argument | Type     | Description                          |
| -------- | -------- | ------------------------------------ |
| `copy`   | `Copy`   | The copy that should be scaled       |
| `x`      | `number` | New scale value, by horizontal axis. |
| `y`      | `number` | New scale value, by vertical axis.   |

## `ct.matter.launch(copy, hspeed, vspeed);`

Sets the copy's velocity, instantly and magically.

| Argument | Type     | Description                             |
| -------- | -------- | --------------------------------------- |
| `copy`   | `Copy`   | The copy which speed should be changed. |
| `hspeed` | `number` | New horizontal speed.                   |
| `vspeed` | `number` | New vertical speed.                     |
