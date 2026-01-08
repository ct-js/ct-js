
if (physicsConfig.physicLoop == 'runner')  {
    if (this.matterEnable && !this.matterStatic) { 
        if(physicsConfig.isInterpolation){
            if(!this.matterBody.previousStates) return; // Выходим если нет предидущего состояния
            // Определяем тип интерполяции
            if(physicsConfig.InterpolateType == 'velocity'){
                // Если обьект составной
                if(this.compound) { 
                    this.interpRotation = this.compound.previousStates.angle;
                    // Вычисляем смещение текущего обьекта относительно центра составного
                    this.interpOffset = {
                        x: this.matterBody.previousStates.position.x - this.compound.previousStates.position.x,
                        y: this.matterBody.previousStates.position.y - this.compound.previousStates.position.y
                    }
                    // Определяем предидущее и текущеее состояние физики для центра составного обьекта
                    var prevState = this.compound.previousStates;
                    var currState = this.compound.currentStates;
                    // Интерполяция с учетом скорости
                    let interpPositionX = prevState.position.x + prevState.velocity.x  * physicsConfig.alphaInterpRender;
                    let interpPositionY = prevState.position.y + prevState.velocity.y  * physicsConfig.alphaInterpRender;
                    // Позиция для текущей части 
                    this.position.x = interpPositionX + this.interpOffset.x;
                    this.position.y = interpPositionY + this.interpOffset.y;
                    this.rotation = physicsConfig.interpolateAngle(prevState.angle, currState.angle, physicsConfig.alphaInterpRender);
                }                   
                else {
                    // Определяем предидущее и текущеее состояние физики
                    var prevState = this.matterBody.previousStates;
                    var currState = this.matterBody.currentStates;
                    // Интерполяция с учетом скорости
                    let interpPositionX = prevState.position.x + prevState.velocity.x  * physicsConfig.alphaInterpRender;
                    let interpPositionY = prevState.position.y + prevState.velocity.y  * physicsConfig.alphaInterpRender;
                    // Задаем позицию для копии
                    this.position.x = interpPositionX;
                    this.position.y = interpPositionY;           
                    this.rotation = physicsConfig.interpolateAngle(prevState.angle, currState.angle, physicsConfig.alphaInterpRender);
                }
            }
            if(physicsConfig.InterpolateType == 'acceleration'){
                // Если обьект составной
                if(this.compound) { 
                    this.interpRotation = this.compound.previousStates.angle;
                    // Вычисляем смещение текущего обьекта относительно центра составного
                    this.interpOffset = {
                        x: this.matterBody.previousStates.position.x - this.compound.previousStates.position.x,
                        y: this.matterBody.previousStates.position.y - this.compound.previousStates.position.y
                    }
                    // Определяем предидущее и текущеее состояние физики для центра составного обьекта
                    var prevState = this.compound.previousStates;
                    var currState = this.compound.currentStates;
                    // Вычисляем ускорение
                    const deltaVx = currState.velocity.x - prevState.velocity.x;
                    const deltaVy = currState.velocity.y - prevState.velocity.y;
                    const accelerationX = deltaVx / physicsConfig.physicsTickInterval;
                    const accelerationY = deltaVy / physicsConfig.physicsTickInterval;
                    // Интерполяция с учетом ускорения
                    let interpPositionX = prevState.position.x + prevState.velocity.x  * physicsConfig.alphaInterpRender + 0.5 * accelerationX * physicsConfig.alphaInterpRender * physicsConfig.alphaInterpRender;
                    let interpPositionY = prevState.position.y + prevState.velocity.y  * physicsConfig.alphaInterpRender + 0.5 * accelerationY * physicsConfig.alphaInterpRender * physicsConfig.alphaInterpRender;
                    // Позиция для текущей части 
                    this.position.x = interpPositionX + this.interpOffset.x;
                    this.position.y = interpPositionY + this.interpOffset.y;
                    this.rotation = physicsConfig.interpolateAngle(prevState.angle, currState.angle, physicsConfig.alphaInterpRender);
                }                   
                else {
                    // Определяем предидущее и текущеее состояние физики
                    var prevState = this.matterBody.previousStates;
                    var currState = this.matterBody.currentStates;
                    // Вычисляем ускорение
                    const deltaVx = currState.velocity.x - prevState.velocity.x;
                    const deltaVy = currState.velocity.y - prevState.velocity.y;
                    const accelerationX = deltaVx / physicsConfig.physicsTickInterval;
                    const accelerationY = deltaVy / physicsConfig.physicsTickInterval;
                    // Интерполяция с учетом ускорения
                    let interpPositionX = prevState.position.x + prevState.velocity.x  * physicsConfig.alphaInterpRender + 0.5 * accelerationX * physicsConfig.alphaInterpRender * physicsConfig.alphaInterpRender;
                    let interpPositionY = prevState.position.y + prevState.velocity.y  * physicsConfig.alphaInterpRender + 0.5 * accelerationY * physicsConfig.alphaInterpRender * physicsConfig.alphaInterpRender;
                    // Задаем позицию для копии
                    this.position.x = interpPositionX;
                    this.position.y = interpPositionY;           
                    this.rotation = physicsConfig.interpolateAngle(prevState.angle, currState.angle, physicsConfig.alphaInterpRender);
                }
            }
            if(physicsConfig.InterpolateType == 'linier'){
                // Если обьект составной
                if(this.compound) { 
                    this.interpRotation = this.compound.previousStates.angle;
                    // Вычисляем смещение текущего обьекта относительно центра составного
                    this.interpOffset = {
                        x: this.matterBody.previousStates.position.x - this.compound.previousStates.position.x,
                        y: this.matterBody.previousStates.position.y - this.compound.previousStates.position.y
                    }
                    // Определяем предидущее и текущеее состояние физики для центра составного обьекта
                    var prevState = this.compound.previousStates;
                    var currState = this.compound.currentStates;
                    this.interpPosition = prevState.position; 
                    // Вычисляем шаг              
                    this.interpStepX = (currState.position.x-prevState.position.x)*physicsConfig.alphaInterpRender;
                    this.interpStepY = (currState.position.y-prevState.position.y)*physicsConfig.alphaInterpRender; 
                    // Интерполяция центра составного обьекта
                    this.interpPosition.x += this.interpStepX;   
                    this.interpPosition.y += this.interpStepY;
                    // Позиция для текущей части 
                    this.position.x = this.interpPosition.x + this.interpOffset.x;
                    this.position.y = this.interpPosition.y + this.interpOffset.y;
                    this.rotation = physicsConfig.interpolateAngle(prevState.angle, currState.angle, physicsConfig.alphaInterpRender);
                } 
                else {
                    // Определяем предидущее и текущеее состояние физики
                    var prevState = this.matterBody.previousStates;
                    var currState = this.matterBody.currentStates;
                    this.interpPosition = prevState.position; 
                    // Вычисляем шаг              
                    this.interpStepX = (currState.position.x-prevState.position.x)*physicsConfig.alphaInterpRender;
                    this.interpStepY = (currState.position.y-prevState.position.y)*physicsConfig.alphaInterpRender;  
                    // Интерполируем от предидущего физического состояния   
                    this.interpPosition.x += this.interpStepX;   
                    this.interpPosition.y += this.interpStepY;
                    // Задаем позицию для копии
                    this.position.x = this.interpPosition.x;
                    this.position.y = this.interpPosition.y;
                    this.rotation = physicsConfig.interpolateAngle(prevState.angle, currState.angle, physicsConfig.alphaInterpRender);
                }
            }

        } else {
            this.position.x = this.matterBody.position.x;
            this.position.y = this.matterBody.position.y;
            if(this.compound) this.rotation = this.compound.angle;
            else this.rotation = this.matterBody.angle;
        }

        // Ускорение не интерполируем
        this.hspeed = this.matterBody.velocity.x;
        this.vspeed = this.matterBody.velocity.y;
    }
}