const MSXTape = require("./build/msxtape");
const fs = require("fs");


test("Check if the class is defined", () => {
    expect(MSXTape).toBeDefined();
    /* expect(msxtape). */
});
test("Check if a file can be loaded (Road Fighter)", () => {
    road_fighter = fs.readFileSync("examples/roadf.cas");
    msx_tape = new MSXTape();
    expect(msx_tape.load_from_buffer(road_fighter)).toBe(true);
    expect(msx_tape.msx.list[0].type).toBe("ascii");
    expect(msx_tape.msx.list[0].name).toBe("ROAD  ");
    expect(msx_tape.msx.list[1].type).toBe("binary");
    expect(msx_tape.msx.list[1].name).toBe("GAME  ");
});
test("Check if a file can be loaded (Guttblaster)", () => {
    guttblaster = fs.readFileSync("examples/guttblaster.cas");
    msx_tape = new MSXTape();
    expect(msx_tape.load_from_buffer(guttblaster)).toBe(true);
    expect(msx_tape.msx.list[0].type).toBe("ascii");
    expect(msx_tape.msx.list[0].name).toBe("GUTT  ");
    expect(msx_tape.msx.list[1].type).toBe("binary");
    expect(msx_tape.msx.list[1].name).toBe("PRG-LO");
    expect(msx_tape.msx.list[2].type).toBe("custom");
    expect(msx_tape.msx.list[3].type).toBe("custom");
    expect(msx_tape.msx.list[4].type).toBe("custom");
    expect(msx_tape.msx.list[5].type).toBe("custom");
    expect(msx_tape.msx.list[6].type).toBe("custom");
    expect(msx_tape.msx.list[7].type).toBe("custom");
    expect(msx_tape.msx.list[8].type).toBe("custom");
    expect(msx_tape.msx.list[9].type).toBe("custom");
    expect(msx_tape.msx.list[10].type).toBe("custom");
});

