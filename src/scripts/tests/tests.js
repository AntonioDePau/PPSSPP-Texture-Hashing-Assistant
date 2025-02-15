import getFilename, { getClutHash, getTextureHash } from "../ppsspp/hashing.js";
import NOW_LOAD_HTX from "../../sample_data/NOW_LOAD.HTX.js";
import TITLE_HTX from "../../sample_data/TITLE.HTX.js";
import ME_04_HTX from "../../sample_data/ME_04.HTX.js";
import CO_FBCS_HTX from "../../sample_data/CO_FBCS.HTX.js";
import HTX from "../loa/htx.js";

function Match(entry, expected, received, debug){
  const success = expected === received;

  if(debug){
    console.log(`${entry} match:` , success);
    console.log(`Expected:`, expected);
    console.log(`Got     :`, received);
  }

  console.assert(success, ` Expected ${entry.toLowerCase()} '${expected}' got '${received}' instead!`);

  return success;
}

function TestTextureHashing(bytes, debug = false){
  if(debug) console.log('--- Texture data hash test ---\n');

  const expectedTextureHash = '0x5ffdb0c4';
  const textureHash = `0x${getTextureHash(bytes).toString(16)}`;

  return Match('Texture data hash', expectedTextureHash, textureHash, debug);
}

function TestClutHashing(bytes, width, height, format, debug = false){
  if(debug) console.log('\n--- Clut data hash test ---\n');

  const expectedClutHash = '0x3f62112c';
  const clutHash = `0x${getClutHash(bytes, width, height, format).toString(16)}`;

  return Match('Clut hash', expectedClutHash, clutHash, debug);
}

function TestFilename(textureBytes, paletteBytes, debug = false){
  if(debug) console.log('\n--- Texture filename test ---\n');

  const expectedFilename = '000000003f62112c5ffdb0c4.png';
  const filename = getFilename(textureBytes, paletteBytes);

  return Match('Filename', expectedFilename, filename, debug);
}

function TestLOAFile(file, debug = false){
  const htx = new HTX(file);

  return !htx.textures.map((entry, index) => {
    const expectedName = file.hashes[index];
    if(expectedName === null) return true;

    const filename = getFilename(new Uint8Array(entry.textureBytes), new Uint8Array(entry.paletteBytes), entry.width, entry.height, 3);

    return Match(`hashname for file ${entry.name}`, expectedName, filename, debug);
  }).find(x => !x);
}

function RunAllTests(textureBytes, clutBytes, debug = false){
  if((
    TestTextureHashing(textureBytes, debug) ===
    TestClutHashing(clutBytes, 128, 128, 3, debug) ===
    TestFilename(textureBytes, clutBytes, debug) ===
    TestLOAFile(ME_04_HTX) ===
    TestLOAFile(TITLE_HTX) ===
    TestLOAFile(NOW_LOAD_HTX) ===
    TestLOAFile(CO_FBCS_HTX)
  ) !== true) return;

  console.info(`All tests ran successfully!`);
}

const Tests = {
  TextureHashing: TestTextureHashing,
  ClutHashing: TestClutHashing,
  Filename: TestFilename,
  RunAll: RunAllTests
}

export default Tests;