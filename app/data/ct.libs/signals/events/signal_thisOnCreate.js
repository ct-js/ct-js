{
    const listener = (data) => {
        /*%%USER_CODE%%*/
    };
    if (/*%%once%%*/) {
        signals.once(/*%%signal%%*/, listener);
    } else {
        signals.on(/*%%signal%%*/, listener);
    }
    this.on('destroy', () => {
        signals.off(/*%%signal%%*/, listener);
    });
}
