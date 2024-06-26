# Capture!

This module provides two methods to capture stuff in your game and let users save it as an image.

**Note:** this module doesn't work in the ct.js debugger at the moment.

### `capture.screen(name?: string)`

Captures the whole screen and prompts a user to save the image. `name` is optional and allows you to set a file's name. If it is not set, the file name will be `${yourGameName}_N.png`, with N being a counter starting from 1.

### `capture.portion(x: number, y: number, width: number, height: number, name?: string)`

Captures a portion of the screen and prompts a user to save the image. `name` is optional and allows you to set a file's name. If it is not set, the file name will be `${yourGameName}_N.png`, with N being a counter starting from 1.

### `capture.object(object: PIXI.DisplayObject, name?: string)`

Captures a given object. This object can be a copy, or some container (even the whole room). The size of the resulting image depends on camera's zoom level and the size of the captured object. The name is optional and if not set, defaults to `${yourGameName}_N.png`.