import BinaryReader, { BitConverter } from "../system/binary";

class Texture{
  name = 'Unknown';
  bpp = 0;
  width = 0;
  height = 0;
  dataOffset = 0;
  dataLength = 0;
  paletteOffset = 0;
  paletteLength = 0;
  textureBytes = [];
  paletteBytes = [];

  constructor(name, debug){
    this.name = name;
    this.debug = debug;
    this.clutformat = 3;
  }

  ParseInfo = (br) => {
    this.bpp = br.ReadShort();

    if(this.bpp !== 4 && this.bpp !== 5){
      throw Error(`Unknown BPP value for texture '${this.name}': ${this.bpp}`);
    }

    br.ReadShort();
    br.ReadInt();
    br.ReadInt();

    const extraInfoOffset = br.ReadInt();

    br.Seek(extraInfoOffset);

    this.width = br.ReadShort();
    this.height = br.ReadShort();
  
    br.ReadInt();

    this.dataOffset = br.ReadInt();
    this.dataLength = this.width * this.height;

    if(this.bpp === 4) this.dataLength = this.dataLength / 2;

    this.paletteLength = extraInfoOffset - this.paletteOffset;

    br.Seek(this.dataOffset);

    this.textureBytes = br.ReadBytes(this.dataLength);

    br.Seek(this.paletteOffset);

    this.paletteBytes = br.ReadBytes(this.paletteLength);
  }
}

export default class HTX{
  textures = [];

  constructor(file, debug = false){
    if(debug) console.log('Parsing HTX file:', file.name);

    const br = new BinaryReader(file.bytes);
    const signature = BitConverter.ToInt(br.ReadBytes(4));
    const expectedSignature = 0x5845542e;

    if(signature !== expectedSignature){
      if(debug) console.log('Not a valid XET files!');
      if(debug) console.log('Expected:', expectedSignature.toString(16));
      if(debug) console.log('Got:', signature.toString(16));
      return;
    }

    if(debug) console.log('Valid HTX file!');

    br.Seek(0x08);

    const fileCount = br.ReadShort();
    if(debug) console.log('File count:', fileCount);

    br.Seek(0x10);

    const fileListOffset = br.ReadInt();
    const fileInfoOffset = br.ReadInt();
    const fileNameOffset = br.ReadInt();

    if(debug) console.log('File list offset:', '0x' + fileListOffset.toString(16));
    if(debug) console.log('File info offset:', '0x' + fileInfoOffset.toString(16));
    if(debug) console.log('File name offset:', '0x' + fileNameOffset.toString(16));

    br.Seek(fileNameOffset);

    for(let i = 0; i < fileCount; i++){
      const name = [];

      let char = 0x0;

      while((char = br.ReadByte()) !== 0x0){
        name.push(String.fromCharCode(char));
      }

      const path = `${file.path.replace(/\.(.+)$/, '')}/${name.join('')}.png`;

      this.textures.push(new Texture(path, debug));

      continue;
    }

    for(let i = 0; i < fileCount; i++){
      const texture = this.textures[i];

      br.Seek(fileInfoOffset + (i * 0x08));

      br.ReadInt();
      texture.paletteOffset = br.ReadInt();

      br.Seek(fileListOffset + (i * 0x10));

      texture.ParseInfo(br);
    }

    if(debug) console.log(this.textures);
  }
}