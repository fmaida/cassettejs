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
            let n = (src[i] << 16) | (src[i + 1] << 8) | src[i + 2];
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
var RIFFWAVE = function (data = undefined) {
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
class MSXTapeParameters {
    constructor() {
        this.blocco_intestazione = new Uint8Array([0x1F, 0xA6, 0xDE, 0xBA,
            0xCC, 0x13, 0x7D, 0x74]);
        this.blocco_file_ascii = new Uint8Array([0xEA, 0xEA, 0xEA, 0xEA, 0xEA,
            0xEA, 0xEA, 0xEA, 0xEA, 0xEA]);
        this.blocco_file_basic = new Uint8Array([0xD3, 0xD3, 0xD3, 0xD3, 0xD3,
            0xD3, 0xD3, 0xD3, 0xD3, 0xD3]);
        this.blocco_file_binario = new Uint8Array([0xD0, 0xD0, 0xD0, 0xD0, 0xD0,
            0xD0, 0xD0, 0xD0, 0xD0, 0xD0]);
    }
}
class DataBlock {
    constructor(p_data = null) {
        if (p_data !== null)
            this.set_data(p_data);
    }
    set_name(p_name) {
        if (p_name.length > 6) {
            p_name = p_name.substring(0, 6);
        }
        this.name = p_name;
    }
    get_name() {
        return this.name;
    }
    set_type(p_type) {
        this.type = p_type;
    }
    get_type() {
        return this.type;
    }
    is_custom() {
        return (this.type == "custom");
    }
    set_data(p_data) {
        this.data = p_data;
        this.type = this.analyze_block_type();
        if (!this.is_custom()) {
            this.set_name(this.analyze_block_name());
            let temp = Array(p_data.length - 16);
            for (let i = 16; i < p_data.length; i++) {
                temp[i - 16] = p_data[i];
            }
            this.data = temp;
        }
    }
    append_block(p_block) {
        let data = new Array(this.data.length + p_block.data.length);
        let offset = 0;
        for (let i = 0; i < this.data.length; i++) {
            data[offset + i] = this.data[i];
        }
        offset += this.data.length;
        for (let i = 0; i < p_block.data.length; i++) {
            data[offset + i] = p_block.data[i];
        }
        this.data = data;
        this.set_data_end(p_block.get_data_end());
    }
    contains(p_pattern) {
        let match = true;
        for (let i = 0; i < p_pattern.length; i++) {
            if (this.data[i] !== p_pattern[i]) {
                match = false;
                i = p_pattern.length;
            }
        }
        return match;
    }
    analyze_block_type() {
        var block_type = "custom";
        if (this.contains(BlockTypes.blocco_file_ascii)) {
            block_type = "ascii";
        }
        else if (this.contains(BlockTypes.blocco_file_basic)) {
            block_type = "basic";
        }
        else if (this.contains(BlockTypes.blocco_file_binario)) {
            block_type = "binary";
        }
        return block_type;
    }
    analyze_block_name() {
        var block_name = "";
        var begin = 10;
        for (let i = begin; i < begin + 6; i++) {
            block_name += String.fromCharCode(this.data[i]);
        }
        return block_name;
    }
    get_data() {
        return this.data;
    }
    set_data_begin(p_value) {
        this.data_begin = p_value;
    }
    get_data_begin() {
        return this.data_begin;
    }
    set_data_end(p_value) {
        this.data_end = p_value;
    }
    get_data_end() {
        return this.data_end;
    }
    get_data_length() {
        let length = this.data_end - this.data_begin;
        if (length < 0) {
            length = -1;
        }
        return length;
    }
}
class WAVExport {
    constructor(p_list) {
        this.frequenza = 44100;
        this.bitrate = 2205;
        this.ampiezza = 0.90;
        this.sincronismo_lungo = 2500;
        this.sincronismo_corto = 1500;
        this.silenzio_lungo = 2000;
        this.silenzio_corto = 1250;
        this.recalculate_waveforms();
        this.buffer = [];
    }
    recalculate_waveforms() {
        this.campionamenti = this.frequenza / this.bitrate;
        let passo = Math.floor(this.campionamenti / 4);
        let max = Math.floor(255 * this.ampiezza);
        let min = 255 - max;
        let i;
        this.wave_bit_0 = new Array();
        for (i = 0; i < passo * 2; i++)
            this.wave_bit_0.push(min);
        for (i = 0; i < passo * 2; i++)
            this.wave_bit_0.push(max);
        this.wave_bit_1 = new Array();
        for (i = 0; i < passo; i++)
            this.wave_bit_1.push(min);
        for (i = 0; i < passo; i++)
            this.wave_bit_1.push(max);
        for (i = 0; i < passo; i++)
            this.wave_bit_1.push(min);
        for (i = 0; i < passo; i++)
            this.wave_bit_1.push(max);
        this.wave_silenzio = new Array();
        for (i = 0; i < passo * 4; i++)
            this.wave_silenzio.push(128);
    }
    inserisci_bit(p_bit) {
        let i = 0;
        let waveform;
        if (p_bit === 0) {
            waveform = this.wave_bit_0;
        }
        else if (p_bit === 1) {
            waveform = this.wave_bit_1;
        }
        else {
            waveform = this.wave_silenzio;
        }
        this.buffer.push(...waveform);
    }
    inserisci_byte(p_byte) {
        this.inserisci_bit(0);
        for (let i = 0; i < 8; i++) {
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
    }
    inserisci_array(p_array) {
        var i = 0;
        for (i = 0; i < p_array.length; i++) {
            this.inserisci_byte(p_array[i]);
        }
    }
    inserisci_stringa(p_stringa) {
        var i = 0;
        for (i = 0; i < p_stringa.length; i++) {
            this.inserisci_byte(p_stringa.charCodeAt(i));
        }
    }
    inserisci_sincronismo(p_durata) {
        let i = 0;
        while (i < this.bitrate * this.campionamenti * p_durata / 1000) {
            this.inserisci_bit(1);
            i += this.wave_bit_1.length;
        }
    }
    add_silence(p_durata) {
        let i = 0;
        while (i < this.bitrate * this.campionamenti * p_durata / 1000) {
            this.inserisci_bit(-1);
            i += this.wave_silenzio.length;
        }
    }
    add_long_silence() {
        this.add_silence(this.silenzio_lungo);
    }
    add_short_silence() {
        this.add_silence(this.silenzio_corto);
    }
    render_block(p_blocco) {
        this.inserisci_sincronismo(this.sincronismo_lungo);
        if (p_blocco.type == "ascii") {
            this.inserisci_array(BlockTypes.blocco_file_ascii);
        }
        else if (p_blocco.type == "basic") {
            this.inserisci_array(BlockTypes.blocco_file_basic);
        }
        else if (p_blocco.type == "binary") {
            this.inserisci_array(BlockTypes.blocco_file_binario);
        }
        if (p_blocco.type != "custom") {
            this.inserisci_stringa(p_blocco.name);
            this.add_silence(this.silenzio_corto);
            this.inserisci_sincronismo(this.sincronismo_corto);
        }
        this.inserisci_array(p_blocco.data);
        return true;
    }
    export_as_wav() {
        let wav_exporter = new RIFFWAVE();
        wav_exporter.header.sampleRate = this.frequenza;
        wav_exporter.header.numChannels = 1;
        wav_exporter.Make(this.buffer);
        return wav_exporter;
    }
}
class BlockTypes {
}
BlockTypes.blocco_intestazione = [0x1F, 0xA6, 0xDE, 0xBA, 0xCC, 0x13, 0x7D, 0x74];
BlockTypes.blocco_file_ascii = [0xEA, 0xEA, 0xEA, 0xEA, 0xEA, 0xEA,
    0xEA, 0xEA, 0xEA, 0xEA];
BlockTypes.blocco_file_basic = [0xD3, 0xD3, 0xD3, 0xD3, 0xD3,
    0xD3, 0xD3, 0xD3, 0xD3, 0xD3];
BlockTypes.blocco_file_binario = [0xD0, 0xD0, 0xD0, 0xD0, 0xD0,
    0xD0, 0xD0, 0xD0, 0xD0, 0xD0];
class DataBuffer {
    constructor(p_dati) {
        this.carica(p_dati);
    }
    carica(p_dati) {
        this.dati = p_dati;
    }
    contiene(p_ricerca, p_inizio = 0) {
        let i = 0;
        let uguale = true;
        while ((i < p_ricerca.length) && (uguale)) {
            if (this.dati[p_inizio + i] !== p_ricerca[i]) {
                uguale = false;
            }
            i++;
        }
        return uguale;
    }
    cerca(p_ricerca, p_inizio = 0) {
        let i = p_inizio;
        let posizione = -1;
        let trovato = false;
        while ((i < this.dati.length) && (!trovato)) {
            if (this.contiene(p_ricerca, i)) {
                posizione = i;
                trovato = true;
            }
            i++;
        }
        return posizione;
    }
    splitta(p_inizio = 0, p_fine = this.dati.length) {
        let output;
        output = new Array(p_fine - p_inizio);
        if (typeof (this.dati.slice) !== "undefined") {
            output = this.dati.slice(p_inizio, p_fine);
        }
        else {
            for (let i = p_inizio; i < p_fine; i++) {
                output[i - p_inizio] = this.dati[i];
            }
        }
        return output;
    }
    length() {
        return this.dati.length;
    }
}
class MSX {
    constructor() {
        this.buffer = null;
    }
    cerca_blocco(p_inizio) {
        let pos1;
        let pos2;
        let block = null;
        pos1 = this.buffer.cerca(BlockTypes.blocco_intestazione, p_inizio);
        if (pos1 >= 0) {
            pos1 += BlockTypes.blocco_intestazione.length;
            pos2 = this.buffer.cerca(BlockTypes.blocco_intestazione, pos1);
            if (pos2 < 0) {
                pos2 = this.buffer.length();
            }
            block = new DataBlock(this.buffer.splitta(pos1, pos2));
            block.set_data_begin(pos1);
            block.set_data_end(pos2);
        }
        else {
        }
        return block;
    }
    estrai_blocco(p_inizio) {
        let block1;
        let block2;
        block1 = this.cerca_blocco(p_inizio);
        if (block1 !== null) {
            if (!block1.is_custom()) {
                block2 = this.cerca_blocco(block1.get_data_end());
                if (block2 !== null) {
                    block1.append_block(block2);
                }
            }
        }
        return block1;
    }
    load_blocks() {
        let pos = 0;
        let block;
        let found = false;
        this.list = [];
        while (block !== null) {
            if (pos !== 0) {
            }
            block = this.estrai_blocco(pos);
            if (block !== null) {
                found = true;
                this.list.push(block);
                pos = block.get_data_end();
            }
        }
        return found;
    }
    load(p_buffer, callback_function = undefined) {
        let result;
        this.buffer = new DataBuffer(p_buffer);
        result = this.load_blocks();
        if (result) {
            this.export_as_wav(callback_function);
        }
        return result;
    }
    export_as_wav(callback_function = undefined) {
        let i = 0;
        this.export = new WAVExport(this.list);
        for (let block of this.list) {
            i += 1;
            if (typeof callback_function !== "undefined") {
                callback_function(i, this.list.length);
            }
            this.export.render_block(block);
            if (i < this.list.length) {
                this.export.add_long_silence();
            }
        }
        return this.export.export_as_wav();
    }
}
class CassetteJS {
    constructor() {
        this.on_load = undefined;
        this.on_block_analysis = undefined;
        this.on_job_completed = undefined;
        this.on_error = undefined;
        this.on_audio_export = undefined;
        this.initialize();
    }
    initialize() {
        this.name = "";
        this.parameters = new MSXTapeParameters();
        this.msx = new MSX();
        this.audio = new Audio();
    }
    load_from_local_file(p_file) {
        let request = new FileReader();
        let self = this;
        request.onloadend = function (e) {
            if (e.target.readyState == FileReader.DONE) {
                if (typeof self.on_load !== "undefined") {
                    self.on_load(request.result.byteLength);
                }
                self.name = p_file.name
                    .toLowerCase()
                    .replace(".cas", "");
                let buffer = new Uint8Array(request.result);
                if (self.msx.load(buffer, self.on_block_analysis)) {
                    let audio_file = self.msx.export_as_wav();
                    self.audio.src = audio_file.dataURI;
                    if (typeof self.on_job_completed !== "undefined") {
                        self.on_job_completed(buffer.length);
                    }
                    return true;
                }
                else {
                    if (typeof self.on_error !== "undefined") {
                        self.on_error(buffer);
                    }
                    return false;
                }
            }
        };
        request.readAsArrayBuffer(p_file);
    }
    load_from_remote_file(p_url) {
        let self = this;
        if (typeof jQuery !== "undefined") {
            jQuery.get(p_url, function (buffer) {
                var buf = new ArrayBuffer(buffer.length * 2);
                var bufView = new Uint8Array(buf);
                for (let i = 0, strLen = buffer.length; i < strLen; i++) {
                    bufView[i] = buffer.charCodeAt(i);
                }
                if (self.load_from_buffer(bufView)) {
                    if (typeof self.on_job_completed !== "undefined") {
                        self.on_job_completed(buffer);
                    }
                }
            });
            return true;
        }
        else {
            return false;
        }
    }
    load_from_buffer(p_buffer) {
        let result;
        this.msx = new MSX();
        result = this.msx.load(p_buffer, this.on_block_analysis);
        if (result) {
            let audio_file = this.msx.export_as_wav();
            this.audio.src = audio_file.dataURI;
        }
        return result;
    }
    play() {
        this.audio.play();
    }
    pause() {
        this.audio.pause();
    }
    stop() {
        this.audio.pause();
        this.audio.currentTime = 0;
    }
    save_as_wav() {
        let data = this.msx.export_as_wav().dataURI;
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
                this.on_error(null);
            }
            return false;
        }
        return true;
    }
}
if (typeof module !== "undefined") {
    module.exports = CassetteJS;
}
function data_uri_to_blob(dataURI) {
    let byteString;
    if (dataURI.split(',')[0].indexOf('base64') >= 0)
        byteString = atob(dataURI.split(',')[1]);
    else
        byteString = unescape(dataURI.split(',')[1]);
    let mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    let ia = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ia], { type: mimeString });
}
function export_as_file(p_self) {
    return new Blob([data_uri_to_blob(p_self.wave.dataURI)]);
}
//# sourceMappingURL=cassettejs.js.map