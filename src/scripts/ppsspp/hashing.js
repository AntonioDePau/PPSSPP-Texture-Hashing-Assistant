import xxh32 from '../system/hashing/xxh32.js';
import xxh64 from '../system/hashing/xxh64.js';
import { bigInt } from '../system/numbers.js';

function getTextureHash(textureBytes){
  const textureSeed = 0xBACD7814;
  const textureHash = (xxh64(textureBytes, textureSeed) & bigInt(0xffffffff)).toString(16);

  return textureHash;
}

function getClutHash(paletteBytes, texture_width = 128, texture_height = 128, clutFormat = 0x3){
  const clutSeed = 0xC0108888;
  const clutBytesHash = bigInt(`${xxh32(paletteBytes, clutSeed)}`);

  const fullClutFormat = bigInt(`${0xc5000000}`) ^ bigInt(0xff00) ^ bigInt(`${clutFormat}`);
  /*
    clutFormat always starts with 0xc5(?), 0xff represents the clut index mask (none).
    BitsPerPixel and color order can be any of the following:

      enum GEPaletteFormat : uint8_t {
        GE_CMODE_16BIT_BGR5650,     // 0x0
        GE_CMODE_16BIT_ABGR5551,    // 0x1
        GE_CMODE_16BIT_ABGR4444,    // 0x2
        GE_CMODE_32BIT_ABGR8888,    // 0x3
      };
  */

  const clutHashWithFormat = clutBytesHash ^ fullClutFormat;

  const dimensions = (Math.log2(texture_height) << 8) ^ Math.log2(texture_width);
  const clutHash = (bigInt(`${dimensions}`) ^ bigInt(`${clutHashWithFormat}`)).toString(16);

  return clutHash;
}

export default function getFilename(textureBytes, paletteBytes, width = 128, height = 128, bpp = 0x3, withExtension = true){
  const textureHash = getTextureHash(textureBytes);
  const clutHash = getClutHash(paletteBytes, width, height, bpp);

  return `00000000${clutHash.padStart(8, '0')}${textureHash.padStart(8, '0')}${withExtension ? '.png' : ''}`;
}

export { getClutHash, getTextureHash };