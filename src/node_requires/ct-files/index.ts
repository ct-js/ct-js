/* eslint-disable camelcase */
import { available_name, available_name_suffix, is_available_name } from "./available";
import { preflight } from "./preflight";
import { move, safeName } from "./move";
import { load_semantic } from "./load_semantic";
import { filename, make_path, PathType } from "./make_path";
import { upgrade_semantic } from "./upgrade_semantic";

const ctFiles = {
    load_semantic,
    make_path,
    filename,
    safeName,
    move,
    upgrade_semantic,
    available_name,
    available_name_suffix,
    is_available_name,
    preflight
};

export type ProjectPathType = PathType;

export default ctFiles;
