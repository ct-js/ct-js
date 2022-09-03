import {IRoomEditorInteraction} from '../..';

import {pdn, degToRad, radToDeg} from '../../../utils/trigo';

export const rotateSelection: IRoomEditorInteraction<void> = {
    ifListener: 'pointerdown',
    if(e) {
        if (this.riotEditor.currentTool !== 'select') {
            return false;
        }
        if (this.currentSelection.size === 0) {
            return false;
        }
        return e.target === this.transformer.handleRotate;
    },
    listeners: {
        pointermove(e) {
            const globalPivot = this.room.toGlobal(new PIXI.Point(
                this.transformer.transformPivotX,
                this.transformer.transformPivotY
            ));
            let rad = pdn(
                globalPivot.x,
                globalPivot.y,
                e.data.global.x,
                e.data.global.y
            );
            // When the group is mirrored horizontally,
            // the handle appears on the left side, not on the right side.
            if (this.transformer.applyScaleX < 0) {
                rad += Math.PI;
            }
            if (e.data.originalEvent.shiftKey) {
                // Snap at 15 degrees
                rad = degToRad(Math.round(radToDeg(rad) / 15) * 15);
            }
            this.transformer.applyRotation = rad;
            this.transformer.applyTransforms();
            this.riotEditor.refs.propertiesPanel.updatePropList();
        },
        pointerup(e, roomTag, affixedData, callback) {
            this.history.snapshotTransforms();
            callback();
        }
    }
};
