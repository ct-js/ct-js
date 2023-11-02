type PixiBlendMode = 'normal' | 'add' | 'multiply' | 'screen';

interface ITemplate extends IScriptableBehaviors {
    type: 'template',
    texture?: assetRef,
    textStyle?: assetRef,
    defaultText?: string,
    /** Skeleton reference must have priority over the texture's value. */
    skeleton?: assetRef,
    baseClass: 'AnimatedSprite' | 'Text' | 'NineSlicePlane',
    nineSliceSettings: {
        top: number,
        left: number,
        bottom: number,
        right: number
    };
    depth: number,
    visible: boolean,
    blendMode?: PixiBlendMode,
    playAnimationOnStart: boolean,
    loopAnimation: boolean,
    animationFPS: number,
    extends: {
        [key: string]: unknown
    }
}
