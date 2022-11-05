# General use of `ct.gamedistribution`
An easy way to display `Game Distribution` Ads. 

## Catmods settings -> Game Distribution

* GameID
* Auto init
* Localization of the Ads
* Enable GDPR
* Enable Debug, note you can enable debug in console just write `gdsdk.openConsole()` then the GD debug bar will appear, and it will keep showing until you delete the localStorage in your game.

How do you use `ct.gamedistribution`?

For newcomers, you will probably start with the following:

You can setup all in your `UI` so only using built-in events can be done, in case you want all the methods are capable of run in `code`.

The easiest way is to use the `Events` in the left panel. 

* To use it you need to init the `Game Distribution SDK`.

* You can do this from `Catmods settings -> Game Distribution` and check `Auto init Game Distribution SDK`.

* If you prefer to initialize `Game Distribution SDK` manually you can add this code into a `custom script`.

### Init the Game Distribution SDK

!important: Make sure this runs only `one time`.

```js
ct.gamedistribution.init();
```

### Show an Ad manually

* Add a new `Texture` like a button or wherever you want.

* Create a new `Template` and add the previous `Texture` to that template.

* Install or enable `ct.pointer` and add `On click` event to your button template.

Inside the onclick event add this code:

```js
if (ct.gamedistribution.adPlaying) {
  ct.gamedistribution.showBanner();
}
```

* Now go to your `UI` room and add an event of `Ads` `Check if an Ads finished`

* Inside the code and according to your game logic you can add something like this:

```js
ct.room.coins +=1;
```
- This way you reward the player with 1 coin after the Ad is finish.

# =
# ![Gif result](./data/ct.libs/gamedistribution/check-if-ad-finished.gif)

# ![Source strip](./data/ct.libs/gamedistribution//check-if-ad-finished.jpg)

## Available methods

`ct.gamedistribution.init();`
Initialize the Game distribution SDK, manually.

`ct.gamedistribution.gdsdkReady()`
Check if Game distribution SDK, is ready to show Ads.

`ct.gamedistribution.pauseGame()`
Used to pause the game.

`ct.gamedistribution.resumeGame()`
Used to resume the game.

`ct.gamedistribution.ShowBanner();`
Is available when GD SDK is ready, so you can call this method in a button click of wherever you want but `make sure is called one time` 

`ct.gamedistribution.isAdFinished();`
This method is the same as the event that you can add into the events editor in the room, according to the image we seen above.

## Available Events built-in to use in the left panel
* [Event][Type][thisOnStep] =  the "frame start" code for the currently edited entity (template/room)
---
- [Event][Type][thisOnStep] GDSDK is Ready
- [Event][Type][thisOnStep] Ad is finished
- [Event][Type][thisOnStep] Pause game
- [Event][Type][thisOnStep] Resume game
- [Event][Type][thisOnStep] Show Ad

## Available Variables 

* var isFinished: boolean; `Used to check if an Ad is completed.` 
* var isPaused: boolean; `Used to check if the game is paused or running.`
* var sdkReady: boolean; `Use to check if the Game Distribution SDK is ready to display Ads.`
* var adPlaying: boolean; `Used to check if an Ad is showing.`

About these variables they are included in the default code of Game Distribution but not implemented into this `Catmod`

There is an option to enable a `GDPR` message to the user but there is no management of that data collected.

* var sdkError: boolean; `Pending: No use right now.`
* var sdkGdprTracking: boolean; `Pending: No use right now.`
* var sdkGdprTargeting: boolean; `Pending: No use right now.`
* var sdkGdprThirdParty: boolean; `Pending: No use right now.`

### Game Distribution SDK

Check if the `Game Distribution SDK` is ready to display Ads.
```js
if (ct.gamedistribution.sdkReady) {
        //Usually you don't need to use this method but in case you want.
        //Do something here...
}
```

### Ad finished, completed.

In case you don't want to use the built-in `event` to check if the Ad finished, you can use `ct.gamedistribution.isFinished` in `OnStep` like:
```js
if(ct.gamedistribution.isFinished){
    //Reward the player here
    this.coins +=1;
    ct.gamedistribution.isFinished = false;
    ct.gamedistribution.isPaused = false;
}
```
### Pause the game. Please make sure you mute the music and sounds otherwise Game Distribution is going to reject your game.

In some case you maybe want to pause the game manually do:
```js
if(ct.gamedistribution.isPaused == false){
        if (ct.gamedistribution.adPlaying == true) {
            ct.gamedistribution.isPaused = true;
            //Do something here...
        }
    }
```

### Resume the game after the Ad is completed. Remember to enable music and sounds.

I case you need to manually resume the game do:
```js
if(ct.gamedistribution.isPaused == true){
  if (ct.gamedistribution.adPlaying == false) {
    ct.gamedistribution.isPaused = false;
    //Do something
  }
}
```

### Show an Ad manually
Make sure this runs `one time` maybe with a `button click` or any event that triggers `only once`.
```js
if (ct.gamedistribution.adPlaying == false) {
  ct.gamedistribution.showBanner();
}
```


A mini tutorial is available here: https://www.youtube.com/watch?v=CO7kU1vkwXg and thats it...

Enjoy making money with Ads.

By Ulises Freitas.
