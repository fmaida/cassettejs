/// <reference path="./blocktypes.ts" />
/// <reference path="./msxblock.ts" />
/// <reference path="../common/cassette.ts" />
/// <reference path="./msxbuffer.ts" />

/**
 * This class handles a MSX cassette in .CAS format
 */
class MSX extends Cassette {

    //private export:Msxwavexporter;


    // -=-=---------------------------------------------------------------=-=-

    /**
     * Load a file in memory (usually a virtual cassette in .cas format
     * or a ROM file) and split it in one or more datablocks. When
     * scanning is done, it will export each block to an audio file in
     * .wav format
     *
     * @param {Array<number>} p_buffer - File in stream format
     * @param {any} callback_function  - When done, it will try to call this
     *                                   function if defined
     * @returns {boolean}              - Will return true in case of success
     */
    load(p_buffer:Array<number>, callback_function:() => void = undefined): MSXBlock[]
    {
        let buffer:MSXBuffer;
        let list:MSXBlock[];

        //var oReq = new XMLHttpRequest();
        //oReq.open("GET", p_file, true);
        //oReq.responseType = "arraybuffer";

        /* I will need a reference to this class, when the execution
           will happen inside the onload event
         */

        /* Let' put the Downloaded file in a variabile */
        buffer = new MSXBuffer(p_buffer);
        list = this.analyse(buffer);

        if (list.length > 0) {
            /* Export everything to an audio file */
            this.export_as_wav(callback_function);
        }

        return list;
    }

    // -=-=---------------------------------------------------------------=-=-

    /**
     * Continua a caricare il file in memoria
     */
    protected analyse(buffer:MSXBuffer): MSXBlock[]
    {
        let pos:number = 0;
        let block:MSXBlock = undefined;
        let found:boolean = false;
        let list:MSXBlock[] = [];

        while(block !== null) {
            if (pos !== 0) {
                /* If this is not the first block analysed and converted,
                   we will put a long silence between the blocks on the audio
                   so it will be easier for your MSX to understand when a block
                   ends and a new one starts.
                 */
            }

            block = buffer.extract_block(pos);
            if (block !== null) {
                found = true;
                list.push(block);
                pos = block.get_data_end();
            }
        }

        return list
    }

    // -=-=---------------------------------------------------------------=-=-

    export_as_wav(callback_function: (n:number, count:number) => void = undefined)
    {

    }

}