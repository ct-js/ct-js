// было
// if (this === rooms.current) {
//     if ([/*%matterUseStaticDeltaTime%*/][0] === false) {
//         Matter.Engine.update(rooms.current.matterEngine, u.time);
//     } else {
//         Matter.Engine.update(rooms.current.matterEngine, settings.maxFPS);
//     }
// }



// стало
if (this === rooms.current) {
    if (physicsConfig.physicLoop == 'frameTime') {
        Matter.Engine.update(rooms.current.matterEngine, u.time * 1000);
    } 
    if (physicsConfig.physicLoop == 'targetFps')  {
        Matter.Engine.update(rooms.current.matterEngine, 1000/settings.targetFps);
    }
}