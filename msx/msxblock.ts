/// <reference path="../common/datablock.ts" />


class MSXBlock extends DataBlock {

    constructor(p_data:Array<number> = undefined)
    {
        super(p_data);
        this.system = "msx";
    }

    public set_name(p_name:string): void
    {
        if (p_name.length > 6) {
            p_name = p_name.substring(0, 6);
        }
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
        this.type = this.analyze_block_type();
        if (!this.is_custom()) {
            this.set_name(this.analyze_block_name());
            let temp:Array<number> = Array<number>(p_data.length - 16);
            for(let i=16;i<p_data.length;i++) {
                temp[i-16] = p_data[i];
            }
            this.data = temp;
        } else {
            this.set_name("------");
        }
        this.length = this.data.length;
    }

    // -=-=---------------------------------------------------------------=-=-

    private analyze_block_type(): string
    {
        var block_type = "custom";

        if (this.contains(BlockTypes.ascii_file_block)) {
            block_type = "ascii";
        } else if (this.contains(BlockTypes.basic_file_block)) {
            block_type = "basic";
        } else if (this.contains(BlockTypes.binary_file_block)) {
            block_type = "binary";
        }

        return block_type;
    }

    // -=-=---------------------------------------------------------------=-=-

    private analyze_block_name(): string
    {
        var block_name = "";
        var begin = 10;

        for(let i=begin; i < begin+6; i++) {
            block_name += String.fromCharCode(this.data[i]);
        }

        return block_name;
    }

    // -=-=---------------------------------------------------------------=-=-

    is_ascii(): boolean
    {
        return this.type === "ascii"
    }

    // -=-=---------------------------------------------------------------=-=-

    is_basic(): boolean
    {
        return this.type === "basic";
    }

    // -=-=---------------------------------------------------------------=-=-

    is_binary(): boolean
    {
        return this.type === "binary";
    }

}
