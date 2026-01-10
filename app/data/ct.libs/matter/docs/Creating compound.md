# Creating a compound body

## `matter.createCompound(arrCopies)`

Creates a composite body from array of copies, returns the compound body.
Make sure you have correctly positioned all of the parts before creating the composite object.
A composite object is not a copy but a matter.js body.
```js
// parts
var blue = templates.copy('Blue');
var green = templates.copy('Green', 64, 0);
var pink = templates.copy('Pink', 32, 64);
// create compound
this.compound = matter.createCompound([blue, green, pink])
// manipulate the compound body
Matter.Body.setPosition(this.compound, { x: 300, y: 100 });
```

An example of applying random force to all bodies.
```js
templates.each(t => {
    this.force = (Math.random() * 2 - 1)*0.1;
    if(t.matterBody){
        let body = t.matterBody;
        Matter.Body.applyForce(
            body, // matterBody
            {x: body.position.x, y: body.position.y}, // from
            {x: this.force, y: this.force} // vector force
        )
    }
    if(t.compound){
        let body = t.compound;
        Matter.Body.applyForce(
            body, // matterBody
            {x: body.position.x, y: body.position.y}, //from
            {x: this.force, y: this.force} // vector force
        )
    }
})
```

Example code for creating a сonstraint between two objects.
```js
if (this.constraint) Matter.World.remove(rooms.current.matterWorld, this.constraint)
this.constraint = Matter.Constraint.create({
    bodyA: t.compound,       // first body 
    bodyB: this.mouse.matterBody,       // second body
    pointA: { x: 0, y: 0 }, // a point inside body A (relative to its coordinates)
    pointB: { x: 0, y: 0 }, // a point inside body B
    length: 0,
    stiffness: 0.05
});
Matter.World.add(rooms.current.matterWorld, this.constraint);
```

## `matter.killCompound(compound)`

Destroy compound and marks all its copies to kill.
