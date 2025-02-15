const Endianness = {
  LITTLE: 'LITTLE',
  BIG: 'BIG'
}

export const SeekOrigin = {
  Begin: 'Begin',
  Current: 'Current',
  End: 'End'
}

export class BitConverter{
  static ToShort = (bytes) => {
    return (bytes[0] << 8) ^ bytes[1];
  }

  static ToInt = (bytes) => {
    return (((bytes[0] << 24) ^ (bytes[1] << 16)) ^ (bytes[2] << 8)) ^ bytes[3];
  }
}

export default class BinaryReader{
  #index = 0;
  #bytes = [];

  constructor(uint8array){
    this.Endianness = Endianness.LITTLE;
    this.#bytes = [...uint8array];
  }

  get Position(){
    return this.#index;
  }

  get Length(){
    return this.#bytes.length;
  }

  Seek = (position, from = SeekOrigin.Begin) => {
    switch(from){
      case SeekOrigin.Current:
        this.#index += position;
        break;

      case SeekOrigin.End:
        this.#index = this.#bytes.length - position;
        break;

      default:
        this.#index = position;
        break;
    }
    return this.#index;
  }

  #ApplyEndianness = (bytes) => {
    if(this.Endianness === Endianness.LITTLE) return bytes.reverse();

    return bytes;
  }

  ReadBytes = (length) => {
    const bytes = this.#bytes.slice(this.#index, this.#index + length);

    this.#index += length;

    return bytes;
  }

  ReadByte = () => {
    return this.ReadBytes(1)[0];
  }

  ReadShort = () => {
    const bytes = this.#ApplyEndianness(this.ReadBytes(2));
    return BitConverter.ToShort(bytes);
  }

  ReadInt = () => {
    const bytes = this.#ApplyEndianness(this.ReadBytes(4));
    return BitConverter.ToInt(bytes);
  }

  ReadLong = () => {
    // To do: implement ReadLong if relevant
  }
}

export class BigEndianBinaryReader extends BinaryReader{
  constructor(uint8array){
    super(uint8array);

    this.Endianness = Endianness.BIG;
  }
}