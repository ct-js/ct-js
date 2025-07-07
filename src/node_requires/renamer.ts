import ctFiles from "./ct-files/index";
import { soundbox } from "./3rdparty/soundbox";

function checkAvailableName(newName: string, type: string, uid: string, vocGlob: Record<string, string>) {
    const result = newName && newName.trim() && ctFiles.is_available_name(currentProject, newName.trim(), type, uid);
    if (!result && !document.getElementById('nameTaken')) {
        soundbox.play('Failure');
        const usedNameAlert = document.createElement('div');
        usedNameAlert.className = 'anErrorNotice';
        usedNameAlert.id = 'nameTaken';
        usedNameAlert.innerText = vocGlob.nameTaken;
        const renamerInput = document.getElementById("renamer");
        const top = ((renamerInput?.parentElement?.parentElement as HTMLElement).getBoundingClientRect() || { top: 0 }).top;
        const bottom = ((renamerInput as HTMLElement).getBoundingClientRect() || { bottom: 80 }).bottom;
        usedNameAlert.style.position = 'absolute';
        usedNameAlert.style.top = (bottom - top) + "px";
        (renamerInput?.parentElement as HTMLElement).appendChild(usedNameAlert);
        (renamerInput as HTMLElement).style.borderColor = 'red';
        const remover = () => {
            (renamerInput as HTMLElement).style.borderColor = '';
            (renamerInput?.parentElement as HTMLElement).removeChild(usedNameAlert);
            renamerInput?.removeEventListener('input', remover);
        };
        renamerInput?.addEventListener('input', remover);
    }
    return result;
}

async function renamer(defaultValue: string, type: string, uid: string | null, vocGlob: Record<string, string>, makeUnique?: boolean) {
    const checkAvailableNameProxy = (newName: string) => {
        return checkAvailableName(newName, type, uid || '', vocGlob);
    };
    const internal = alertify.internal();
    internal.dialogs.input = '<input id=\'renamer\' type=\'text\'>';
    const reply = await alertify
        .defaultValue(defaultValue + (makeUnique ? ctFiles.available_name_suffix(currentProject, defaultValue, type, uid || '') : ''))
        .prompt(vocGlob.newName, checkAvailableNameProxy);
    internal.dialogs.input = internal.defaultDialogs.input;
    return reply;
}

module.exports = renamer;
