//
    @attribute sound (ISound)
    @atribute onclose (() => void)

sound-recorder.aDimmer.fadein
    .aModal.pad.appear
        .toright
            button.square.inline(onclick="{opts.onclose}" title="{vocGlob.close}")
                svg.feather
                    use(xlink:href="#x")
        h2.nmt {voc.recorderHeading}
        p
        p(if="{state === 'error'}") {voc.cannotRecordSound}
        p(if="{state === 'error' && isWin}") {voc.troubleshootingWindows}
        canvas(ref="previewWaveform" width="500" height="100" show="{state === 'ready' || state === 'recording'}").wide
        .center(if="{state === 'ready'}")
            button.round.square.huge(title="{voc.record}" onclick="{startRecording}")
                svg.feather
                    use(xlink:href="#mic")
        .center(if="{state === 'recording'}")
            button.round.square.huge(title="{voc.stopRecording}" onclick="{stopRecording}")
                svg.feather
                    use(xlink:href="#square")
        .center(if="{state === 'editing'}")
            audio.wide(
                ref="audio" controls loop
                src="{previewAudioUrl}"
            )
            p
            button.round.square.huge(title="{voc.discardRecording}" onclick="{discardRecording}")
                svg.feather
                    use(xlink:href="#x")
            button.round.square.huge(title="{voc.finishRecording}" onclick="{finishRecording}")
                svg.feather
                    use(xlink:href="#check")
        .center(if="{state === 'loading'}")
            svg.feather.rotate(if="{state === 'loading'}")
                use(xlink:href="#loader")
    script.
        this.namespace = 'soundRecorder';
        this.mixin(require('src/node_requires/riotMixins/voc').default);

        var previewWaveform, animationFrame;

        this.state = 'ready';
        this.stream = null;
        this.isWin = require('src/node_requires/platformUtils').isWin;

        const themeManager = require('src/node_requires/themes');

        var audioCtx;
        const visualize = stream => {
            const swatches = themeManager.getSwatches();
            if (!audioCtx) {
                audioCtx = new AudioContext();
            }
            const source = audioCtx.createMediaStreamSource(stream);
            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 1024;
            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            source.connect(analyser);
            const drawWaveform = () => {
                animationFrame = requestAnimationFrame(drawWaveform);
                if (this.state !== 'recording' && this.state !== 'ready') {
                    return;
                }
                var c = previewWaveform;
                const w = c.width;
                const h = c.height;
                analyser.getByteTimeDomainData(dataArray);
                c.x.clearRect(0, 0, w, h);
                c.x.fillStyle = swatches.act;
                const pipeWidth = 12;
                for (let x = 0; x < w; x += pipeWidth * 1.5) {
                    const l = dataArray.length;
                    const v = Math.abs(dataArray[Math.floor(x / w * l)] - 128) / 128 * h + 12;
                    window.canvasRoundRect(
                        c.x,
                        x, (h - v) / 2,
                        pipeWidth, v, Math.min(6, v / 2), true, false
                    );
                }
            };
            animationFrame = requestAnimationFrame(drawWaveform);
        };
        // Set up audio recorder
        this.on('mount', () => {
            ({previewWaveform} = this.refs);
            previewWaveform.x = previewWaveform.getContext('2d');
            const constraints = {
                audio: true
            };
            const onSuccess = (stream) => {
                visualize(stream);
                this.stream = stream;
            };
            const onError = (err) => {
                console.error('The following error occured: ' + err);
                this.state = 'error';
                this.update();
            };
            navigator.mediaDevices.getUserMedia(constraints).then(onSuccess, onError);
        });
        this.on('unmount', () => {
            this.stream = null;
            window.cancelAnimationFrame(animationFrame);
            if (this.state === 'recording') {
                this.stopRecording();
            }
        });

        var mp3Recorder;
        const Microm = require('@tscole/mic-recorder-to-mp3');
        this.on('unmount', () => {
            if (mp3Recorder) {
                mp3Recorder.stop();
                mp3Recorder = null;
            }
        });
        this.startRecording = async () => {
            mp3Recorder = new Microm({
                bitRate: 128,
                audio: true
            });
            try {
                await mp3Recorder.start();
                this.state = 'recording';
            } catch (ohNo) {
                console.error(ohNo);
                this.state = 'error';
            }
            this.update();
        };
        this.stopRecording = async () => {
            this.state = 'loading';
            this.update();
            await mp3Recorder.stop();
            const [, blob] = await mp3Recorder.getMp3();
            this.previewBlob = blob;
            this.previewAudioUrl = URL.createObjectURL(blob);
            this.state = 'editing';
            this.update();
        };
        this.discardRecording = () => {
            this.state = 'ready';
        };
        this.finishRecording = async () => {
            this.state = 'loading';
            this.update();
            const sounds = require('src/node_requires/resources/sounds');
            const path = require('path'),
                  fs = require('/src/node_requires/neutralino-fs-extra');
            const temp = await require('src/node_requires/platformUtils').getTempDir();
            const ab = await this.previewBlob.arrayBuffer();
            await fs.writeFile(path.join(temp.dir, 'recording.mp3'), Buffer.from(ab));
            await sounds.addSoundFile(this.opts.sound, path.join(temp.dir, 'recording.mp3'));
            temp.remove();
            this.state = 'ready';
            this.opts.onclose();
        };
