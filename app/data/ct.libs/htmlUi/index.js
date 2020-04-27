ct.htmlUi = {
    overlay: [],
    addUIElement: function (element, options, events) {
        ct.htmlUi.overlay.push({
            element: element,
            options: options
        });
        var unitSizeX = (ct.width / ct.room.width);
        var unitSizeY = (ct.height / ct.room.height);
        element.attr('style', `
        background-color: rgba(0,0,0,0);
        height: ${options.height * unitSizeY}px !important;
        width: ${options.width * unitSizeX}px !important;
        top: ${options.y * unitSizeY}px;
        left: ${options.x * unitSizeX}px;
        ${options.font ? `
        font: ${options.font.fontWeight} ${options.font.fontSize * unitSizeY}px/${options.font.lineHeight * unitSizeY}px ${options.font.fontFamily};
        color: ${options.font.fill};
        text-shadow: ${Math.round(options.font.dropShadowDistance * Math.cos(options.font.dropShadowAngle * (180 / Math.PI)))}px ${Math.round(options.font.dropShadowDistance * Math.sin(options.font.dropShadowAngle * (180 / Math.PI)))}px ${options.font.dropShadowDistance}px ${options.font.dropShadowColor};
        ` : ''}
    `);
        if (options.events) {
            for (var event of options.events) {
                // eslint-disable-next-line no-loop-func
                element.on(event.event, (e) => {
                    e.stopPropagation();
                    event.callback(e);
                });
            }
        }
        element.on('mousedown', (e) => {
            e.stopPropagation();
        });
        element.on('keydown', (e) => {
            e.stopPropagation();
        });
        $('#UI-Overlay').append(element);
        return ct.htmlUi.overlay[ct.htmlUi.overlay.length - 1];
    }
};
