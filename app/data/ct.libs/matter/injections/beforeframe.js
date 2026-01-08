if (physicsConfig.physicLoop == 'runner')  {

        physicsConfig.renderCountPerSecond++;
        // Отношение времени, прошедшего с последнего обновления физики, к времени между двумя обновлениями
        let currentRenderTime = performance.now();
        physicsConfig.alphaInterpRender = (currentRenderTime - physicsConfig.lastPhysicsUpdateTime) / physicsConfig.physicsTickInterval; 
        if (physicsConfig.alphaInterpRender > 1) physicsConfig.alphaInterpRender = 1; // альфа должна быть 0 > альфа < 1
        if (physicsConfig.alphaInterpRender < 0) physicsConfig.alphaInterpRender = 0; // 
}