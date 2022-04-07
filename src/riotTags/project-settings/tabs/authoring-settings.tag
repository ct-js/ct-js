authoring-settings
    h1 {voc.heading}
    b {voc.title}
    br
    input(type="text" value="{authoring.title}" onchange="{changeTitle}")
    br
    b {voc.author}
    br
    input(type="text" value="{authoring.author}" onchange="{wire('this.authoring.author')}")
    br
    b {voc.site}
    br
    input(type="text" value="{authoring.site}" onchange="{wire('this.authoring.site')}")
    br
    b {voc.version}
    br
    input(type="number" style="width: 1.5rem;" value="{authoring.version[0]}" length="3" min="0" onchange="{wire('this.authoring.version.0')}")
    |  .
    input(type="number" style="width: 1.5rem;" value="{authoring.version[1]}" length="3" min="0" onchange="{wire('this.authoring.version.1')}")
    |  .
    input(type="number" style="width: 1.5rem;" value="{authoring.version[2]}" length="3" min="0" onchange="{wire('this.authoring.version.2')}")
    .inlineblock
        |   {voc.versionPostfix}
        input(type="text" style="width: 3rem;" value="{authoring.versionPostfix}" length="5" onchange="{wire('this.authoring.versionPostfix')}")
    br
    b {voc.appId}
    hover-hint(text="{voc.appIdExplanation}")
    br
    input(type="text" value="{authoring.appId}" onchange="{wire('this.authoring.appId')}")
    script.
        this.namespace = 'settings.authoring';
        this.mixin(window.riotVoc);
        this.mixin(window.riotWired);
        this.currentProject = global.currentProject;
        this.authoring = this.currentProject.settings.authoring;

        this.changeTitle = e => {
            this.authoring.title = e.target.value.trim();
            if (this.authoring.title) {
                document.title = this.authoring.title + ' — ct.js';
            }
        };
