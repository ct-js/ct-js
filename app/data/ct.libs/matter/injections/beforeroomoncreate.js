if (this === rooms.current) {
    // Create engine and world, set gravity
    rooms.current.matterEngine = Matter.Engine.create();
    rooms.current.matterWorld = rooms.current.matterEngine.world;
    rooms.current.matterGravity = rooms.current.matterGravity || [0, 9.8];
    // OLD, в новой доке гравитация задается через Engine хотя оба способа работают
    [
        rooms.current.matterWorld.gravity.x,
        rooms.current.matterWorld.gravity.y
    ] = rooms.current.matterGravity;

    // Listeners/Rules for collision events
    matter.rulebookStart = [];
    matter.rulebookActive = [];
    matter.rulebookEnd = [];

    if ([/*%physicLoop%*/][0]) {
        // Physics update loop type
        const physicLoop = [/*%physicLoop%*/][0];
        switch (physicLoop) {
        case 1: physicsConfig.physicLoop = 'frameTime'; break;
        case 2: physicsConfig.physicLoop = 'targetFps'; break;
        case 3: physicsConfig.physicLoop = 'runner'; break;
        default: physicsConfig.physicLoop = 'runner'; break;
        }
    } else {
        physicsConfig.physicLoop = 'runner';
    }
    // Interpolation type
    if ([/*%isInterpolation%*/][0]) {
        physicsConfig.isInterpolation = [/*%isInterpolation%*/][0];
        if ([/*%interpolateType%*/][0]) {
            switch ([/*%interpolateType%*/][0]) {
            case 1: physicsConfig.InterpolateType = 'velocity'; break;
            case 2: physicsConfig.InterpolateType = 'acceleration'; break;
            case 3: physicsConfig.InterpolateType = 'linier'; break;
            default: physicsConfig.InterpolateType = 'velocity'; break;
            }
        } else {
            physicsConfig.InterpolateType = 'velocity';
        }
    }
    // Logging
    if ([/*%runnerTickRateLog%*/][0]) {
        physicsConfig.runnerTickRateLog = [/*%runnerTickRateLog%*/][0];
        //console.log('json physicLoop [/*%physicLoop%*/]', [/*%physicLoop%*/][0])
        //console.log('json interpolateType [/*%interpolateType%*/]', [/*%interpolateType%*/][0])
        console.log('physicLoop: ', physicsConfig.physicLoop);
        console.log('isInterpolation: ', physicsConfig.isInterpolation);
        if (physicsConfig.isInterpolation) {
            console.log('InterpolateType: ', physicsConfig.InterpolateType);
        }
    }


    if (physicsConfig.physicLoop === 'runner') {
        // Set the tickrate
        if ([/*%runnerTickRate%*/][0]) {
            physicsConfig.runnerTickRate = [/*%runnerTickRate%*/][0];
        } else {
            physicsConfig.runnerTickRate = 60;
        }
        physicsConfig.physicsTickInterval = 1000 / physicsConfig.runnerTickRate;

        // Methods for retaining previous and current states of bodies for interpolation
        function saveBodyState(body) {
            if (body.currentStates) {
                body.previousStates = {
                    ...body.currentStates
                };
            }
            body.currentStates = {
                id: body.id,
                position: {
                    ...body.position
                },
                angle: body.angle,
                velocity: {
                    ...body.velocity
                }
            };
        }
        function saveStatesBoides() {
            rooms.current.matterWorld.bodies.forEach(body => {
                // If the body is compound...
                if (body.parts) {
                    body.parts.forEach(p => {
                        saveBodyState(p);
                    });
                } else {
                    saveBodyState(body);
                }
            });
        }

        // Create a custom runner
        rooms.current.matterRunner = Matter.Runner.create({
            delta: 1000 / physicsConfig.runnerTickRate
        });

        // Custom update loop
        physicsConfig.runnerUpdateInterval = setInterval(function () {
            // Bail out if the game or the physics is paused
            if (physicsConfig.runnerPause) {
                return;
            }
            if (!pixiApp.ticker.started) {
                return;
            }
            Matter.Runner.tick(rooms.current.matterRunner, rooms.current.matterEngine, 1000 / physicsConfig.runnerTickRate);
            physicsConfig.lastPhysicsUpdateTime = performance.now();
            saveStatesBoides();
            physicsConfig.matterTickPerSecond++;
            //console.log('matter tick')
        }, 1000 / physicsConfig.runnerTickRate);

        // Log the tick rate every second
        if (physicsConfig.runnerTickRateLog) {
            physicsConfig.runnerTickRateLogInterval = setInterval(function () {
                if (!pixiApp.ticker.started) {
                    return;
                } // Пауза
                console.log('matterTickPerSecond', physicsConfig.matterTickPerSecond);
                physicsConfig.matterTickPerSecond = 0;
                console.log('renderCountPerSecond', physicsConfig.renderCountPerSecond);
                physicsConfig.renderCountPerSecond = 0;
            }, 1000);
        }
    }
}
