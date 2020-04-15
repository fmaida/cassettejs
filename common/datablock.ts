class DataBlock {

    public    system:string;
    public    name:string;
    public    type:string;
    protected data:Array<number>;
    protected data_begin:number;
    protected data_end:number;


    public constructor(p_data:Array<number> = undefined)
    {
        this.system = "generic";
        if (typeof p_data !== "undefined") this.import(p_data);
    }

    // -=-=---------------------------------------------------------------=-=-

    public set_name(p_name:string): void
    {
        this.name = p_name;
    }

    // -=-=---------------------------------------------------------------=-=-

    public get_name(): string
    {
        return this.name;
    }

    // -=-=---------------------------------------------------------------=-=-

    public set_type(p_type:string): void
    {
        this.type = p_type;
    }

    // -=-=---------------------------------------------------------------=-=-

    public get_type(): string
    {
        return this.type;
    }

    // -=-=---------------------------------------------------------------=-=-

    public is_custom(): boolean
    {
        return (this.type == "custom");
    }

    // -=-=---------------------------------------------------------------=-=-

    public import(p_data:Array<number>): void
    {
        this.data = p_data;
    }

    // -=-=---------------------------------------------------------------=-=-

    public append(p_block:DataBlock)
    {
        let data:Array<number> = new Array<number>(this.data.length + p_block.data.length)
        let offset:number = 0;

        for(let i=0; i<this.data.length; i++) {
            data[offset + i] = this.data[i];
        }
        offset += this.data.length;
        for(let i=0; i<p_block.data.length; i++) {
            data[offset + i] = p_block.data[i];
        }

        this.data = data;
        this.set_data_end(p_block.get_data_end());
    }

    // -=-=---------------------------------------------------------------=-=-

    protected contains(p_pattern:Array<number>): Boolean
    {
        let match = true;

        for(let i = 0; i < p_pattern.length; i++) {
            if (this.data[i] !== p_pattern[i]) {
                match = false;
                i = p_pattern.length;
            }
        }

        return match;
    }

    // -=-=---------------------------------------------------------------=-=-

    public get_data(): Array<number>
    {
        return this.data;
    }

    // -=-=---------------------------------------------------------------=-=-

    public set_data_begin(p_value:number): void
    {
        this.data_begin = p_value;
    }

    // -=-=---------------------------------------------------------------=-=-

    public get_data_begin(): number
    {
        return this.data_begin;
    }

    // -=-=---------------------------------------------------------------=-=-

    public set_data_end(p_value:number): void
    {
        this.data_end = p_value;
    }

    // -=-=---------------------------------------------------------------=-=-

    public get_data_end(): number
    {
        return this.data_end;
    }

    // -=-=---------------------------------------------------------------=-=-

    public get_data_length(): number
    {
        let length:number = this.data_end - this.data_begin;
        if (length < 0) {
            length = -1;
        }
        return length;
    }

}