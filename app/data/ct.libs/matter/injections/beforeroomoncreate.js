if (this === ct.room) {
    ct.room.matterEngine = Matter.Engine.create();
    ct.room.matterWorld = ct.room.matterEngine.world;
    ct.room.matterGravity = ct.room.matterGravity || [
        [
            /*%matterGravity%*/
        ][0][0],
        [
            /*%matterGravity%*/
        ][0][1],
    ];
    [ct.room.matterWorld.gravity.x, ct.room.matterWorld.gravity.y] =
        ct.room.matterGravity;
    ct.matter.rulebookStart = [];
    ct.matter.rulebookActive = [];
    ct.matter.rulebookEnd = [];
}
