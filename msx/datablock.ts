class DataBlock {

    private name:string;
    private type:string;
    private data:Array<number>;
    private data_begin:number;
    private data_end:number;
    private data_length:number;

    public constructor(p_data:Array<number> = null)
    {
        if (p_data !== null) this.set_data(p_data);
    }

    public set_name(p_name:string): void
    {
        if (p_name.length > 6) {
            p_name = p_name.substring(0, 6);
        }
        this.name = p_name;
    }

    public get_name(): string
    {
        return this.name;
    }

    public set_type(p_type:string): void
    {
        this.type = p_type;
    }

    public get_type(): string
    {
        return this.type;
    }

    public is_custom(): boolean
    {
         return (this.type == "custom");
    }

    public set_data(p_data:Array<number>): void
    {
        this.data = p_data;
        this.type = this.analyze_block_type();
        if (!this.is_custom()) {
            this.set_name(this.analyze_block_name());
            let temp:Array<number> = Array<number>(p_data.length - 16);
            for(let i=16;i<p_data.length;i++) {
                temp[i-16] = p_data[i];
            }
            this.data = temp;
        }

    }

    public append_block(p_block:DataBlock)
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

    private contains(p_pattern:Array<number>): Boolean
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

    private analyze_block_type(): string
    {
        var block_type = "custom";

        if (this.contains(BlockTypes.blocco_file_ascii)) {
            block_type = "ascii";
        } else if (this.contains(BlockTypes.blocco_file_basic)) {
            block_type = "basic";
        } else if (this.contains(BlockTypes.blocco_file_binario)) {
            block_type = "binary";
        }

        return block_type;
    }

    private analyze_block_name(): string
    {
        var block_name = "";
        var begin = 10;

        for(let i=begin; i < begin+6; i++) {
            block_name += String.fromCharCode(this.data[i]);
        }

        return block_name;
    }

    public get_data(): Array<number>
    {
        return this.data;
    }

    public set_data_begin(p_value:number): void
    {
        this.data_begin = p_value;
    }

    public get_data_begin(): number
    {
        return this.data_begin;
    }

    public set_data_end(p_value:number): void
    {
        this.data_end = p_value;
    }

    public get_data_end(): number
    {
        return this.data_end;
    }

    public get_data_length(): number
    {
        let length:number = this.data_end - this.data_begin;
        if (length < 0) {
            length = -1;
        }
        return length;
    }

}
