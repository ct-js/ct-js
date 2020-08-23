update-bar
    span v{ctjsVersion} |
    |
    |
    span(if="{fetchingInfo}") {voc.fetchingUpdateInfo}
    span(if="{newVersion}" href="https://comigo.itch.io/ct#download" onclick="{openExternal}")
        |
        | { newVersion }
        img(src="data/img/partycarrot.gif" if="{newVersion}").aPartyCarrot
        button(onclick="{runUpdater}" if="{updaterResolution.decision}")
            span {voc.withInstaller}
        span(if="{!updaterResolution.decision && reason === 'itch'}") {voc.withItch}
        span(if="{!updaterResolution.decision && reason === 'readonly'}") {voc.manuallyReadonly}
    span(if="{actualVersion}") {voc.youHaveLatestVersion}
    script.
        this.namespace = 'updates';
        this.mixin(window.riotVoc);
        this.fetchingInfo = true;
        this.ctjsVersion = process.versions.ctjs;
        this.updaterResolution = {
            decision: false
        };
        // Checking for updates
        setTimeout(() => {
            const {isWin, isLinux} = require('./data/node_requires/platformUtils.js');
            let channel = 'osx64';
            if (isWin) {
                channel = 'win64';
            } else if (isLinux) {
                channel = 'linux64';
            }
            fetch(`https://itch.io/api/1/x/wharf/latest?target=comigo/ct&channel_name=${channel}`)
            .then(response => response.json())
            .then(json => {
                if (!json.errors) {
                    if (this.ctjsVersion !== json.latest) {
                        this.newVersion = this.voc.versionAvailable.replace('$1', json.latest);
                        const {updaterNeeded} = require('./data/node_requires/updaterUtils');
                        updaterNeeded().then(resolution => {
                            this.updaterResolution = resolution;
                            this.update();
                        });
                    } else {
                        this.actualVersion = true;
                    }
                    this.fetchingInfo = false;
                    this.update();
                } else {
                    console.error('Update check failed:');
                    console.error(json.errors);
                }
            });
        }, 0);
        this.runUpdater = async () => {
            const {updaterExists, runUpdater} = require('./data/node_requires/updaterUtils');
            if (await updaterExists()) {
                await runUpdater();
                nw.App.quit();
            } else {
                alertify.error('You do not have the installer downloaded! Click here to go to the download page', () => nw.Shell.openExternal('https://ctjs.rocks/download/'));
            }
        };
