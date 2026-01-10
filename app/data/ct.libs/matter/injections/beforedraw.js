
if (physicsConfig.physicLoop === 'runner') {
    if (this.matterEnable && !this.matterStatic) {
        if (physicsConfig.isInterpolation) {
            if (!this.matterBody.previousStates) {
                return;
            } // No previous state to interpolate from? Bail out.
            // Determine the interpolation type
            if (physicsConfig.InterpolateType === 'velocity') {
                if (this.compound) {
                    this.interpRotation = this.compound.previousStates.angle;
                    // Determine the offset of the current object relative to the center of the compound
                    this.interpOffset = {
                        x: this.matterBody.previousStates.position.x - this.compound.previousStates.position.x,
                        y: this.matterBody.previousStates.position.y - this.compound.previousStates.position.y
                    };
                    // Determine the previous and current physics state for the center of the compound object
                    var prevState = this.compound.previousStates;
                    var currState = this.compound.currentStates;
                    // Interpolation considering velocity
                    const interpPositionX = prevState.position.x + prevState.velocity.x * physicsConfig.alphaInterpRender;
                    const interpPositionY = prevState.position.y + prevState.velocity.y * physicsConfig.alphaInterpRender;
                    // Position for the current part
                    this.position.x = interpPositionX + this.interpOffset.x;
                    this.position.y = interpPositionY + this.interpOffset.y;
                    this.rotation = physicsConfig.interpolateAngle(prevState.angle, currState.angle, physicsConfig.alphaInterpRender);
                } else {
                    // Determine the previous and current physics state
                    var prevState = this.matterBody.previousStates;
                    var currState = this.matterBody.currentStates;
                    // Interpolation considering velocity
                    const interpPositionX = prevState.position.x + prevState.velocity.x * physicsConfig.alphaInterpRender;
                    const interpPositionY = prevState.position.y + prevState.velocity.y * physicsConfig.alphaInterpRender;
                    // Set position for the copy
                    this.position.x = interpPositionX;
                    this.position.y = interpPositionY;
                    this.rotation = physicsConfig.interpolateAngle(prevState.angle, currState.angle, physicsConfig.alphaInterpRender);
                }
            }
            if (physicsConfig.InterpolateType === 'acceleration') {
                // If the object is compound
                if (this.compound) {
                    this.interpRotation = this.compound.previousStates.angle;
                    // Determine the offset of the current object relative to the center of the compound
                    this.interpOffset = {
                        x: this.matterBody.previousStates.position.x - this.compound.previousStates.position.x,
                        y: this.matterBody.previousStates.position.y - this.compound.previousStates.position.y
                    };
                    // Determine the previous and current physics state for the center of the compound object
                    var prevState = this.compound.previousStates;
                    var currState = this.compound.currentStates;
                    // Calculate acceleration
                    const deltaVx = currState.velocity.x - prevState.velocity.x;
                    const deltaVy = currState.velocity.y - prevState.velocity.y;
                    const accelerationX = deltaVx / physicsConfig.physicsTickInterval;
                    const accelerationY = deltaVy / physicsConfig.physicsTickInterval;
                    // Interpolation considering acceleration
                    const interpPositionX = prevState.position.x + prevState.velocity.x * physicsConfig.alphaInterpRender + 0.5 * accelerationX * physicsConfig.alphaInterpRender * physicsConfig.alphaInterpRender;
                    const interpPositionY = prevState.position.y + prevState.velocity.y * physicsConfig.alphaInterpRender + 0.5 * accelerationY * physicsConfig.alphaInterpRender * physicsConfig.alphaInterpRender;
                    // Position for the current part
                    this.position.x = interpPositionX + this.interpOffset.x;
                    this.position.y = interpPositionY + this.interpOffset.y;
                    this.rotation = physicsConfig.interpolateAngle(prevState.angle, currState.angle, physicsConfig.alphaInterpRender);
                } else {
                    // Determine the previous and current physics state
                    var prevState = this.matterBody.previousStates;
                    var currState = this.matterBody.currentStates;
                    // Calculate acceleration
                    const deltaVx = currState.velocity.x - prevState.velocity.x;
                    const deltaVy = currState.velocity.y - prevState.velocity.y;
                    const accelerationX = deltaVx / physicsConfig.physicsTickInterval;
                    const accelerationY = deltaVy / physicsConfig.physicsTickInterval;
                    // Interpolation considering acceleration
                    const interpPositionX = prevState.position.x + prevState.velocity.x * physicsConfig.alphaInterpRender + 0.5 * accelerationX * physicsConfig.alphaInterpRender * physicsConfig.alphaInterpRender;
                    const interpPositionY = prevState.position.y + prevState.velocity.y * physicsConfig.alphaInterpRender + 0.5 * accelerationY * physicsConfig.alphaInterpRender * physicsConfig.alphaInterpRender;
                    // Set position for the copy
                    this.position.x = interpPositionX;
                    this.position.y = interpPositionY;
                    this.rotation = physicsConfig.interpolateAngle(prevState.angle, currState.angle, physicsConfig.alphaInterpRender);
                }
            }
            if (physicsConfig.InterpolateType === 'linier') {
                if (this.compound) {
                    this.interpRotation = this.compound.previousStates.angle;
                    // Determine the offset of the current object relative to the center of the compound
                    this.interpOffset = {
                        x: this.matterBody.previousStates.position.x - this.compound.previousStates.position.x,
                        y: this.matterBody.previousStates.position.y - this.compound.previousStates.position.y
                    };
                    // Determine the previous and current physics state for the center of the compound object
                    var prevState = this.compound.previousStates;
                    var currState = this.compound.currentStates;
                    this.interpPosition = prevState.position;
                    // Calculate the step for interpolation
                    this.interpStepX = (currState.position.x - prevState.position.x) * physicsConfig.alphaInterpRender;
                    this.interpStepY = (currState.position.y - prevState.position.y) * physicsConfig.alphaInterpRender;
                    // Interpolate from the previous position
                    this.interpPosition.x += this.interpStepX;
                    this.interpPosition.y += this.interpStepY;
                    // Set position for the current part
                    this.position.x = this.interpPosition.x + this.interpOffset.x;
                    this.position.y = this.interpPosition.y + this.interpOffset.y;
                    this.rotation = physicsConfig.interpolateAngle(prevState.angle, currState.angle, physicsConfig.alphaInterpRender);
                } else {
                    // Determine the previous and current physics state
                    var prevState = this.matterBody.previousStates;
                    var currState = this.matterBody.currentStates;
                    this.interpPosition = prevState.position;
                    // Calculate the step for interpolation
                    this.interpStepX = (currState.position.x - prevState.position.x) * physicsConfig.alphaInterpRender;
                    this.interpStepY = (currState.position.y - prevState.position.y) * physicsConfig.alphaInterpRender;
                    // Interpolate from the previous position
                    this.interpPosition.x += this.interpStepX;
                    this.interpPosition.y += this.interpStepY;
                    // Set position for the copy
                    this.position.x = this.interpPosition.x;
                    this.position.y = this.interpPosition.y;
                    this.rotation = physicsConfig.interpolateAngle(prevState.angle, currState.angle, physicsConfig.alphaInterpRender);
                }
            }
        } else {
            this.position.x = this.matterBody.position.x;
            this.position.y = this.matterBody.position.y;
            if (this.compound) {
                this.rotation = this.compound.angle;
            } else {
                this.rotation = this.matterBody.angle;
            }
        }

        // Do not interpolate acceleration here
        this.hspeed = this.matterBody.velocity.x;
        this.vspeed = this.matterBody.velocity.y;
    }
}
