/// <reference path="./lib/riffwave.ts"/>
/// <reference path="./parameters.ts"/>
/// <reference path="./buffer.ts"/>
/// <reference path="./datablock.ts"/>
/// <reference path="./module.d.ts" />

class MSXTape {
    
    // -=-=---------------------------------------------------------------=-=-
    // GENERIC PARAMETERS
    // -=-=---------------------------------------------------------------=-=-
    public  name:string;
    private readonly parameters:MSXTapeParameters;
    private buffer:Buffer;
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
        this.buffer = new Buffer();

        this.audio = new Audio(); // create the HTML5 audio element
        this.wave = new RIFFWAVE(); // create an empty wave file
        this.data = []; // yes, it's an array

        this.wave.header.sampleRate = this.parameters.frequenza; // set sample rate to 44KHz
        this.wave.header.numChannels = 1; // one channels (mono)

        this.recalculate_waveforms();
        DataBlock.parametri = this.parameters;
    }

    // -=-=---------------------------------------------------------------=-=-

    /**
     * Ricalcola tutte le forme d'onda da utilizzare per inserire gli zeri 
     * e gli uno in base al bitrate deciso per il file (1200bps/2400bps/...) 
     * ed alla frequenza del file di output decisa.
     */
    recalculate_waveforms()
    {
        // Scorciatoia per accedere prima ai parametri
        var params = this.parameters;

        params.campionamenti = params.frequenza / params.bitrate;
        var passo = Math.floor(params.campionamenti / 4);

        let max:number = Math.floor(255 * params.ampiezza);
        let min:number = 255 - max;
        let i:number;
        let temp:Array<number> = [];
        
        /**
         * Ricalcola la forma d'onda per rappresentare un bit a 0
         * Per fare uno zero ci vuole una forma d'onda alla 
         * frequenza desiderata. Es: Se trasmetto a 2400bps 
         * l'onda per rappresentare lo 0 deve essere a 2400 
         */
        for(i = 0; i < passo * 2; i++) temp.push(min);
        for(let i = 0; i < passo * 2; i++) temp.push(max);
        params.wave_bit_0 = new Uint8Array(temp);

        /* Ricalcola la forma d'onda per rappresentare un bit a 1
         * Per fare un 1 ci vogliono due forme d'onda al doppio
         * della frequenza. Es: se trasmetto a 2400bps le onde per
         * rappresentare l'1 devono essere a 4800.
         */
        temp = [];
        for(i = 0; i < passo; i++) temp.push(min);
        for(i = 0; i < passo; i++) temp.push(max);
        for(i = 0; i < passo; i++) temp.push(min);
        for(i = 0; i < passo; i++) temp.push(max);
        params.wave_bit_1 = new Uint8Array(temp);

        /** Ed infine ricalcola la forma d'inda per rappresentare 
         * il silenzio. Nei file audio Uint8 i valori vanno da 
         * 0 a 255, per cui il silenzio è nel valore mediano (128) 
         */
        temp = [];
        for(i = 0; i < passo * 4; i++) temp.push(128);
        params.wave_silenzio = new Uint8Array(temp);

    }

    // -=-=---------------------------------------------------------------=-=-
    
    /**
     *
     */

    /**
     * Inserisce un bit all'interno del file audio come forma d'onda
     * @param {number} p_bit - Il bit da scrivere
     */
    inserisci_bit(p_bit:number)
    {
        var i = 0;
        var par = this.parameters;
        var onda:Uint8Array;

        /**
         * In base al bit da rappresentare sceglie la forma d'onda più
         * opportuna
         */
        if (p_bit == 0) {
            onda = par.wave_bit_0;
        } else if (p_bit == 1) {
            onda = par.wave_bit_1;
        } else {
            onda = par.wave_silenzio;
        }

        /**
         * Scrive la forma d'onda nel file audio
         */
        for(i = 0; i < onda.length; i++) {
            this.data.push(onda[i]);
        }

    }

    // -=-=---------------------------------------------------------------=-=-

    /**
     * Inserisce un byte all'interno del file audio
     */
    inserisci_byte(p_byte)
    {
        // Inserisce un bit di start
    	this.inserisci_bit(0);

        // Otto bit di dati

        for(let i = 0; i < 8; i++) {
    		if ((p_byte & 1) == 0) {
    			this.inserisci_bit(0);
    		} else {
    			this.inserisci_bit(1);
            }
    		p_byte = p_byte >> 1;  // Bitwise.ShiftRight(P_nByte, 1)
        }

    	// Inserisce due bit di stop
    	this.inserisci_bit(1);
    	this.inserisci_bit(1);
    }

    // -=-=---------------------------------------------------------------=-=-
    
    /**
     * Inserisce un'array nel file audio  
     */
    inserisci_array(p_array:Uint8Array)
    {
        var i = 0;
        for(i = 0; i < p_array.byteLength; i++) {
            this.inserisci_byte(p_array[i]);
        }
    }

    // -=-=---------------------------------------------------------------=-=-

    /**
     * Inserisce una stringa nel file audio
     */
    inserisci_stringa(p_stringa)
    {
        var i = 0;

        for(i = 0; i < p_stringa.length; i++) {
            this.inserisci_byte(p_stringa.charCodeAt(i));
        }
    }

    // -=-=---------------------------------------------------------------=-=-
    
    /**
     * Inserisce un segnale di sincronismo nel file audio.
     * Il segnale di sincronismo è il classico BEEEEEEEEEEEEEEEEEEEP
     * che si sente nell'audio all'inizio di ogni file e che serve al
     * computer a sincronizzarsi alla stessa velocità di trasmissione
     * dell'audio. Un segnale di sincronismo decente per MSX deve durare
     * almeno 1500-2000ms.
     */
    inserisci_sincronismo(p_durata:number)
    {
        var i = 0;
        var par = this.parameters;

        while (i < par.bitrate * par.campionamenti * p_durata/1000) {
            this.inserisci_bit(1);
            i += par.wave_bit_1.length;
        }
    }

    // -=-=---------------------------------------------------------------=-=-

    /**
     * Inserisce un periodo di silenzio nel file audio.
     */
    add_silence(p_durata:number)
    {
        var i = 0;
        var par = this.parameters;

        while (i < par.bitrate * par.campionamenti * p_durata/1000) {
            this.inserisci_bit(-1);
            i += par.wave_silenzio.length;
        }
    }

    // -=-=---------------------------------------------------------------=-=-
    
    /**
     * Genera un blocco completo per trasmettere un file MSX 
     * all'interno del file audio
     */
    genera_file(p_blocco)
    {
        this.inserisci_sincronismo(this.parameters.sincronismo_lungo);
        if (p_blocco.type == "ascii") {
            this.inserisci_array(this.parameters.blocco_file_ascii);
        } else if (p_blocco.type == "basic") {
            this.inserisci_array(this.parameters.blocco_file_basic);
        } else if (p_blocco.type == "binary") {
            this.inserisci_array(this.parameters.blocco_file_binario);
        }

        if (p_blocco.type != "custom") {
            this.inserisci_stringa(p_blocco.name);
            this.add_silence(this.parameters.silenzio_corto);
            this.inserisci_sincronismo(this.parameters.sincronismo_corto);
        }

        this.inserisci_array(p_blocco.data);
    }    

    // -=-=---------------------------------------------------------------=-=-

    cerca_blocco(p_inizio): DataBlock
    {
        let pos1:number;
        let pos2:number;
        let block:DataBlock = null;

        // Cerca la prima intestazione
        pos1 = this.buffer.cerca(this.parameters.blocco_intestazione, p_inizio);
        if (pos1 >= 0) {
            pos1 += this.parameters.blocco_intestazione.length;
            pos2 = this.buffer.cerca(this.parameters.blocco_intestazione, pos1);
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

    load_from_local_file(p_file)
    {
        let request = new FileReader();
        let self = this;

        request.onload = function (e) {
            self.name = p_file.name
                .toLowerCase()
                .replace(".cas", "");
            let buffer = request.result;
            if (self.load_from_buffer(buffer)) {
                if (typeof self.onload !== "undefined") {
                    self.onload(buffer);
                }
            } else {
                if (typeof self.onerror !== "undefined") {
                    self.onerror(buffer);
                }
            }
        };

        request.readAsArrayBuffer(p_file);
    }

    // -=-=---------------------------------------------------------------=-=-

    /**
     * Load a file in memory and converts it to a wav file
     * @param p_file - The file that must be loaded
     */
    load_from_buffer(p_buffer)
    {
        let result:boolean;


        this.initialize();

        //var oReq = new XMLHttpRequest();
        //oReq.open("GET", p_file, true);
        //oReq.responseType = "arraybuffer";

        /* I will need a reference to this class, when the execution
           will happen inside the onload event
         */

        /* Let' put the Downloaded file in a variabile */
        if (p_buffer) {
            let byteArray = new Uint8Array(p_buffer);
            this.buffer.carica(byteArray);
            //console.log(self.buffer);
            result = this.load_blocks();
        }

        //oReq.readAsBinaryString(p_file);
        //oReq.send(null);
        return result;
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

    /**
     * Continua a caricare il file in memoria
     */
    private load_blocks()
    {        
        let pos:number = 0;
        let block:DataBlock;
        let found:boolean = false;

        /* While there's a block to analyse */
        while(block !== null) {
            if (pos !== 0) {
                /* If this is not the first block analysed and converted,
                   we will put a long silence between the blocks on the audio
                   so it will be easier for your MSX to understand when a block
                   ends and a new one starts.
                 */
                this.add_silence(this.parameters.silenzio_lungo);
            }
            block = this.estrai_blocco(pos);
            if(block !== null) {
                found = true;
                this.genera_file(block);
                console.log(block);         
                pos = block.get_data_end();
            }            
        }

        if (found) {
            this.wave.Make(this.data);
            // make the wave file
            this.audio.src = this.wave.dataURI; // set audio source
        }

        return found
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
