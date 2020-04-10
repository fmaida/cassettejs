/// <reference path="./datablock.ts" />

class Export {

    public  frequenza: number = 44100;  // 28.800hz
    public  bitrate: number = 2400;     // 2400bps
    public  ampiezza: number =  0.90;    // 90% dell'ampiezza massima
    private campionamenti: number;

    public sincronismo_lungo: number = 2500;
    public sincronismo_corto: number = 1500;
    public silenzio_lungo: number = 2000;
    public silenzio_corto: number = 1250;

    private wave_bit_0:Uint8Array;
    private wave_bit_1:Uint8Array;
    private wave_silenzio:Uint8Array;

    public  buffer;
    private buffer_index:number;

    constructor(p_list:DataBlock[])
    {
        this.recalculate_waveforms();
        this.buffer = [];
    }

    // -=-=---------------------------------------------------------------=-=-

    /**
     * Ricalcola tutte le forme d'onda da utilizzare per inserire gli zeri
     * e gli uno in base al bitrate deciso per il file (1200bps/2400bps/...)
     * ed alla frequenza del file di output decisa.
     */
    recalculate_waveforms()
    {
        this.campionamenti = this.frequenza / this.bitrate;
        let passo = Math.floor(this.campionamenti / 4);

        let max:number = Math.floor(255 * this.ampiezza);
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
        this.wave_bit_0 = new Uint8Array(temp);

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
        this.wave_bit_1 = new Uint8Array(temp);

        /** Ed infine ricalcola la forma d'inda per rappresentare
         * il silenzio. Nei file audio Uint8 i valori vanno da
         * 0 a 255, per cui il silenzio è nel valore mediano (128)
         */
        temp = [];
        for(i = 0; i < passo * 4; i++) temp.push(128);
        this.wave_silenzio = new Uint8Array(temp);

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
        let i:number = 0;
        let onda:Uint8Array;

        /**
         * In base al bit da rappresentare sceglie la forma d'onda più
         * opportuna
         */
        if (p_bit === 0) {
            onda = this.wave_bit_0;
        } else if (p_bit === 1) {
            onda = this.wave_bit_1;
        } else {
            onda = this.wave_silenzio;
        }

        /**
         * Scrive la forma d'onda nel file audio
         */
        for(i = 0; i < onda.length; i++) {
            this.buffer.append(onda[i]);
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
        let i = 0;

        while (i < par.bitrate * par.campionamenti * p_durata/1000) {
            this.inserisci_bit(1);
            i += this.wave_bit_1.length;
        }
    }

    // -=-=---------------------------------------------------------------=-=-

    /**
     * Inserisce un periodo di silenzio nel file audio.
     */
    add_silence(p_durata:number)
    {
        let i = 0;

        while (i < this.bitrate * this.campionamenti * p_durata/1000) {
            this.inserisci_bit(-1);
            i += this.wave_silenzio.length;
        }
    }

    // -=-=---------------------------------------------------------------=-=-

    /**
     * Genera un blocco completo per trasmettere un file MSX
     * all'interno del file audio
     */
    genera_file(p_blocco)
    {
        this.inserisci_sincronismo(this.sincronismo_lungo);
        if (p_blocco.type == "ascii") {
            this.inserisci_array(BlockTypes.blocco_file_ascii);
        } else if (p_blocco.type == "basic") {
            this.inserisci_array(BlockTypes.blocco_file_basic);
        } else if (p_blocco.type == "binary") {
            this.inserisci_array(BlockTypes.blocco_file_binario);
        }

        if (p_blocco.type != "custom") {
            this.inserisci_stringa(p_blocco.name);
            this.add_silence(this.silenzio_corto);
            this.inserisci_sincronismo(this.sincronismo_corto);
        }

        this.inserisci_array(p_blocco.data);
    }

}