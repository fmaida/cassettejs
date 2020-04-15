class Player {

    public on_job_completed;
    public on_audio_export;
    public on_error;

    /* HTML5 Audio Element */
    private exporter;
    private audio;

    constructor(p_list, callback=undefined)
    {
        this.on_job_completed = callback;
        this.audio = new Audio(); // create the HTML5 audio element
        this.exporter = new WAVExporter();
        this.exporter.export(p_list);

        this.audio.src = this.exporter.buffer.dataURI; // set audio source */

        if (typeof this.on_job_completed !== "undefined") {
            this.on_job_completed(p_list);
        }
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

    save():boolean
    {
        let data = this.exporter.buffer.dataURI;

        if (typeof data !== "undefined") {
            if (typeof this.on_audio_export !== "undefined") {
                this.on_audio_export(data);
            } else {
                return false;
            }
        } else {
            if (typeof this.on_error !== "undefined") {
                this.on_error("File I/O Error");
            }
            return false;
        }

        return true;
    }

    // -=-=---------------------------------------------------------------=-=-

}