/// <reference path="./blocktypes.ts" />
/// <reference path="./datablock.ts" />
/// <reference path="./wavexport.ts" />
/// <reference path="../common/databuffer.ts" />

/**
 * This class handles a MSX cassette in .CAS format
 */
class MSX {

    private buffer:DataBuffer;
    private list:DataBlock[];
    private export:WAVExport;


    constructor()
    {
        this.buffer = null;
    }

    // -=-=---------------------------------------------------------------=-=-

    private seek_single_block(p_inizio:number): DataBlock
    {
        let pos1:number;
        let pos2:number;
        let block:DataBlock = null;

        // Cerca la prima intestazione
        pos1 = this.buffer.cerca(BlockTypes.blocco_intestazione, p_inizio);
        if (pos1 >= 0) {
            pos1 += BlockTypes.blocco_intestazione.length;
            // Seek for the second header
            pos2 = this.buffer.cerca(BlockTypes.blocco_intestazione, pos1);
            if (pos2 < 0) {
                // No further headers? Then we'll consider everything left
                // on the buffer as a single whole block
                pos2 = this.buffer.length();
            }
            block = new DataBlock(this.buffer.splitta(pos1, pos2));
            block.set_data_begin(pos1);
            block.set_data_end(pos2);
        } else {
            // Non ha trovato nemmeno un blocco intestazione
        }

        return block;
    }

    // -=-=---------------------------------------------------------------=-=-

    /**
     * Estrae un blocco dal buffer
     *
     * depends on this.cerca_blocco
     */
    private extract_block(p_inizio):DataBlock
    {
        let block1:DataBlock;
        let block2:DataBlock;

        block1 = this.seek_single_block(p_inizio);
        if (block1 !== null) {
            // console.log(block1);
            if (!block1.is_custom()) {
                block2 = this.seek_single_block(block1.get_data_end());
                if(block2 !== null) {
                    // Merge the two blocks
                    block1.append_block(block2);
                }
            }
        }

        return block1;
    }

    // -=-=---------------------------------------------------------------=-=-
    /**
     * Continua a caricare il file in memoria
     */
    private cassette_scan()
    {
        let pos:number = 0;
        let block:DataBlock;
        let found:boolean = false;

        this.list = [];

        /* While there's a block to analyse */
        while(block !== null) {
            if (pos !== 0) {
                /* If this is not the first block analysed and converted,
                   we will put a long silence between the blocks on the audio
                   so it will be easier for your MSX to understand when a block
                   ends and a new one starts.
                 */
            }
            block = this.extract_block(pos);
            if(block !== null) {
                found = true;
                this.list.push(block);
                //this.genera_file(block);
                pos = block.get_data_end();
            }
        }

        return found
    }

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
    load(p_buffer:Array<number>, callback_function=undefined)
    {
        let result:boolean;

        //var oReq = new XMLHttpRequest();
        //oReq.open("GET", p_file, true);
        //oReq.responseType = "arraybuffer";

        /* I will need a reference to this class, when the execution
           will happen inside the onload event
         */

        /* Let' put the Downloaded file in a variabile */
        this.buffer = new DataBuffer(p_buffer);
        result = this.cassette_scan();

        if (result) {
            /* Export everything to an audio file */
            this.export_as_wav(callback_function);
        }

        return result;
    }

    // -=-=---------------------------------------------------------------=-=-

    export_as_wav(callback_function = undefined)
    {
        let i:number = 0;

        this.export = new WAVExport(this.list);
        this.export.add_silence(750);
        for (let block of this.list) {
            i += 1;
            if (typeof callback_function !== "undefined") {
                callback_function(i, this.list.length);
            }
            this.export.render_block(block);
            if (i < this.list.length) {
                this.export.add_long_silence();
            }
        }
        this.export.add_silence(1000);

        return this.export.export_as_wav();
    }

    // -=-=---------------------------------------------------------------=-=-

}