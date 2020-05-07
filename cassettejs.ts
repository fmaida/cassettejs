/// <reference path="./lib/riffwave.ts" />
/// <reference path="./parameters.ts" />
/// <reference path="./common/databuffer.ts" />
/// <reference path="./msx/msxblock.ts" />
/// <reference path="./msx/msx.ts" />
/// <reference path="./converters/wavexporter.ts" />
/// <reference path="./module.d.ts" />
/// <reference path="./player.ts" />

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
    private export:WAVExporter;
    private list:DataBlock[];
    //private buffer:Buffer;

    /* Events */
    public  on_load = undefined;
    public  on_block_analysis = undefined;
    public  on_job_completed = undefined;
    public  on_error = undefined;
    public  on_audio_export = undefined;

    private player:Player;
    //private wave;
    private data;

    /** 
     * Class constructor
     */
    constructor()
    {
        this.list = [];
        this.initialize();
    }

    // -=-=---------------------------------------------------------------=-=-

    initialize()
    {
        this.name = "";

        this.parameters = new MSXTapeParameters();
        this.msx = new MSX();
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
                self.list = self.msx.load(buffer, self.on_block_analysis);
                if (self.list.length > 0) {
                    self.player = new Player(self.list, self.on_job_completed);
                    self.player.on_audio_export = self.on_audio_export;
                    /*let audio_file = self.msx.export_as_wav();
                    self.audio.src = audio_file.dataURI; // set audio source
                    if (typeof self.on_job_completed !== "undefined") {
                        self.on_job_completed(self.msx);
                    }*/
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

    load_from_remote_file(p_url, response)
    {
        let self = this;

        if (typeof self.on_load !== "undefined") {
            // @ts-ignore
            self.on_load(response.byteLength);
        }


        self.name = p_url
            .toLowerCase()
            .replace(".cas", "");

        // @ts-ignore
        //let buffer:Uint8Array = new Uint8Array(response.arrayBuffer());

        // @ts-ignore
        this.list = self.msx.load(response, self.on_block_analysis);
        if (this.list.length > 0) {
            this.player = new Player(this.list, this.on_job_completed);
            this.player.on_audio_export = this.on_audio_export;
            return true;
        } else {
            if (typeof this.on_error !== "undefined") {
                this.on_error();
            }
            return false;
        }

    }
        // @ts-ignore
        /*if (typeof jQuery !== "undefined") {
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
    } */

    // -=-=---------------------------------------------------------------=-=-

    load_from_buffer(p_buffer:Array<number>):boolean
    {
        let result:boolean = false;


        this.list = this.msx.load(p_buffer, this.on_block_analysis);
        if (this.list.length > 0) {
            this.player = new Player(this.list, this.on_job_completed);
            this.player.on_audio_export = this.on_audio_export;
            result = true;
        }

        return result;
    }

    // -=-=---------------------------------------------------------------=-=-

    get_block(p_index)
    {
        return this.list[p_index];
    }

    // -=-=---------------------------------------------------------------=-=-

    get_length()
    {
        return this.list.length;
    }

}


if (typeof module !== "undefined") {
    module.exports = CassetteJS;
}