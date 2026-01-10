if (physicsConfig.physicLoop == 'runner')  {

        physicsConfig.renderCountPerSecond++;
        // Calculate alpha for interpolation based on time since last physics update
        let currentRenderTime = performance.now();
        physicsConfig.alphaInterpRender = (currentRenderTime - physicsConfig.lastPhysicsUpdateTime) / physicsConfig.physicsTickInterval; 
        if (physicsConfig.alphaInterpRender > 1) physicsConfig.alphaInterpRender = 1; // clamp the alpha value
        if (physicsConfig.alphaInterpRender < 0) physicsConfig.alphaInterpRender = 0; // 
}
