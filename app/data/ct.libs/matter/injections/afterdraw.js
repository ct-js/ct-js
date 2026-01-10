
if (physicsConfig.physicLoop == 'frameTime'|| physicsConfig.physicLoop == 'targetFps'){
    if (this.matterEnable && !this.matterStatic) {
        //this.rotation = this.matterBody.angle;
        //this.position.set(this.matterBody.position.x, this.matterBody.position.y);
        this.position.x = this.matterBody.position.x;
        this.position.y = this.matterBody.position.y;
        if(this.compound) this.rotation = this.compound.angle;
        else this.rotation = this.matterBody.angle;
        this.hspeed = this.matterBody.velocity.x;
        this.vspeed = this.matterBody.velocity.y;
    }
}
