const sampleCode = `(file) => {
  /*
    Guidelines:
    - Your script must be encapsulated within the '(file) => {<your script>}' function
    - That function must return an object with the 'textures' property (see also the 'TextureArchive' class below),
      which represent an array of textures contained within the file being parsed:
        {
          textures: []
        }
      Any returned object that is null, or does not have a 'textures' property, or which 'textures' property's length is 0 will be ignored.
        
      This 'textures' array must contain objects with the following properties (see also the sample 'Texture' class below):
        {
          name: '<name of the texture>',  // This is what your .png file will be named
          width: 128,                     // The width of the texture
          height: 128,                    // The height of the texture
          clutformat: 3,                  // Usually 3, but could be 0, 1, or 2 depending on your game?
          textureBytes: [],               // The array of bytes representing the palette indices
          paletteBytes: []                // The array of bytes representing the palette colors
        }
    - You have access to the 'BinaryReader' class (see example script below)
    - You have access to the set of methods available in the 'BitConverter' static class (see example script below)
    - You have access to the Encoding.ASCII.GetBytes method (see example script below)
  */

  class Texture{
    name = 'Unknown';
    clutformat = 3;
    width = 0;
    height = 0;
    textureBytes = [];
    paletteBytes = [];

    constructor(name){
      this.name = name;
    }
  }

  class TextureArchive{
    textures = [];

    constructor(file){
      console.log('Parsing texture archive:', file.name);

      // Create a new BinaryReader from the file's bytes
      const br = new BinaryReader(file.bytes);
      
      // Read the first 4 bytes and store them in a byte array
      const signatureBytes = br.ReadBytes(4);

      // Convert that byte array to an integer
      const signature = BitConverter.ToInt(signatureBytes);
      
      // Convert the string "TEX." to bytes
      const expectedSignatureBytes = Encoding.ASCII.GetBytes("TEX.");

      // Convert the bytes of the expected signature to an int
      const expectedSignature = BitConverter.ToInt(expectedSignatureBytes);

      if(signature !== expectedSignature){
        console.log('Not a valid texture file!');
        console.log('Expected:', expectedSignature.toString(16));
        console.log('Got:', signature.toString(16));
        return;
      }

      // Read the next 4 bytes as an integer
      const textureCount = br.ReadInt();
      
      // Change our position in the BinaryReader 0x08 bytes from our current position
      br.Seek(0x08, SeekOrigin.Current);
      
      for(let i = 0; i < textureCount; i++){
        const texture = new Texture(\`\${file.name.replace('.', \`_\${i}.\`)}\`);
        
        // Read the next 2 bytes as a short integer
        texture.width = br.ReadShort();

        texture.height = br.ReadShort();
        texture.textureBytes = br.ReadBytes(texture.width * texture.height);
        texture.paletteBytes = br.ReadBytes(br.Length - br.Position);
        
        this.textures.push(texture);
      }
    }
  }

  return new TextureArchive(file);
}`;

export default sampleCode;