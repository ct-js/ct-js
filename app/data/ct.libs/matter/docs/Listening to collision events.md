# Listening to collision events

You can listen to collision events with `ct.matter.on(eventName, callback)`. The callback is passed an object that has `pairs` property, which has all the collisions that happened in one frame. Long story short, see this example:

```js
// Room's OnCreate code
// Listen for collisions in the world
ct.matter.on('collisionStart', e => {
    // Loop over every collision in a frame
    for (var pair of e.pairs) {
        // Get how strong the impact was
        // We will use it for damage calculation to aliens
        var impact = ct.matter.getImpact(pair);

        // Each pair has bodyA and bodyB — two objects that has collided.
        // This little loop applies checks for both bodies
        var bodies = [pair.bodyA, pair.bodyB];
        for (var body of bodies) {
            // Here, body.copy is the ct.js copy that owns this physical body.
            // Does a body belong to a copy of type "Alien"?
            if (body.copy.type === 'Alien') {
                // If the impact was too strong, destroy the alien.
                if (impact > 75) {
                    body.copy.kill = true;
                }
            }
        }
    }
});
```

> **Warning**: DO NOT write `ct.matter.on` inside copies' code. This will apply large amounts of listeners that do the same thing, which will degrade performance and break your gameplay logic. Instead, write `ct.matter.on` once in room's On Create code.

There are three collision events you can listen to:

* `collisionStart` — objects has struck each other, or an object entered a sensor's area.
* `collisionActive` — called on each frame for all the current collisions.
* `collisionEnd` — objects stopped colliding, or an object has left sensor's area.
