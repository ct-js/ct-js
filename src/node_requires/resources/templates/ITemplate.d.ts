type PixiBlendMode = 'normal' | 'add' | 'multiply' | 'screen';

interface ITemplate extends IScriptable {
    depth: number,
    texture: assetRef,
    visible: boolean,
    blendMode?: PixiBlendMode,
    playAnimationOnStart: boolean,
    loopAnimation: boolean,
    animationFPS: number,
    shape?: any,
    extends: {
        [key: string]: unknown
    }
}
