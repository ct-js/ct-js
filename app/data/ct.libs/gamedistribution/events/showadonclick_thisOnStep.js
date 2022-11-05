{
    if(ct.pointer){
        const other = ct.templates.list[[/*%%template%%*/]][0];
        if (ct.templates.valid(other)) {
            if (ct.gamedistribution.adPlaying == false) {
                if (ct.pointer.collides(other, undefined, true)) {
                    ct.gamedistribution.showBanner();
                }
            }
        }
    }
}
