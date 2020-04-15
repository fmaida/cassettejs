/// <reference path="../lib/riffwave.ts" />
/// <reference path="./msx/msxwavexporter.ts" />

class WAVExporter {

    private msx:MSXWAVExporter;
    private buffer;

    constructor()
    {
        this.msx = new MSXWAVExporter();
    }

    export(p_list)
    {
        this.buffer = this.msx.export_as_wav(p_list);
    }

}