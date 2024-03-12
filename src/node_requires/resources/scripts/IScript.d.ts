interface IScript extends IAsset {
    name: string;
    code: string;
    language: typeof IProject['language'];
    runAutomatically: boolean;
}
