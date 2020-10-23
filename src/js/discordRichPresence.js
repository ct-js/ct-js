/* eslint-disable no-console */
(function discordRichPresence() {
    const appId = '749670101904785502';
    const startTimestamp = new Date();
    let available = false;
    let failed = false;
    let startScreen = true;

    const RPC = require('discord-rpc');
    const client = new RPC.Client({
        transport: 'ipc'
    });

    const limitRate = function limitRate(func, ms) {
        // The same may be done with ct.flow.gate + ct.flow.
        var timer;
        var delay = function (...args) {
            if (!timer) {
                timer = true;
                setTimeout(() => {
                    timer = false;
                }, ms);
                func(...args);
            }
        };
        return delay;
    };

    const notifyFailed = () => {
        if (!failed) {
            failed = true;
            setTimeout(() => {
                // eslint-disable-next-line no-underscore-dangle
                const {delay} = alertify._$$alertify;
                alertify.delay(1000 * 10);
                alertify.error('Running discord rich presence failed. If you are running discord, please tell us in the discord server.');
                alertify.delay(delay);
            }, 1500);
        }
    };

    const setActivity = limitRate(function setActivity(activity) {
        console.debug('Activity:');
        console.debug(activity);
        if (!available) {
            console.warn('Didn\'t change discord rich presence because it\'s not available yet.');
            return;
        }
        client
            .setActivity(activity)
            .then(() => console.debug('Successfully changed rich presence.'))
            .catch((...err) => {
                console.error(...err);
                notifyFailed();
            });
    }, 1000 * 2);

    const activityMap = {
        debug: 'Testing a game',
        project: 'Configuring a project',
        textures: 'Working with textures',
        ui: 'Editing fonts and styles',
        fx: 'Creating particle systems',
        sounds: 'Managing sounds',
        types: 'Coding types',
        rooms: 'Designing rooms'
    };

    const changeDiscordStatus = (tab) => {
        let details = window.currentProject ? window.currentProject.settings.authoring.title : null;
        let state = activityMap[tab];
        if (!state || startScreen) {
            state = 'Start screen';
            details = void 0;
        }
        const activity = {
            startTimestamp,
            details,
            state,
            largeImageKey: 'icon-lg',
            largeImageText: 'ct.js (https://ctjs.rocks/)',
            smallImageKey: `icon-small-${tab}`,
            smallImageText: state,
            instance: false
        };
        setActivity(activity);
    };

    window.signals.on('globalTabChanged', (tab) => {
        changeDiscordStatus(tab);
    });

    window.signals.on('projectLoaded', () => {
        startScreen = false;
        // eslint-disable-next-line no-underscore-dangle
        setTimeout(() => changeDiscordStatus(document.querySelector('main-menu')._tag.tab), 250);
    });


    // Make sure we're always updated
    setInterval(() => {
        if (!startScreen) {
            // eslint-disable-next-line no-underscore-dangle
            changeDiscordStatus(document.querySelector('main-menu')._tag.tab);
        } else {
            changeDiscordStatus();
        }
    }, 1000 * 5);

    window.signals.on('resetAll', () => {
        startScreen = true;
        changeDiscordStatus();
    });

    client
        .login({
            clientId: appId
        })
        .catch((...err) => {
            console.error(...err);
            notifyFailed();
        });
    client.on('ready', () => {
        available = true;
        console.debug('Ready to use discord rich presence!');
        setActivity({
            startTimestamp,
            details: 'Just launched',
            largeImageKey: 'icon-lg',
            largeImageText: 'ct.js (https://ctjs.rocks/)',
            instance: false
        });
    });
})();
