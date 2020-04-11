/// <reference path="./lib/riffwave.ts" />
/// <reference path="./parameters.ts" />
/// <reference path="./common/buffer.ts" />
/// <reference path="./msx/datablock.ts" />
/// <reference path="./msx/msx.ts" />
/// <reference path="./module.d.ts" />

/**
 *
 */
class CassetteJS {

    // -=-=---------------------------------------------------------------=-=-
    // GENERIC PARAMETERS
    // -=-=---------------------------------------------------------------=-=-
    public  name:string;
    private parameters:MSXTapeParameters;
    private msx:MSX;
    //private buffer:Buffer;

    /* Events */
    public  on_load = undefined;
    public  on_block_analysis = undefined;
    public  on_job_completed = undefined;
    public  on_error = undefined;
    public  on_audio_export = undefined;

    /* HTML5 Audio Element */
    private audio;
    //private wave;
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
    }


    // -=-=---------------------------------------------------------------=-=-

    load_from_local_file(p_file)
    {
        let request = new FileReader();
        let self = this;

        request.onloadend = function (e) {
            if (e.target.readyState == FileReader.DONE) {

                if (typeof self.on_load !== "undefined") {
                    // @ts-ignore
                    self.on_load(request.result.byteLength);
                }

                self.name = p_file.name
                    .toLowerCase()
                    .replace(".cas", "");

                // @ts-ignore
                let buffer:Uint8Array = new Uint8Array(request.result);

                // @ts-ignore
                if (self.msx.load(buffer, self.on_block_analysis)) {
                    let audio_file = self.msx.export_as_wav();
                    self.audio.src = audio_file.dataURI; // set audio source
                    if (typeof self.on_job_completed !== "undefined") {
                        self.on_job_completed(buffer.length);
                    }
                    return true;
                } else {
                    if (typeof self.on_error !== "undefined") {
                        self.on_error(buffer);
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

        // @ts-ignore
        if (typeof jQuery !== "undefined") {
            // @ts-ignore
            jQuery.get(p_url, function(buffer) {
                var buf = new ArrayBuffer(buffer.length*2); // 2 bytes for each char
                var bufView = new Uint8Array(buf);
                for (let i=0, strLen=buffer.length; i < strLen; i++) {
                    bufView[i] = buffer.charCodeAt(i);
                }
                // @ts-ignore
                if (self.load_from_buffer(bufView)) {
                    if (typeof self.on_job_completed !== "undefined") {
                        self.on_job_completed(buffer);
                    }
                }
            });
            return true;
        } else {
            return false;
        }
    }

    // -=-=---------------------------------------------------------------=-=-

    load_from_buffer(p_buffer:Array<number>)
    {
        let result:Boolean;

        this.msx = new MSX();
        result = this.msx.load(p_buffer, this.on_block_analysis);
        if (result) {
            let audio_file = this.msx.export_as_wav();
            this.audio.src = audio_file.dataURI; // set audio source
        }

        return result
    }

    // -=-=---------------------------------------------------------------=-=-

    /**
     * Play audio
     */
    play()
    {
        this.audio.play();
    }
    
    // -=-=---------------------------------------------------------------=-=-

    pause()
    {
        this.audio.pause();
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

    save_as_wav():boolean
    {
        let data = this.msx.export_as_wav().dataURI;

        if (typeof data !== "undefined") {
            if (typeof this.on_audio_export !== "undefined") {
                this.on_audio_export(data);
            } else {
                return false;
            }
        } else {
            if (typeof this.on_error !== "undefined") {
                this.on_error(null);
            }
            return false;
        }

        return true;
    }
}


if (typeof module !== "undefined") {
    module.exports = CassetteJS;
}
