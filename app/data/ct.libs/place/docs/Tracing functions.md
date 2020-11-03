# Tracing functions

Unlike other collision checking methods, tracing functions don't require a particular copy to check for collisions. Tracing can tell you whether there are any copies in a particular area, point, circle, or some path.

With these, you can set up additional triggers around copies or some level's portions, and create smarter movement logic.

## `ct.place.traceLine(line, [cgroup], [getAll])`

Tests for intersections with a line segment.

The `line` parameter should be an object with properties `x1`, `y1`, `x2`, `y2`.

If `getAll` is set to `true`, returns all the copies that intersect the line segment. Copies get sorted by their distance to the starting point, with the closest coming first.

If `getAll` is not set or is `false`, the method returns the first copy that was found during collision checks.

### Example: Wipe every enemy in a 1024px-long path around the copy

```js
const copies = ct.place.traceLine({
    x1: this.x - 512,
    y1: this.y,
    x2: this.x + 512,
    y2: this.y
}, 'Enemies', true);
for (const enemy of copies) {
    enemy.kill = true;
}
```

## `ct.place.traceRect(rect, [cgroup], [getAll])`

Tests for intersections with a filled rectangle.

A rectangle is an object with either `x1, `y1`, `x2`, `y2` properties, or `x`, `y`, `width`, `height` properties.

If `getAll` is set to `true`, returns all the copies that intersect
the rectangle; otherwise, returns the first one that fits the conditions.

## `ct.place.traceCircle(circle, [cgroup], [getAll])`

Tests for intersections with a filled circle.

`circle` is an object with `x`, `y`, and `radius` properties.

If `getAll` is set to `true`, returns all the copies that intersect the circle; otherwise, returns the first one that fits the conditions.

### Example: Find a tile under the cursor in a big circle

```js
var tile = ct.place.traceCircle({
    x: ct.mouse.x,
    y: ct.mouse.y,
    radius: 128
}, 'Tiles');
```

## `ct.place.tracePolyline(polyline, [cgroup], [getAll])`

Tests for intersections with a polyline. It is a hollow shape made of connected line segments. The shape is not closed unless you add the closing point by yourself.

`polyline` must be an array of objects. Each object should have `x` and `y` properties.

If `getAll` is set to `true`, returns all the copies that intersect the polyline; otherwise, returns the first one that fits the conditions.

## `ct.place.tracePoint(point, [cgroup], [getAll])`

Tests for intersections with a point.

`point` is any object with `x` and `y` properties.

If `getAll` is set to `true`, returns all the copies that intersect the point; otherwise, returns the first one that fits the conditions.

## `ct.place.trace(x1, y1, x2, y2, [ctype])`

> `ct.place.trace` is **deprecated** since v1.4.3. Use `ct.place.traceLine` instead.

Throws a ray from point (x1, y1) to (x2, y2), returning all the copies that touched the ray.
The first copy in the returned array is the closest copy, the last one is the furthest. The order is not always exact, especially with overlapping shapes.

`ctype` is an optional collision group to trace against. If omitted, ct.place will trace through all the copies in the current room.