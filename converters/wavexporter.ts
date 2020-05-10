/// <reference path="../lib/riffwave.ts" />
/// <reference path="./msx/msxwavexporter.ts" />

class WAVExporter {

    private msx:MSXWAVExporter;
    private wav;

    constructor()
    {
        this.msx = new MSXWAVExporter();
    }

    render(p_list)
    {
        this.wav = this.msx.render_as_wav(p_list);
    }

    export()
    {
        return this.wav.dataURI;
    }

}