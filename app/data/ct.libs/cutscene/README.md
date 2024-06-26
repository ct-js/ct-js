# cutscene

A module for showing cutscenes from youtube/vimeo or a direct link to a video.

## `cutscene.show(url)`

Shows the cutscene and returns a reference to it.

It can be a link to youtube or vimeo or a direct link to a video. These values are valid:

* `https://youtu.be/xxxxxxxxxx`
* `https://www.youtube.com/watch?v=xxxxxxxxxx`
* `https://www.youtube.com/embed/xxxxxxxxxx`
* `https://vimeo.com/xxxxxxxxxx`
* `https://player.vimeo.com/video/xxxxxxxxxx`
* `https://awesomegames.rock/trailers/catmintide.mp4`
* `myVideo.mp4` (If you put it inside your `project/include` folder. There is a link in ct.js' upper-left menu for this folder.)

No extra settings or parameters for Vimeo or YouTube are needed, cutscene will try to remove most of the visible controls from the video. **Note:** Vimeo videos will always have controls unless you have a premium account. Vimeo videos will also fail to load in the integrated debugger; please test it in your default browser.

### Specifying additional formats for local videos

Not every video format works in every browser. For example, `mp4` does not work inside ct.IDE. To make sure that your video plays on most devices, put different video formats at the `inludes` folder and use a map of formats that link to each video format:

```js
this.cutscene = cutscene.show({
    mp4: 'TestVideo.mp4',
    webm: 'TestVideo.webm'
});
this.cutscene.then(() => {
    // This line is required to unload the video from memory
    this.cutscene = void 0;
    console.log('Cutscene has just ended!');
});
```

Each format corresponds to a MIME type: `mp4` becomes `video/mp4`.
At least `mp4` and `webm` formats are needed.

## `cutscene.remove(cutscene)`

Use this to manually remove the player. If the video ends, it will be removed automatically, but you probably want to provide controls to a player, e.g. Escape button to skip the cutscene.

```js
// Say, this is placed in a room's On Create event
this.cutscene = cutscene.show('https://www.youtube.com/watch?v=F8VzZe1FqEM');
this.cutscene.then(() => {
    // This line is required to unload the video from memory
    this.cutscene = void 0;
}).catch(error => {
    console.error(error);
});

// In its Step event
if (actions.Exit.pressed && this.cutscene) {
    cutscene.remove(this.cutscene);
}
```
