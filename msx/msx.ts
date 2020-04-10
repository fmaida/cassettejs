/// <reference path="./blocktypes.ts" />
/// <reference path="./datablock.ts" />
/// <reference path="./wavexport.ts" />
/// <reference path="../common/buffer.ts" />


class MSX {

    private buffer:Buffer;
    private list:DataBlock[];
    private export:WAVExport;


    constructor()
    {
        this.buffer = null;
    }

    // -=-=---------------------------------------------------------------=-=-

    cerca_blocco(p_inizio:number): DataBlock
    {
        let pos1:number;
        let pos2:number;
        let block:DataBlock = null;

        // Cerca la prima intestazione
        pos1 = this.buffer.cerca(BlockTypes.blocco_intestazione, p_inizio);
        if (pos1 >= 0) {
            pos1 += BlockTypes.blocco_intestazione.length;
            pos2 = this.buffer.cerca(BlockTypes.blocco_intestazione, pos1);
            if (pos2 < 0) {
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
     */
    estrai_blocco(p_inizio):DataBlock
    {
        let block1:DataBlock;
        let block2:DataBlock;

        block1 = this.cerca_blocco(p_inizio);
        if (block1 !== null) {
            // console.log(block1);
            if (!block1.is_custom()) {
                block2 = this.cerca_blocco(block1.get_data_end());
                // console.log(block2);
                if(block2 !== null) {
                    // Merge the two blocks
                    block1.append_block(block2);
                    // console.log(block1);
                    // console.log("-------------------------------");
                }
            }
        }

        return block1;
    }

    // -=-=---------------------------------------------------------------=-=-
    /**
     * Continua a caricare il file in memoria
     */
    private load_blocks()
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
                //this.add_silence(this.parameters.silenzio_lungo);
            }
            block = this.estrai_blocco(pos);
            if(block !== null) {
                found = true;
                this.list.push(block);
                //this.genera_file(block);
                pos = block.get_data_end();
            }
        }

        // QUESTA PARTE E' DA SPOSTARE FUORI DALLA CLASSE CASSETTE.TS
        /* if (found) {
            this.wave.Make(this.data);
            // make the wave file
            this.audio.src = this.wave.dataURI; // set audio source
        } */

        return found
    }

    // -=-=---------------------------------------------------------------=-=-

    /**
     * Load a file in memory and converts it to a wav file
     * @param p_buffer {Uint8Array} - The file that must be loaded
     */
    load(p_buffer:Uint8Array)
    {
        let result:boolean;

        //var oReq = new XMLHttpRequest();
        //oReq.open("GET", p_file, true);
        //oReq.responseType = "arraybuffer";

        /* I will need a reference to this class, when the execution
           will happen inside the onload event
         */

        /* Let' put the Downloaded file in a variabile */
        this.buffer = new Buffer(p_buffer);
         //console.log(self.buffer);
        result = this.load_blocks();

        //oReq.readAsBinaryString(p_file);
        //oReq.send(null);

        if (result) {
            this.export = new WAVExport(this.list);
            for (let block of this.list) {
                this.export.render_block(block);
                this.export.add_long_silence();
            }
        }

        return result;
    }

    // -=-=---------------------------------------------------------------=-=-

    export_as_wav()
    {
        return this.export.export_as_wav();
    }

}