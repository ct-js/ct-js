{
    let i = 0;
    while (i < tween.tweens.length) {
        const twoon = tween.tweens[i];
        if (twoon.obj && twoon.obj.kill) {
            twoon.reject({
                code: 2,
                info: 'Copy is killed'
            });
            tween.tweens.splice(i, 1);
            continue;
        }
        let a = twoon.timer.time * 1000 / twoon.duration;
        if (a > 1) {
            a = 1;
        }
        if (twoon.obj) {
            for (const field in twoon.fields) {
                const s = twoon.starting[field],
                      d = twoon.fields[field] - twoon.starting[field];
                twoon.obj[field] = twoon.curve(s, d, a);
            }
        } else {
            twoon.onTick(twoon.curve(twoon.from, twoon.to - twoon.from, a));
        }
        if (a === 1) {
            twoon.resolve(twoon.fields);
            tween.tweens.splice(i, 1);
            continue;
        }
        i++;
    }
}
