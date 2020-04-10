/// <reference path="./lib/riffwave.ts" />
/// <reference path="./parameters.ts" />
/// <reference path="./common/buffer.ts" />
/// <reference path="./msx/datablock.ts" />
/// <reference path="./msx/msx.ts" />
/// <reference path="./module.d.ts" />

/**
 *
 */
class MSXTape {

    // -=-=---------------------------------------------------------------=-=-
    // GENERIC PARAMETERS
    // -=-=---------------------------------------------------------------=-=-
    public  name:string;
    private parameters:MSXTapeParameters;
    private msx:MSX;
    //private buffer:Buffer;
    public  onload = null;
    public  onerror = null;
    /* HTML5 Audio Element */
    private audio;
    private wave;
    private data;

    /** 
     * Class constructor
     */
    constructor()
    {
       this.initialize();
    }

    // -=-=---------------------------------------------------------------=-=-

    initialize()
    {
        this.name = "";

        this.parameters = new MSXTapeParameters();
        this.msx = new MSX();

        this.audio = new Audio(); // create the HTML5 audio element
        this.wave = new RIFFWAVE(); // create an empty wave file
        this.data = []; // yes, it's an array

        this.wave.header.sampleRate = this.parameters.frequenza; // set sample rate to 44KHz
        this.wave.header.numChannels = 1; // one channels (mono)

        //DataBlock.parametri = this.parameters;
    }


    // -=-=---------------------------------------------------------------=-=-

    load_from_local_file(p_file)
    {
        let request = new FileReader();
        let self = this;

        request.onloadend = function (e) {
            if (e.target.readyState == FileReader.DONE) {
                self.name = p_file.name
                    .toLowerCase()
                    .replace(".cas", "");

                // @ts-ignore
                let buffer:Uint8Array = new Uint8Array(request.result);
                //buffer = new Uint8Array(buffer);

                if (self.msx.load(buffer)) {
                    if (typeof self.onload !== "undefined") {
                        self.onload(buffer);
                    }
                    return true;
                } else {
                    if (typeof self.onerror !== "undefined") {
                        self.onerror(buffer);
                    }
                    return false;
                }
            }
        };

        request.readAsArrayBuffer(p_file);
    }

    // -=-=---------------------------------------------------------------=-=-

    load_from_remote_file(p_url)
    {
        let self = this;

        if (typeof jQuery !== "undefined") {
            jQuery.get(p_url, function(buffer) {
                var buf = new ArrayBuffer(buffer.length*2); // 2 bytes for each char
                var bufView = new Uint8Array(buf);
                for (var i=0, strLen=buffer.length; i < strLen; i++) {
                    bufView[i] = buffer.charCodeAt(i);
                }
                // @ts-ignore
                if (self.load_from_buffer(bufView)) {
                    if (typeof self.onload !== "undefined") {
                        self.onload(buffer);
                    }
                }
            });
            return true;
        } else {
            return false;
        }
    }

    // -=-=---------------------------------------------------------------=-=-

    load_from_buffer(p_buffer:Uint8Array)
    {
        let result:Boolean;

        this.msx = new MSX();
        result = this.msx.load(p_buffer);
        if (result) {
            let audio_file = this.msx.export_as_wav();
            // VECCHIO CODICE
            //this.wave.Make(this.data);
            // make the wave file
            //this.audio.src = this.wave.dataURI; // set audio source
            this.audio.src = audio_file.dataURI; // set audio source

        }

        return result
    }

    /**
     * Play audio
     */
    play()
    {
        this.audio.play();
    }
    
    // -=-=---------------------------------------------------------------=-=-

    /**
     * Stop playing a file
     */
    stop()
    {
        this.audio.pause();
        this.audio.currentTime = 0;
    }

    // -=-=---------------------------------------------------------------=-=-

    export()
    {
        if (typeof this.wave.dataURI !== "undefined") {
            return export_as_file(this);
        } else {
            if (typeof this.onerror !== "undefined") {
                this.onerror(null);
            }
        }
    }
}

if (typeof module !== "undefined") {
    module.exports = MSXTape;
}
