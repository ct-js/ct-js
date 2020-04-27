var overlayPos = $('#UI-Overlay').position();
var ctPos = $('#ct>canvas').position();
var unitSizeX = (ct.width / ct.room.width);
var unitSizeY = (ct.height / ct.room.height);
if (overlayPos.left !== ctPos.left || overlayPos.top !== ctPos.top) {
    $('#UI-Overlay').css({
        top: ctPos.top,
        right: ctPos.left
    });
    if (ct.htmlUi.overlay.length) {
        for (const uiElement of ct.htmlUi.overlay) {
            $(uiElement.element).css({
                top: uiElement.options.y * unitSizeY,
                left: uiElement.options.x * unitSizeX
            });
            uiElement.element.attr('style', `
                    background-color: rgba(0,0,0,0);
                    height: ${uiElement.options.height * unitSizeY}px !important;
                    width: ${uiElement.options.width * unitSizeX}px !important;
                    top: ${uiElement.options.y * unitSizeY}px;
                    left: ${uiElement.options.x * unitSizeX}px;
                    ${uiElement.options.font ? `
                    font: ${uiElement.options.font.fontWeight} ${uiElement.options.font.fontSize * unitSizeY}px/${uiElement.options.font.lineHeight * unitSizeY}px ${uiElement.options.font.fontFamily};
                    color: ${uiElement.options.font.fill};
                    text-shadow: ${Math.round(uiElement.options.font.dropShadowDistance * Math.cos(uiElement.options.font.dropShadowAngle * (180 / Math.PI)))}px ${Math.round(uiElement.options.font.dropShadowDistance * Math.sin(uiElement.options.font.dropShadowAngle * (180 / Math.PI)))}px ${uiElement.options.font.dropShadowDistance}px ${uiElement.options.font.dropShadowColor};
                    ` : ''}
                `);
        }
    }
}
for (var [i, uiElement] of ct.htmlUi.overlay.entries()) {
    if (uiElement.kill) {
        $(uiElement.element).remove();
        ct.htmlUi.overlay.splice(i, 1);
        console.log(ct.htmlUi.overlay);
    }
}
