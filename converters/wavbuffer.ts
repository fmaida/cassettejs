class WAVBuffer
{
    public buffer: Array<number>;


    constructor()
    {
        this.buffer = [];
    }

    push(data:Uint8Array)
    {
        // This command works on Chrome and Firefox but not on Safari!
        //this.buffer.push(...data);

        // I have to write it in an explicit way:
        for (let i=0; i < data.length; i++) {
            this.buffer.push(data[i]);
        }
    }

    export()
    {
        return this.buffer;
    }
}