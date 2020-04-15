const MSXTape = require("./dist/cassettejs");
const fs = require("fs");


test("Check if the class is defined", () => {
    expect(MSXTape).toBeDefined();
    /* expect(msxtape). */
});

test("Check if a file can be loaded (Road Fighter)", () => {
    road_fighter = fs.readFileSync("examples/roadf.cas");
    msx_tape = new MSXTape();
    msx_tape.load_from_buffer(road_fighter);
    expect(msx_tape.get_length()).toBe(2);
    expect(msx_tape.get_block(0).system).toBe("msx");
    expect(msx_tape.get_block(0).is_ascii()).toBe(true);
    expect(msx_tape.get_block(0).name).toBe("ROAD  ");
    expect(msx_tape.get_block(1).system).toBe("msx");
    expect(msx_tape.get_block(1).is_binary()).toBe(true);
    expect(msx_tape.get_block(1).name).toBe("GAME  ");
});

test("Check if a file can be loaded (Guttblaster)", () => {
    guttblaster = fs.readFileSync("examples/guttblaster.cas");
    msx_tape = new MSXTape();
    msx_tape.load_from_buffer(guttblaster);
    expect(msx_tape.get_length()).toBe(11);
    expect(msx_tape.get_block(0).is_ascii()).toBe(true);
    expect(msx_tape.get_block(0).name).toBe("GUTT  ");
    expect(msx_tape.get_block(1).is_binary()).toBe(true);
    expect(msx_tape.get_block(1).name).toBe("PRG-LO");
    expect(msx_tape.get_block(2).is_custom()).toBe(true);
    expect(msx_tape.get_block(3).is_custom()).toBe(true);
    expect(msx_tape.get_block(4).is_custom()).toBe(true);
    expect(msx_tape.get_block(5).is_custom()).toBe(true);
    expect(msx_tape.get_block(6).is_custom()).toBe(true);
    expect(msx_tape.get_block(7).is_custom()).toBe(true);
    expect(msx_tape.get_block(8).is_custom()).toBe(true);
    expect(msx_tape.get_block(9).is_custom()).toBe(true);
    expect(msx_tape.get_block(10).is_custom()).toBe(true);
});

test("Check if a file can be loaded (Pac-mania)", () => {
    guttblaster = fs.readFileSync("examples/pacmania.cas");
    msx_tape = new MSXTape();
    msx_tape.load_from_buffer(guttblaster);
    expect(msx_tape.get_length()).toBe(6);
    expect(msx_tape.get_block(0).is_binary()).toBe(true);
    expect(msx_tape.get_block(0).name).toBe("pac   ");
    expect(msx_tape.get_block(1).is_custom()).toBe(true);
    expect(msx_tape.get_block(2).is_custom()).toBe(true);
    expect(msx_tape.get_block(3).is_custom()).toBe(true);
    expect(msx_tape.get_block(4).is_custom()).toBe(true);
    expect(msx_tape.get_block(5).is_custom()).toBe(true);
});
