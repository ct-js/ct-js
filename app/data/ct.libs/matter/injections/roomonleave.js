
// Cleanup on room leave
if(physicsConfig.runnerUpdateInterval) clearInterval(physicsConfig.runnerUpdateInterval);
if(physicsConfig.runnerTickRateLogInterval) clearInterval(physicsConfig.runnerTickRateLogInterval);

if(rooms.current.matterEngine){
    Matter.Composite.clear(rooms.current.matterEngine.world);
    Matter.World.clear(rooms.current.matterEngine.world, false);
    Matter.Engine.clear(rooms.current.matterEngine);
    if(rooms.current.matterRunner){
        Matter.Runner.stop(rooms.current.matterRunner);
        rooms.current.matterRunner = null;
    }
}
