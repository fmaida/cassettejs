/// <reference path="./databuffer.ts" />
/// <reference path="./datablock.ts" />


class Cassette {


    constructor()
    {
    }

    load(p_buffer:Uint8Array, callback_function:() => void = undefined): any[]
    {
        let buffer:DataBuffer = new DataBuffer(p_buffer);
        return this.analyse(buffer);
    }

    protected analyse(buffer:any, callback_function:() => void = undefined): any[]
    {
        return [];
    }

}