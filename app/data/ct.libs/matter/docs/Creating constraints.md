# Creating physical constraints

This module has a couple of methods that simplify the creation of constraints between two copies, or a copy and a position in space. These constraints create a spring, or a rope, that limits a copy's movement.

## `ct.matter.pin(copy)`

Pins a copy in place, making it spin around its center of mass but preventing any other movement.

## `ct.matter.tie(copy, position, stiffness = 0.05, damping = 0.05)`

Ties a copy to a specific position in space, making it swing around it.

## `ct.matter.rope(copy, length, stiffness = 0.05, damping = 0.05)`

Puts a copy on a rope. It is similar to `ct.matter.tie`, but the length of a rope is defined explicitly, and starts from the copy's current position.

## `ct.matter.tieTogether(copy1, copy2, stiffness, damping)`

Ties two copies together with a rope.