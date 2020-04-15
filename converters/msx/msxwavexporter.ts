/// <reference path="../../msx/msxblock.ts" />
/// <reference path="../../lib/riffwave.ts" />


/**
 *
 */
class MSXWAVExporter {

    public on_block_conversion = undefined;

    public frequenza: number = 44100;  // 44.100hz
    public bitrate: number = 2205;     // 2400bps
    public ampiezza: number = 0.85;    // 85% dell'ampiezza massima
    private campionamenti: number;

    public sincronismo_lungo: number = 2500;
    public sincronismo_corto: number = 1500;
    public silenzio_lungo: number = 2000;
    public silenzio_corto: number = 1250;

    private wave_bit_0: Array<number>;
    private wave_bit_1: Array<number>;
    private wave_silenzio: Array<number>;

    private wave_sincronismo_lungo:Array<number>;
    private wave_sincronismo_corto:Array<number>;
    private wave_silenzio_lungo:Array<number>;
    private wave_silenzio_corto:Array<number>;

    public buffer;

    
    /**
     * Class constructor
     *
     * @param {DataBlock[]} p_list - List of datablocks to render
     *                               on an audio file
     */
    constructor() {
        this.recalculate_waveforms();
        this.buffer = [];
    }

    // -=-=---------------------------------------------------------------=-=-

    /**
     * Ricalcola tutte le forme d'onda da utilizzare per inserire gli zeri
     * e gli uno in base al bitrate deciso per il file (1200bps/2400bps/...)
     * ed alla frequenza del file di output decisa.
     */
    recalculate_waveforms() {
        this.campionamenti = this.frequenza / this.bitrate;
        let passo = Math.floor(this.campionamenti / 4);

        let max: number = Math.floor(255 * this.ampiezza);
        let min: number = 255 - max;
        let i: number;

        /**
         * Ricalcola la forma d'onda per rappresentare un bit a 0
         * Per fare uno zero ci vuole una forma d'onda alla
         * frequenza desiderata. Es: Se trasmetto a 2400bps
         * l'onda per rappresentare lo 0 deve essere a 2400
         */
        this.wave_bit_0 = new Array<number>();
        for (i = 0; i < passo * 2; i++) this.wave_bit_0.push(min); // min
        for (i = 0; i < passo * 2; i++) this.wave_bit_0.push(max); // max

        /* Ricalcola la forma d'onda per rappresentare un bit a 1
         * Per fare un 1 ci vogliono due forme d'onda al doppio
         * della frequenza. Es: se trasmetto a 2400bps le onde per
         * rappresentare l'1 devono essere a 4800.
         */

        this.wave_bit_1 = new Array<number>();
        for (i = 0; i < passo; i++) this.wave_bit_1.push(min);
        for (i = 0; i < passo; i++) this.wave_bit_1.push(max);
        for (i = 0; i < passo; i++) this.wave_bit_1.push(min);
        for (i = 0; i < passo; i++) this.wave_bit_1.push(max);

        /** Ed infine ricalcola la forma d'inda per rappresentare
         * il silenzio. Nei file audio Uint8 i valori vanno da
         * 0 a 255, per cui il silenzio è nel valore mediano (128)
         */
        this.wave_silenzio = new Array<number>();
        for (i = 0; i < passo * 4; i++) this.wave_silenzio.push(128);

        /* Sincronismi lunghi e corti */
        this.wave_sincronismo_lungo = new Array<number>();
        this.wave_sincronismo_corto = new Array<number>();
        i = 0;
        while (i < this.bitrate * this.campionamenti * this.sincronismo_lungo / 1000) {
            this.wave_sincronismo_lungo.push(...this.wave_bit_1);
            i += this.wave_bit_1.length;
        }
        i = 0;
        while (i < this.bitrate * this.campionamenti * this.sincronismo_corto / 1000) {
            this.wave_sincronismo_corto.push(...this.wave_bit_1);
            i += this.wave_bit_1.length;
        }

        /* Silenzio lungo e corto */
        this.wave_silenzio_lungo = new Array<number>();
        this.wave_silenzio_corto = new Array<number>();
        i = 0;
        while (i < this.bitrate * this.campionamenti * this.silenzio_lungo / 1000) {
            this.wave_silenzio_lungo.push(...this.wave_silenzio);
            i += this.wave_silenzio.length;
        }
        i = 0;
        while (i < this.bitrate * this.campionamenti * this.silenzio_corto / 1000) {
            this.wave_silenzio_corto.push(...this.wave_silenzio);
            i += this.wave_silenzio.length;
        }
    }

    // -=-=---------------------------------------------------------------=-=-

    /**
     *
     */

    /**
     * Inserisce un bit all'interno del file audio come forma d'onda
     * @param {number} p_bit - Il bit da scrivere
     */
    inserisci_bit(p_bit: number) {
        //let waveform: Array<number>;

        /**
         * In base al bit da rappresentare sceglie la forma d'onda più
         * opportuna
         */
        if (p_bit === 0) {
            //waveform = this.wave_bit_0;
            //this.buffer.push(...waveform);
            this.buffer.push(...this.wave_bit_0);
        } else if (p_bit === 1) {
            //waveform = this.wave_bit_1;
            //this.buffer.push(...waveform);
            this.buffer.push(...this.wave_bit_1);
        } else {
            //waveform = this.wave_silenzio;
            //this.buffer.push(...waveform);
            this.buffer.push(...this.wave_silenzio);
        }

    }

    // -=-=---------------------------------------------------------------=-=-

    /**
     * Inserisce un byte all'interno del file audio
     */
    inserisci_byte(p_byte) {
        // Inserisce un bit di start
        this.inserisci_bit(0);

        // Otto bit di dati

        for (let i = 0; i < 8; i++) {
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
    inserisci_array(p_array: Array<number>) {
        var i = 0;
        for (i = 0; i < p_array.length; i++) {
            this.inserisci_byte(p_array[i]);
        }
    }

    // -=-=---------------------------------------------------------------=-=-

    /**
     * Inserisce una stringa nel file audio
     */
    inserisci_stringa(p_stringa:string) {
        var i = 0;

        for (i = 0; i < p_stringa.length; i++) {
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
    inserisci_sincronismo(p_durata: number) {

        if (p_durata == this.sincronismo_lungo) {
            this.buffer.push(...this.wave_sincronismo_lungo);
        } else if (p_durata == this.sincronismo_corto) {
            this.buffer.push(...this.wave_sincronismo_corto);
        } else {
            let i = 0;

            while (i < this.bitrate * this.campionamenti * p_durata / 1000) {
                this.inserisci_bit(1);
                i += this.wave_bit_1.length;
            }
        }

    }

    // -=-=---------------------------------------------------------------=-=-

    /**
     * Inserisce un periodo di silenzio nel file audio.
     */
    add_silence(p_durata: number) {
        if (p_durata == this.silenzio_lungo) {
            this.buffer.push(...this.wave_silenzio_lungo);
        } else if (p_durata == this.silenzio_corto) {
            this.buffer.push(...this.wave_silenzio_corto);
        } else {
            let i:number = 0;
            while (i < this.bitrate * this.campionamenti * p_durata / 1000) {
                this.inserisci_bit(-1);
                i += this.wave_silenzio.length;
            }
        }
    }

    // -=-=---------------------------------------------------------------=-=-

    add_long_silence() {
        this.buffer.push(...this.wave_silenzio_lungo);
        //this.add_silence(this.silenzio_lungo);
    }

    // -=-=---------------------------------------------------------------=-=-

    add_short_silence() {
        this.buffer.push(...this.wave_silenzio_corto);
        //this.add_silence(this.silenzio_corto);
    }

    // -=-=---------------------------------------------------------------=-=-

    /**
     * Genera un blocco completo per trasmettere un file MSX
     * all'interno del file audio
     */
    render_block(p_blocco) {

        this.inserisci_sincronismo(this.sincronismo_lungo);
        if (p_blocco.type == "ascii") {
            this.inserisci_array(BlockTypes.ascii_file_block);
        } else if (p_blocco.type == "basic") {
            this.inserisci_array(BlockTypes.basic_file_block);
        } else if (p_blocco.type == "binary") {
            this.inserisci_array(BlockTypes.binary_file_block);
        }

        if (p_blocco.type != "custom") {
            this.inserisci_stringa(p_blocco.name);
            this.add_short_silence();
            this.inserisci_sincronismo(this.sincronismo_corto);
        }

        this.inserisci_array(p_blocco.data);

        return true;
    }

    // -=-=---------------------------------------------------------------=-=-

    export_as_wav(p_list:MSXBlock[])
    {
        let i:number = 0;


        this.add_silence(750);
        for (let block of p_list) {
            i += 1;
            if (typeof this.on_block_conversion !== "undefined") {
                this.on_block_conversion(i, p_list.length);
            }
            this.render_block(block);
            if (i < p_list.length) {
                this.add_long_silence();
            }
        }
        this.add_silence(1000);

        return this.create_wav();
    }

    // -=-=---------------------------------------------------------------=-=-

    create_wav()
    {
        let wav_exporter = new RIFFWAVE();

        wav_exporter.header.sampleRate = this.frequenza; // set sample rate
        wav_exporter.header.numChannels = 1; // one channels (mono)
        wav_exporter.Make(this.buffer);
        // make the wave file
        return wav_exporter; //.dataURI; // set audio source
    }

}
//