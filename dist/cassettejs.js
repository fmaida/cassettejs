var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var FastBase64 = {
    chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
    encLookup: [],
    Init: function () {
        for (var i = 0; i < 4096; i++) {
            this.encLookup[i] = this.chars[i >> 6] + this.chars[i & 0x3F];
        }
    },
    Encode: function (src) {
        var len = src.length;
        var dst = '';
        var i = 0;
        while (len > 2) {
            var n = (src[i] << 16) | (src[i + 1] << 8) | src[i + 2];
            dst += this.encLookup[n >> 12] + this.encLookup[n & 0xFFF];
            len -= 3;
            i += 3;
        }
        if (len > 0) {
            var n1 = (src[i] & 0xFC) >> 2;
            var n2 = (src[i] & 0x03) << 4;
            if (len > 1)
                n2 |= (src[++i] & 0xF0) >> 4;
            dst += this.chars[n1];
            dst += this.chars[n2];
            if (len == 2) {
                var n3 = (src[i++] & 0x0F) << 2;
                n3 |= (src[i] & 0xC0) >> 6;
                dst += this.chars[n3];
            }
            if (len == 1)
                dst += '=';
            dst += '=';
        }
        return dst;
    }
};
FastBase64.Init();
var RIFFWAVE = function (data) {
    if (data === void 0) { data = undefined; }
    this.data = [];
    this.wav = [];
    this.dataURI = '';
    this.header = {
        chunkId: [0x52, 0x49, 0x46, 0x46],
        chunkSize: 0,
        format: [0x57, 0x41, 0x56, 0x45],
        subChunk1Id: [0x66, 0x6d, 0x74, 0x20],
        subChunk1Size: 16,
        audioFormat: 1,
        numChannels: 1,
        sampleRate: 8000,
        byteRate: 0,
        blockAlign: 0,
        bitsPerSample: 8,
        subChunk2Id: [0x64, 0x61, 0x74, 0x61],
        subChunk2Size: 0
    };
    function u32ToArray(i) {
        return [i & 0xFF, (i >> 8) & 0xFF, (i >> 16) & 0xFF, (i >> 24) & 0xFF];
    }
    function u16ToArray(i) {
        return [i & 0xFF, (i >> 8) & 0xFF];
    }
    function split16bitArray(data) {
        var r = [];
        var j = 0;
        var len = data.length;
        for (var i = 0; i < len; i++) {
            r[j++] = data[i] & 0xFF;
            r[j++] = (data[i] >> 8) & 0xFF;
        }
        return r;
    }
    this.Make = function (data) {
        if (data instanceof Array)
            this.data = data;
        this.header.blockAlign = (this.header.numChannels * this.header.bitsPerSample) >> 3;
        this.header.byteRate = this.header.blockAlign * this.sampleRate;
        this.header.subChunk2Size = this.data.length * (this.header.bitsPerSample >> 3);
        this.header.chunkSize = 36 + this.header.subChunk2Size;
        this.wav = this.header.chunkId.concat(u32ToArray(this.header.chunkSize), this.header.format, this.header.subChunk1Id, u32ToArray(this.header.subChunk1Size), u16ToArray(this.header.audioFormat), u16ToArray(this.header.numChannels), u32ToArray(this.header.sampleRate), u32ToArray(this.header.byteRate), u16ToArray(this.header.blockAlign), u16ToArray(this.header.bitsPerSample), this.header.subChunk2Id, u32ToArray(this.header.subChunk2Size), (this.header.bitsPerSample == 16) ? split16bitArray(this.data) : this.data);
        this.dataURI = 'data:audio/wav;base64,' + FastBase64.Encode(this.wav);
    };
    if (data instanceof Array)
        this.Make(data);
};
var MSXTapeParameters = (function () {
    function MSXTapeParameters() {
        this.blocco_intestazione = new Uint8Array([0x1F, 0xA6, 0xDE, 0xBA,
            0xCC, 0x13, 0x7D, 0x74]);
        this.blocco_file_ascii = new Uint8Array([0xEA, 0xEA, 0xEA, 0xEA, 0xEA,
            0xEA, 0xEA, 0xEA, 0xEA, 0xEA]);
        this.blocco_file_basic = new Uint8Array([0xD3, 0xD3, 0xD3, 0xD3, 0xD3,
            0xD3, 0xD3, 0xD3, 0xD3, 0xD3]);
        this.blocco_file_binario = new Uint8Array([0xD0, 0xD0, 0xD0, 0xD0, 0xD0,
            0xD0, 0xD0, 0xD0, 0xD0, 0xD0]);
    }
    return MSXTapeParameters;
}());
var DataBuffer = (function () {
    function DataBuffer(p_data) {
        this.load(p_data);
    }
    DataBuffer.prototype.load = function (p_data) {
        this.data = p_data;
    };
    DataBuffer.prototype.contains = function (p_pattern, p_begin_at) {
        if (p_begin_at === void 0) { p_begin_at = 0; }
        var i = 0;
        var same = true;
        while ((i < p_pattern.length) && (same)) {
            if (this.data[p_begin_at + i] !== p_pattern[i]) {
                same = false;
            }
            i++;
        }
        return same;
    };
    DataBuffer.prototype.seek = function (p_pattern, p_begin_at) {
        if (p_begin_at === void 0) { p_begin_at = 0; }
        var i = p_begin_at;
        var position = -1;
        var found = false;
        while ((i < this.data.length) && (!found)) {
            if (this.contains(p_pattern, i)) {
                position = i;
                found = true;
            }
            i++;
        }
        return position;
    };
    DataBuffer.prototype.slice = function (p_inizio, p_fine) {
        if (p_inizio === void 0) { p_inizio = 0; }
        if (p_fine === void 0) { p_fine = this.data.length; }
        var output;
        output = new Uint8Array(p_fine - p_inizio);
        if (typeof (this.data.slice) !== "undefined") {
            output = this.data.slice(p_inizio, p_fine);
        }
        else {
            for (var i = p_inizio; i < p_fine; i++) {
                output[i - p_inizio] = this.data[i];
            }
        }
        return output;
    };
    DataBuffer.prototype.length = function () {
        return this.data.length;
    };
    return DataBuffer;
}());
var DataBlock = (function () {
    function DataBlock(p_data) {
        if (p_data === void 0) { p_data = undefined; }
        this.system = "generic";
        if (typeof p_data !== "undefined")
            this.import(p_data);
    }
    DataBlock.prototype.set_name = function (p_name) {
        this.name = p_name;
    };
    DataBlock.prototype.get_name = function () {
        return this.name;
    };
    DataBlock.prototype.set_type = function (p_type) {
        this.type = p_type;
    };
    DataBlock.prototype.get_type = function () {
        return this.type;
    };
    DataBlock.prototype.is_custom = function () {
        return (this.type == "custom");
    };
    DataBlock.prototype.import = function (p_data) {
        this.data = p_data;
    };
    DataBlock.prototype.append = function (p_block) {
        var data = new Uint8Array(this.data.length
            + p_block.data.length);
        var offset = 0;
        for (var i = 0; i < this.data.length; i++) {
            data[offset + i] = this.data[i];
        }
        offset += this.data.length;
        for (var i = 0; i < p_block.data.length; i++) {
            data[offset + i] = p_block.data[i];
        }
        this.data = data;
        this.set_data_end(p_block.get_data_end());
    };
    DataBlock.prototype.contains = function (p_pattern) {
        var match = true;
        for (var i = 0; i < p_pattern.length; i++) {
            if (this.data[i] !== p_pattern[i]) {
                match = false;
                i = p_pattern.length;
            }
        }
        return match;
    };
    DataBlock.prototype.get_data = function () {
        return this.data;
    };
    DataBlock.prototype.set_data_begin = function (p_value) {
        this.data_begin = p_value;
    };
    DataBlock.prototype.get_data_begin = function () {
        return this.data_begin;
    };
    DataBlock.prototype.set_data_end = function (p_value) {
        this.data_end = p_value;
    };
    DataBlock.prototype.get_data_end = function () {
        return this.data_end;
    };
    DataBlock.prototype.get_data_length = function () {
        var length = this.data_end - this.data_begin;
        if (length < 0) {
            length = -1;
        }
        return length;
    };
    return DataBlock;
}());
function data_uri_to_blob(dataURI) {
    var byteString;
    if (dataURI.split(',')[0].indexOf('base64') >= 0)
        byteString = atob(dataURI.split(',')[1]);
    else
        byteString = unescape(dataURI.split(',')[1]);
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    var ia = new Uint8Array(byteString.length);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ia], { type: mimeString });
}
function export_as_file(p_self) {
    return new Blob([data_uri_to_blob(p_self.wave.dataURI)]);
}
var BlockTypes = (function () {
    function BlockTypes() {
    }
    BlockTypes.header_block = new Uint8Array([
        0x1F, 0xA6, 0xDE, 0xBA, 0xCC, 0x13, 0x7D, 0x74
    ]);
    BlockTypes.ascii_file_block = new Uint8Array([0xEA, 0xEA, 0xEA, 0xEA, 0xEA, 0xEA,
        0xEA, 0xEA, 0xEA, 0xEA]);
    BlockTypes.basic_file_block = new Uint8Array([0xD3, 0xD3, 0xD3, 0xD3, 0xD3,
        0xD3, 0xD3, 0xD3, 0xD3, 0xD3]);
    BlockTypes.binary_file_block = new Uint8Array([0xD0, 0xD0, 0xD0, 0xD0, 0xD0,
        0xD0, 0xD0, 0xD0, 0xD0, 0xD0]);
    return BlockTypes;
}());
var MSXBuffer = (function (_super) {
    __extends(MSXBuffer, _super);
    function MSXBuffer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MSXBuffer.prototype.extract_block = function (p_inizio) {
        var block1;
        var block2;
        block1 = this.seek_single_block(p_inizio);
        if (block1 !== null) {
            if (!block1.is_custom()) {
                block2 = this.seek_single_block(block1.get_data_end());
                if (block2 !== null) {
                    block1.append(block2);
                }
            }
        }
        return block1;
    };
    MSXBuffer.prototype.seek_single_block = function (p_inizio) {
        var pos1;
        var pos2;
        var block = null;
        pos1 = this.seek(BlockTypes.header_block, p_inizio);
        if (pos1 >= 0) {
            pos1 += BlockTypes.header_block.length;
            pos2 = this.seek(BlockTypes.header_block, pos1);
            if (pos2 < 0) {
                pos2 = this.length();
            }
            block = new MSXBlock(this.slice(pos1, pos2));
            block.set_data_begin(pos1);
            block.set_data_end(pos2);
        }
        else {
        }
        return block;
    };
    return MSXBuffer;
}(DataBuffer));
var MSXBlock = (function (_super) {
    __extends(MSXBlock, _super);
    function MSXBlock(p_data) {
        if (p_data === void 0) { p_data = undefined; }
        var _this = _super.call(this, p_data) || this;
        _this.system = "msx";
        return _this;
    }
    MSXBlock.prototype.set_name = function (p_name) {
        if (p_name.length > 6) {
            p_name = p_name.substring(0, 6);
        }
        this.name = p_name;
    };
    MSXBlock.prototype.get_name = function () {
        return this.name;
    };
    MSXBlock.prototype.set_type = function (p_type) {
        this.type = p_type;
    };
    MSXBlock.prototype.get_type = function () {
        return this.type;
    };
    MSXBlock.prototype.is_custom = function () {
        return (this.type == "custom");
    };
    MSXBlock.prototype.import = function (p_data) {
        this.data = p_data;
        this.type = this.analyze_block_type();
        if (!this.is_custom()) {
            this.set_name(this.analyze_block_name());
            var temp = new Uint8Array(p_data.length - 16);
            for (var i = 16; i < p_data.length; i++) {
                temp[i - 16] = p_data[i];
            }
            this.data = temp;
        }
        else {
            this.set_name("------");
        }
        this.length = this.data.length;
    };
    MSXBlock.prototype.analyze_block_type = function () {
        var block_type = "custom";
        if (this.contains(BlockTypes.ascii_file_block)) {
            block_type = "ascii";
        }
        else if (this.contains(BlockTypes.basic_file_block)) {
            block_type = "basic";
        }
        else if (this.contains(BlockTypes.binary_file_block)) {
            block_type = "binary";
        }
        return block_type;
    };
    MSXBlock.prototype.analyze_block_name = function () {
        var block_name = "";
        var begin = 10;
        for (var i = begin; i < begin + 6; i++) {
            block_name += String.fromCharCode(this.data[i]);
        }
        return block_name;
    };
    MSXBlock.prototype.is_ascii = function () {
        return this.type === "ascii";
    };
    MSXBlock.prototype.is_basic = function () {
        return this.type === "basic";
    };
    MSXBlock.prototype.is_binary = function () {
        return this.type === "binary";
    };
    return MSXBlock;
}(DataBlock));
var Cassette = (function () {
    function Cassette() {
    }
    Cassette.prototype.load = function (p_buffer, callback_function) {
        if (callback_function === void 0) { callback_function = undefined; }
        var buffer = new DataBuffer(p_buffer);
        return this.analyse(buffer);
    };
    Cassette.prototype.analyse = function (buffer, callback_function) {
        if (callback_function === void 0) { callback_function = undefined; }
        return [];
    };
    return Cassette;
}());
var MSX = (function (_super) {
    __extends(MSX, _super);
    function MSX() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MSX.prototype.load = function (p_buffer, callback_function) {
        if (callback_function === void 0) { callback_function = undefined; }
        var buffer;
        var list;
        buffer = new MSXBuffer(p_buffer);
        list = this.analyse(buffer, callback_function);
        if (list.length > 0) {
        }
        return list;
    };
    MSX.prototype.analyse = function (buffer, callback_function) {
        var pos = 0;
        var block = undefined;
        var found = false;
        var list = [];
        while (block !== null) {
            if (pos !== 0) {
            }
            block = buffer.extract_block(pos);
            if (block !== null) {
                found = true;
                list.push(block);
                if (typeof callback_function === "function") {
                    callback_function(block);
                }
                pos = block.get_data_end();
            }
        }
        return list;
    };
    return MSX;
}(Cassette));
var WAVBuffer = (function () {
    function WAVBuffer() {
        this.buffer = [];
    }
    WAVBuffer.prototype.push = function (data) {
        for (var i = 0; i < data.length; i++) {
            this.buffer.push(data[i]);
        }
    };
    WAVBuffer.prototype.export = function () {
        return this.buffer;
    };
    return WAVBuffer;
}());
var MSXWAVExporter = (function () {
    function MSXWAVExporter() {
        this.on_block_conversion = undefined;
        this.frequenza = 44100;
        this.bitrate = 2205;
        this.ampiezza = 0.85;
        this.sincronismo_lungo = 2500;
        this.sincronismo_corto = 1500;
        this.silenzio_lungo = 2000;
        this.silenzio_corto = 1250;
        this.build_waveforms();
    }
    MSXWAVExporter.prototype.build_waveforms = function () {
        this.campionamenti = this.frequenza / this.bitrate;
        var passo = Math.floor(this.campionamenti / 4);
        var max = Math.floor(255 * this.ampiezza);
        var min = 255 - max;
        var i, j;
        var pos;
        this.wave_bit_0 = new Uint8Array(passo * 4);
        pos = 0;
        for (i = 0; i < passo * 2; i++) {
            this.wave_bit_0[pos] = min;
            pos += 1;
        }
        for (i = 0; i < passo * 2; i++) {
            this.wave_bit_0[pos] = max;
            pos += 1;
        }
        this.wave_bit_1 = new Uint8Array(passo * 4);
        pos = 0;
        for (j = 0; j < 2; j++) {
            for (i = 0; i < passo; i++) {
                this.wave_bit_1[pos] = min;
                pos += 1;
            }
            for (i = 0; i < passo; i++) {
                this.wave_bit_1[pos] = max;
                pos += 1;
            }
        }
        this.wave_silenzio = new Uint8Array(passo * 4);
        pos = 0;
        for (i = 0; i < passo * 4; i++) {
            this.wave_silenzio[pos] = 128;
            pos += 1;
        }
        var max_long_sync = this.bitrate
            * this.campionamenti
            * (this.sincronismo_lungo / 1000);
        max_long_sync = Math.floor(max_long_sync / this.campionamenti)
            * this.campionamenti;
        var max_short_sync = this.bitrate
            * this.campionamenti
            * this.sincronismo_corto / 1000;
        max_short_sync = Math.floor(max_short_sync / this.campionamenti)
            * this.campionamenti;
        this.wave_sincronismo_lungo = new Uint8Array(max_long_sync);
        this.wave_sincronismo_corto = new Uint8Array(max_short_sync);
        pos = 0;
        i = 0;
        while (i < max_long_sync) {
            this.wave_sincronismo_lungo.set(this.wave_bit_1, i);
            i += this.wave_bit_1.length;
        }
        i = 0;
        while (i < max_short_sync) {
            this.wave_sincronismo_corto.set(this.wave_bit_1, i);
            i += this.wave_bit_1.length;
        }
        var max_long_silence = this.bitrate
            * this.campionamenti
            * this.silenzio_lungo / 1000;
        max_long_silence = Math.floor(max_long_silence / this.campionamenti)
            * this.campionamenti;
        var max_short_silence = this.bitrate
            * this.campionamenti
            * this.silenzio_corto / 1000;
        max_short_silence = Math.floor(max_short_silence / this.campionamenti)
            * this.campionamenti;
        this.wave_silenzio_lungo = new Uint8Array(max_long_silence);
        this.wave_silenzio_corto = new Uint8Array(max_short_silence);
        i = 0;
        while (i < max_long_silence) {
            this.wave_silenzio_lungo.set(this.wave_silenzio, i);
            i += this.wave_silenzio.length;
        }
        i = 0;
        while (i < max_short_silence) {
            this.wave_silenzio_corto.set(this.wave_silenzio, i);
            i += this.wave_silenzio.length;
        }
    };
    MSXWAVExporter.prototype.inserisci_bit = function (p_bit) {
        if (p_bit === 0) {
            this.buffer.push(this.wave_bit_0);
        }
        else if (p_bit === 1) {
            this.buffer.push(this.wave_bit_1);
        }
        else {
            this.buffer.push(this.wave_silenzio);
        }
    };
    MSXWAVExporter.prototype.inserisci_byte = function (p_byte) {
        this.inserisci_bit(0);
        for (var i = 0; i < 8; i++) {
            if ((p_byte & 1) == 0) {
                this.inserisci_bit(0);
            }
            else {
                this.inserisci_bit(1);
            }
            p_byte = p_byte >> 1;
        }
        this.inserisci_bit(1);
        this.inserisci_bit(1);
    };
    MSXWAVExporter.prototype.inserisci_array = function (p_array) {
        for (var i = 0; i < p_array.length; i++) {
            this.inserisci_byte(p_array[i]);
        }
    };
    MSXWAVExporter.prototype.inserisci_stringa = function (p_stringa) {
        for (var i = 0; i < p_stringa.length; i++) {
            this.inserisci_byte(p_stringa.charCodeAt(i));
        }
    };
    MSXWAVExporter.prototype.inserisci_sincronismo = function (p_durata) {
        if (p_durata == this.sincronismo_lungo) {
            this.buffer.push(this.wave_sincronismo_lungo);
        }
        else if (p_durata == this.sincronismo_corto) {
            this.buffer.push(this.wave_sincronismo_corto);
        }
        else {
            var i = 0;
            while (i < this.bitrate * this.campionamenti * p_durata / 1000) {
                this.inserisci_bit(1);
                i += this.wave_bit_1.length;
            }
        }
    };
    MSXWAVExporter.prototype.add_long_sync = function () {
        this.buffer.push(this.wave_sincronismo_lungo);
    };
    MSXWAVExporter.prototype.add_short_sync = function () {
        this.buffer.push(this.wave_sincronismo_corto);
    };
    MSXWAVExporter.prototype.add_silence = function (p_durata) {
        if (p_durata == this.silenzio_lungo) {
            this.buffer.push(this.wave_silenzio_lungo);
        }
        else if (p_durata == this.silenzio_corto) {
            this.buffer.push(this.wave_silenzio_corto);
        }
        else {
            var i = 0;
            while (i < this.bitrate * this.campionamenti * p_durata / 1000) {
                this.inserisci_bit(-1);
                i += this.wave_silenzio.length;
            }
        }
    };
    MSXWAVExporter.prototype.add_long_silence = function () {
        this.buffer.push(this.wave_silenzio_lungo);
    };
    MSXWAVExporter.prototype.add_short_silence = function () {
        this.buffer.push(this.wave_silenzio_corto);
    };
    MSXWAVExporter.prototype.render_block = function (p_blocco) {
        this.add_long_sync();
        if (p_blocco.type == "ascii") {
            this.inserisci_array(BlockTypes.ascii_file_block);
        }
        else if (p_blocco.type == "basic") {
            this.inserisci_array(BlockTypes.basic_file_block);
        }
        else if (p_blocco.type == "binary") {
            this.inserisci_array(BlockTypes.binary_file_block);
        }
        if (p_blocco.type != "custom") {
            this.inserisci_stringa(p_blocco.name);
            this.add_short_silence();
            this.add_short_sync();
        }
        this.inserisci_array(p_blocco.data);
        return true;
    };
    MSXWAVExporter.prototype.render_as_wav = function (p_list) {
        var i;
        var length;
        this.buffer = new WAVBuffer();
        this.add_short_silence();
        i = 0;
        for (var _i = 0, p_list_1 = p_list; _i < p_list_1.length; _i++) {
            var block = p_list_1[_i];
            i += 1;
            if (typeof this.on_block_conversion !== "undefined") {
                this.on_block_conversion(i, p_list.length);
            }
            this.render_block(block);
            if (i < p_list.length) {
                this.add_long_silence();
            }
        }
        this.add_short_silence();
        return this.create_wav();
    };
    MSXWAVExporter.prototype.create_wav = function () {
        var wav_exporter = new RIFFWAVE();
        var gigetto = this.buffer.export();
        wav_exporter.header.sampleRate = this.frequenza;
        wav_exporter.header.numChannels = 1;
        wav_exporter.Make(gigetto);
        return wav_exporter;
    };
    return MSXWAVExporter;
}());
var WAVExporter = (function () {
    function WAVExporter() {
        this.msx = new MSXWAVExporter();
    }
    WAVExporter.prototype.render = function (p_list) {
        this.wav = this.msx.render_as_wav(p_list);
    };
    WAVExporter.prototype.export = function () {
        return this.wav.dataURI;
    };
    return WAVExporter;
}());
var Player = (function () {
    function Player(p_list, callback) {
        if (callback === void 0) { callback = undefined; }
        this.on_job_completed = callback;
        this.audio = new Audio();
        this.exporter = new WAVExporter();
        this.exporter.render(p_list);
        this.audio.src = this.exporter.export();
        if (typeof this.on_job_completed !== "undefined") {
            this.on_job_completed(p_list);
        }
    }
    Player.prototype.play = function () {
        this.audio.play();
    };
    Player.prototype.pause = function () {
        this.audio.pause();
    };
    Player.prototype.stop = function () {
        this.audio.pause();
        this.audio.currentTime = 0;
    };
    Player.prototype.save = function () {
        var data = this.exporter.export();
        if (typeof data !== "undefined") {
            if (typeof this.on_audio_export !== "undefined") {
                this.on_audio_export(data);
            }
            else {
                return false;
            }
        }
        else {
            if (typeof this.on_error !== "undefined") {
                this.on_error("File I/O Error");
            }
            return false;
        }
        return true;
    };
    return Player;
}());
var CassetteJS = (function () {
    function CassetteJS() {
        this.on_load = undefined;
        this.on_block_analysis = undefined;
        this.on_job_completed = undefined;
        this.on_error = undefined;
        this.on_audio_export = undefined;
        this.list = [];
        this.initialize();
    }
    CassetteJS.prototype.initialize = function () {
        this.name = "";
        this.msx = new MSX();
    };
    CassetteJS.prototype.load_from_local_file = function (p_file) {
        var request = new FileReader();
        var self = this;
        request.onloadend = function (e) {
            if (e.target.readyState == FileReader.DONE) {
                if (typeof self.on_load === "function") {
                    self.on_load(request.result.byteLength);
                }
                self.name = p_file.name
                    .toLowerCase()
                    .replace(".cas", "");
                var buffer = new Uint8Array(request.result);
                self.list = self.msx.load(buffer, self.on_block_analysis);
                if (self.list.length > 0) {
                    self.player = new Player(self.list, self.on_job_completed);
                    self.player.on_audio_export = self.on_audio_export;
                    return true;
                }
                else {
                    if (typeof self.on_error === "function") {
                        self.on_error(buffer);
                    }
                    return false;
                }
            }
        };
        request.readAsArrayBuffer(p_file);
    };
    CassetteJS.prototype.load_from_remote_file = function (p_url, response) {
        var self = this;
        if (typeof self.on_load === "function") {
            self.on_load(response.byteLength);
        }
        self.name = p_url
            .toLowerCase()
            .replace(".cas", "");
        this.list = self.msx.load(response, self.on_block_analysis);
        if (this.list.length > 0) {
            this.player = new Player(this.list, this.on_job_completed);
            this.player.on_audio_export = this.on_audio_export;
            return true;
        }
        else {
            if (typeof this.on_error === "function") {
                this.on_error();
            }
            return false;
        }
    };
    CassetteJS.prototype.load_from_buffer = function (p_buffer) {
        var result = false;
        this.list = this.msx.load(p_buffer, this.on_block_analysis);
        if (this.list.length > 0) {
            this.player = new Player(this.list, this.on_job_completed);
            this.player.on_audio_export = this.on_audio_export;
            result = true;
        }
        return result;
    };
    CassetteJS.prototype.get_block = function (p_index) {
        return this.list[p_index];
    };
    CassetteJS.prototype.get_length = function () {
        return this.list.length;
    };
    return CassetteJS;
}());
if (typeof module !== "undefined") {
    module.exports = CassetteJS;
}
//# sourceMappingURL=cassettejs.js.map