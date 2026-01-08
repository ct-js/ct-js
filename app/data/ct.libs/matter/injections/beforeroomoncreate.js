if (this === rooms.current) {
    // Создаем мир движок и гравитацию
    rooms.current.matterEngine = Matter.Engine.create();
    rooms.current.matterWorld = rooms.current.matterEngine.world;
    rooms.current.matterGravity = rooms.current.matterGravity || [0, 9.8];   
    // OLD, в новой доке гравитация задается через Engine хотя оба способа работают
    [
        rooms.current.matterWorld.gravity.x,
        rooms.current.matterWorld.gravity.y
    ] = rooms.current.matterGravity;
    
    // Вроде это массивы для слушателей событий
    matter.rulebookStart = [];
    matter.rulebookActive = [];
    matter.rulebookEnd = [];

    // Подтягиваем пропсы из json
    if ([/*%physicLoop%*/][0])  {
        // Как используем движок
        let physicLoop = [/*%physicLoop%*/][0];
        switch (physicLoop){
            case 1: physicsConfig.physicLoop = 'frameTime'; break;
            case 2: physicsConfig.physicLoop = 'targetFps'; break;
            case 3: physicsConfig.physicLoop = 'runner'; break;
            default: physicsConfig.physicLoop = 'runner'; break;
        }
    } else {
        physicsConfig.physicLoop = 'runner';
    }
    // Тип интерполяции
    if([/*%isInterpolation%*/][0]){
        physicsConfig.isInterpolation = [/*%isInterpolation%*/][0];
        if([/*%interpolateType%*/][0]){
            switch ([/*%interpolateType%*/][0]){
                case 1: physicsConfig.InterpolateType = 'velocity'; break;
                case 2: physicsConfig.InterpolateType = 'acceleration'; break;
                case 3: physicsConfig.InterpolateType = 'linier'; break;
                default: physicsConfig.InterpolateType = 'velocity'; break;              
            }
        } else {
            physicsConfig.InterpolateType = 'velocity';
        }
    }
    // Логи
    if([/*%runnerTickRateLog%*/][0])
    {
        physicsConfig.runnerTickRateLog = [/*%runnerTickRateLog%*/][0];
        //console.log('json physicLoop [/*%physicLoop%*/]', [/*%physicLoop%*/][0])
        //console.log('json interpolateType [/*%interpolateType%*/]', [/*%interpolateType%*/][0])
        console.log('physicLoop: ', physicsConfig.physicLoop)
        console.log('isInterpolation: ', physicsConfig.isInterpolation)
        if(physicsConfig.isInterpolation) console.log('InterpolateType: ', physicsConfig.InterpolateType)        
    }



    if (physicsConfig.physicLoop == 'runner')  {
        // Задаем тикрейт
        if([/*%runnerTickRate%*/][0]) physicsConfig.runnerTickRate = [/*%runnerTickRate%*/][0];
        else physicsConfig.runnerTickRate = 60;
        physicsConfig.physicsTickInterval = 1000/physicsConfig.runnerTickRate;

        // Методы для сохранения состояния тел
        function saveBodyState(body){
            if(body.currentStates) body.previousStates = {...body.currentStates};
            body.currentStates = {
                id: body.id,
                position: {...body.position},
                angle: body.angle,
                velocity: {...body.velocity}
            }
        }
        function saveStatesBoides(){
            rooms.current.matterWorld.bodies.forEach(body => {
                // Если тело составное
                if(body.parts){
                    body.parts.forEach(p => {
                        saveBodyState(p);
                    })
                } else saveBodyState(body);
            })
        }

        // Создаем раннер 
        rooms.current.matterRunner = Matter.Runner.create({ delta: 1000/physicsConfig.runnerTickRate });

        // Создадаем кастомный апдейт для раннера
        physicsConfig.runnerUpdateInterval = setInterval(function() {
            if(physicsConfig.runnerPause) return;
            if(!pixiApp.ticker.started) return; // Пауза
            // Выполняем тик движка и сохроняем состояния
            Matter.Runner.tick(rooms.current.matterRunner, rooms.current.matterEngine, 1000/physicsConfig.runnerTickRate)
            physicsConfig.lastPhysicsUpdateTime = performance.now();
            saveStatesBoides();
            physicsConfig.matterTickPerSecond++;
            //console.log('matter tick')
        }, 1000/physicsConfig.runnerTickRate);

        // Логируем каждую секунду
        if(physicsConfig.runnerTickRateLog){
            physicsConfig.runnerTickRateLogInterval = setInterval(function() {   
                if(!pixiApp.ticker.started) return; // Пауза      
                console.log('matterTickPerSecond', physicsConfig.matterTickPerSecond)
                physicsConfig.matterTickPerSecond = 0;
                console.log('renderCountPerSecond', physicsConfig.renderCountPerSecond)
                physicsConfig.renderCountPerSecond = 0;          
            }, 1000);
        }
    }
}
