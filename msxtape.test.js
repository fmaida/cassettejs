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
});
test("Check if a file can be loaded (Guttblaster)", () => {
    guttblaster = fs.readFileSync("examples/guttblaster.cas");
    msx_tape = new MSXTape();
    expect(msx_tape.load_from_buffer(guttblaster)).toBe(true);
});
