class DataBuffer {

    private dati:Array<number>;

    // -=-=---------------------------------------------------------------=-=-

    /**
     * Load a buffer in memory
     *
     * @param {Uint8Array} p_dati
     */
    constructor(p_dati:Array<number>) {
        this.carica(p_dati);
    }

    // -=-=---------------------------------------------------------------=-=-

    /**
     * Carica il buffer
     *
     * @param p_dati
     */
    carica(p_dati:Array<number>)
    {
        this.dati = p_dati;
    }

    // -=-=---------------------------------------------------------------=-=-

    /**
     * Verifica se il buffer contiene una sottostringa specificata alla
     * posizione specificata
     *
     * @param p_ricerca     La sottostringa da ricercare
     * @param p_inizio      La posizione da cui cercare
     * @returns {boolean}   Restituisce True se ha trovato la sottostringa
     */
    contiene(p_ricerca:Array<number>, p_inizio:number = 0):boolean
    {
        let i:number = 0;
        let uguale:boolean = true;


        // Finchè il contenuto è uguale continua a verificare
        while ((i < p_ricerca.length) && (uguale)) {
            if (this.dati[p_inizio + i] !== p_ricerca[i]) {
                uguale = false;
            }
            i++;
        }

        return uguale;
    }

    // -=-=---------------------------------------------------------------=-=-

    cerca(p_ricerca:Array<number>, p_inizio:number = 0):number
    {
        let i:number = p_inizio;
        let posizione:number = -1;
        let trovato:boolean = false;


        while ((i < this.dati.length) && (!trovato)) {
            if (this.contiene(p_ricerca, i)) {
                posizione = i;
                trovato = true;
            }
            i++;
        }

        return posizione;
    }

    // -=-=---------------------------------------------------------------=-=-

    splitta(p_inizio:number = 0, p_fine:number = this.dati.length):Array<number>
    {
        let output:Array<number>;


        output = new Array<number>(p_fine - p_inizio);

        // Il browser su cui gira il programma supporta Uint8Array.slice ?

        if (typeof(this.dati.slice) !== "undefined") {

            // Se il browser su cui sta girando lo script supporta
            // il metodo "slice" su di un'array Uint8Array, lo usa

            output = this.dati.slice(p_inizio, p_fine);

        } else {

            // Se il browser non supporta il metodo "slice"
            // (come ad esempio Safari 9) lo fa a manina da codice

            for(let i = p_inizio; i < p_fine; i++) {
                output[i - p_inizio] = this.dati[i];
            }

        }

        return output;
    }

    // -=-=---------------------------------------------------------------=-=-

    length():number
    {
        return this.dati.length;
    }

}
//