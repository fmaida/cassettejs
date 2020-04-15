/// <reference path="../common/databuffer.ts" />
/// <reference path="./blocktypes.ts" />


class MSXBuffer extends DataBuffer
{

    /**
     * Estrae un blocco dal buffer
     *
     * depends on this.cerca_blocco
     */
    public extract_block(p_inizio):MSXBlock
    {
        let block1:MSXBlock;
        let block2:MSXBlock;

        // Normally on a cassette you will find a single file encoded this way:
        // <header><data info><header><data>
        // seek_single_block will initially find <header><data info>
        // to obtain everything I will have to use seek_single_block twice and
        // then merge the two blocks.

        // Look for the first block on the cassette
        block1 = this.seek_single_block(p_inizio);
        // Was a data block found ?
        if (block1 !== null) {
            // Yes, let's extract it
            // But before doing that, we have to be sure that the
            // block is not a custom block
            if (!block1.is_custom()) {
                // Ok, it's not a custom block
                block2 = this.seek_single_block(block1.get_data_end());
                if(block2 !== null) {
                    // Merge the two blocks
                    block1.append(block2);
                }
            }
        }

        return block1;
    }

    // -=-=---------------------------------------------------------------=-=-

    private seek_single_block(p_inizio:number): MSXBlock
    {
        let pos1:number;
        let pos2:number;
        let block:MSXBlock = null;

        // Seek for the header block
        pos1 = this.seek(BlockTypes.header_block, p_inizio);
        if (pos1 >= 0) {
            // Ok, we found a header block. Everything that will be
            // after this header block will probably be information
            // about our file, such as its name and its type
            pos1 += BlockTypes.header_block.length;
            // Seek for the second header block
            pos2 = this.seek(BlockTypes.header_block, pos1);
            if (pos2 < 0) {
                // No further headers? Then we'll consider everything left
                // on the buffer as a single whole block
                pos2 = this.length();
            }
            // Allright, we can consider a block everything that is
            // included between the position of the first header + its length
            // and the second block found
            block = new MSXBlock(this.slice(pos1, pos2));
            block.set_data_begin(pos1);
            block.set_data_end(pos2);
        } else {
            // We have not found a header block. Maybe it's not a valid file?
        }

        return block;
    }

    // -=-=---------------------------------------------------------------=-=-

}