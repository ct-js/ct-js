import * as PIXI from 'pixi.js';

import {RoomEditor} from '..';
import {IRoomEditorRiotTag} from '../IRoomEditorRiotTag';

export enum EPixiListeners {
    pointertap,
    pointerup,
    pointerupoutside,
    pointerdown,
    pointermove,
    pointerover,
    pointerout,
    pointerleave,
    globalpointermove,
    wheel
}
export type PixiListener = keyof typeof EPixiListeners;
export const pixiListeners: PixiListener[] =
    Object.keys(EPixiListeners) as PixiListener[];

// Custom events below
export enum ECustomListeners {
    home,
    delete,
    copy,
    paste,
    undo,
    redo,
    nudgeright,
    nudgeleft,
    nudgeup,
    nudgedown,
    tab
}
export type CustomListener = keyof typeof ECustomListeners;
export const customListeners: CustomListener[] =
    Object.keys(ECustomListeners) as CustomListener[];

export type InteractionListener<affixedInterface> = (
    this: RoomEditor,
    e: PIXI.FederatedEvent | KeyboardEvent | unknown,
    roomTag: IRoomEditorRiotTag,
    affixedData: affixedInterface,
    finishCallback: () => void
) => void;
export interface IRoomEditorInteraction<affixedInterface> {
    ifListener: PixiListener | CustomListener;
    /**
     * Checks if it is possible to run an interaction now.
     * If this method returns true, all the further interactions will be skipped
     * until the startingAction calls the provided finishCallback
     */
    if: (
        this: RoomEditor,
        e: PIXI.FederatedEvent | KeyboardEvent | unknown,
        roomTag: IRoomEditorRiotTag
    ) => boolean;
    listeners: Partial<
        Record<PixiListener | CustomListener, InteractionListener<affixedInterface>>
    >;
}

import {updateMousePosition} from './mousePosTracker';
import {selectHover} from './selectHover';
import {clearHover} from './clearHover';
import {moveCameraOnWheelPress} from './camera/move';
import {goHome} from './camera/home';
import {zoomInteraction} from './camera/zoom';
import {placeCopy} from './copies/placeCopy';
import {deleteCopies} from './copies/deleteCopies';
import {deleteHover as copiesDeleteHover} from './copies/deleteHover';
import {placeTile} from './tiles/placeTile';
import {deleteTiles} from './tiles/deleteTiles';
import {deleteHover as tilesDeleteHover} from './tiles/deleteHover';
import {select} from './transformer/select';
import {nudgeLeft, nudgeRight, nudgeUp, nudgeDown} from './transformer/nudge';
import {rotateSelection} from './transformer/rotate';
import {moveSelection} from './transformer/move';
import {scaleSelection} from './transformer/scale';
import {deleteSelected} from './transformer/delete';
import {copy, paste} from './transformer/copyPaste';
import {undo, redo} from './history';
import {tab} from './tab';
import {uiSelectHover} from './uiSelectHover';
import {selectUi} from './selectUi';

export const interactions = [
    // Ambient interactions — these never block the queue
    updateMousePosition,
    clearHover,
    selectHover,
    copiesDeleteHover,
    tilesDeleteHover,
    uiSelectHover,

    nudgeLeft,
    nudgeRight,
    nudgeUp,
    nudgeDown,

    copy,
    paste,
    undo,
    redo,

    moveCameraOnWheelPress,

    rotateSelection,
    moveSelection,
    scaleSelection,
    deleteSelected,
    select,

    selectUi,

    deleteCopies,
    placeCopy,

    deleteTiles,
    placeTile,

    zoomInteraction,
    goHome,

    tab
];
