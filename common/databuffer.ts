class DataBuffer {

    private data:Array<number>;

    // -=-=---------------------------------------------------------------=-=-

    /**
     * Load a buffer in memory
     *
     * @param {Array<number>} p_data
     */
    constructor(p_data:Array<number>) {
        this.load(p_data);
    }

    // -=-=---------------------------------------------------------------=-=-

    /**
     * Load the buffer in memory
     *
     * @param p_data
     */
    protected load(p_data:Array<number>)
    {
        this.data = p_data;
    }

    // -=-=---------------------------------------------------------------=-=-

    /**
     * Verifies if the buffer contains a substring at a specific position
     *
     * @param p_pattern     - Substring that must be matched
     * @param p_begin_at    - The starting position from which confronting
     * @returns {boolean}   - Returns true if this.data and p_pattern match
     *                        starting from the begin_at position
     */
    protected contains(p_pattern:Array<number>, p_begin_at:number = 0): boolean
    {
        let i:number = 0;
        let same:boolean = true;


        // Finchè il contenuto è uguale continua a verificare
        while ((i < p_pattern.length) && (same)) {
            if (this.data[p_begin_at + i] !== p_pattern[i]) {
                same = false;
            }
            i++;
        }

        return same;
    }

    // -=-=---------------------------------------------------------------=-=-

    /**
     * Seek for a substring in this.data, starting at the array position
     * pointed by p_begin_at
     * @param {Array<number>} p_pattern  - Substring that must be found
     * @param {number} p_begin_at        - Starting position
     * @returns {number}                 - Returns the position of the substring,
     *                                     or -1 if the substring is not found
     */
    protected seek(p_pattern:Array<number>, p_begin_at:number = 0):number
    {
        let i:number = p_begin_at;
        let position:number = -1;
        let found:boolean = false;


        while ((i < this.data.length) && (!found)) {
            if (this.contains(p_pattern, i)) {
                position = i;
                found = true;
            }
            i++;
        }

        return position;
    }

    // -=-=---------------------------------------------------------------=-=-

    protected slice(p_inizio:number = 0, p_fine:number = this.data.length):Array<number>
    {
        let output:Array<number>;


        output = new Array<number>(p_fine - p_inizio);

        // Il browser su cui gira il programma supporta Uint8Array.slice ?

        if (typeof(this.data.slice) !== "undefined") {

            // Se il browser su cui sta girando lo script supporta
            // il metodo "slice" su di un'array Uint8Array, lo usa

            output = this.data.slice(p_inizio, p_fine);

        } else {

            // Se il browser non supporta il metodo "slice"
            // (come ad esempio Safari 9) lo fa a manina da codice

            for(let i = p_inizio; i < p_fine; i++) {
                output[i - p_inizio] = this.data[i];
            }

        }

        return output;
    }

    // -=-=---------------------------------------------------------------=-=-

    /**
     * Return the lengths of current buffer
     *
     * @returns {number} - Length of current buffer
     */
    length():number
    {
        return this.data.length;
    }

}