if (this === rooms.current) {
    if (physicsConfig.physicLoop == 'frameTime') {
        Matter.Engine.update(rooms.current.matterEngine, u.time * 1000);
    } 
    if (physicsConfig.physicLoop == 'targetFps')  {
        Matter.Engine.update(rooms.current.matterEngine, 1000/settings.targetFps);
    }
}
