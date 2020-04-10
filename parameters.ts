class MSXTapeParameters {

    blocco_intestazione = new Uint8Array([0x1F, 0xA6, 0xDE, 0xBA,
                                                      0xCC, 0x13, 0x7D, 0x74]);

    blocco_file_ascii = new Uint8Array([0xEA, 0xEA, 0xEA, 0xEA, 0xEA,
                                                    0xEA, 0xEA, 0xEA, 0xEA, 0xEA]);

    blocco_file_basic = new Uint8Array([0xD3, 0xD3, 0xD3, 0xD3, 0xD3,
                                                    0xD3, 0xD3, 0xD3, 0xD3, 0xD3]);
    blocco_file_binario = new Uint8Array([0xD0, 0xD0, 0xD0, 0xD0, 0xD0,
                                                      0xD0, 0xD0, 0xD0, 0xD0, 0xD0]);




}
