import getFilename from "./ppsspp/hashing";
import { ReadAsUint8Array } from "./system/file";

export function RegisterGlobalObject(key, object){
  window[key] = object;
}

export async function InjectScript(script){
  if(!script.startsWith('(file) => {')){
    throw Error("Your script must be encapsulated within the '(file) => {<your script>}' function!");
  }

  return new Promise(resolve => {
    try{
      const head = document.head;

      const scriptID = 'user-injected-script';
      head.querySelector(`script#${scriptID}`)?.remove();

      const newScript = document.createElement('script');
      newScript.async = false;
      newScript.type = 'text/javascript';
      newScript.appendChild(document.createTextNode(`window.Processor = ${script}`));
      //newScript.setAttribute('src', `data:javascript/text,window.Processor = ${script}`);
      newScript.setAttribute('id', scriptID);

      window.onerror = (event, source, lineno, colno, error) => {
        const errorType = event.replace("Uncaught ", "").replace("Failed to execute 'appendChild' on 'Node': ", "");
        
        resolve({error: {
          message: `Failed to inject script due to syntax error!`,
          stack: `${errorType}\n    at CustomUserScript (<anonymous>:${lineno}:${colno})`
        }});
        return true;
      }

      newScript.onerror = (error) => {
        resolve({error: error});
        return;
      }

      newScript.onload = () => {
        resolve();
      }

      head.appendChild(newScript);

      newScript.remove();

      resolve({success: true});
    }catch(error){
      resolve({error: error});
    }
  });
}

export default async function ProcessFile(hashMap, file, debug = false){

  const bytes = await ReadAsUint8Array(file);
  const filename = file.name;
  const filepath = file.webkitRelativePath;

  try{
    const parsedBinary = window.Processor({
      path: filepath,
      name: filename,
      bytes: bytes
    });

    if(!parsedBinary.textures.length){
      return false;
    }

    parsedBinary.textures.forEach(entry => {

      if(entry.textureBytes.length <= 0) throw {message: `Cannot get hashed filename for file '${entry.name}'!`, stack: `Texture bytes are null!`};
      if(entry.paletteBytes.length <= 0) throw {message: `Cannot get hashed filename for file '${entry.name}'!`, stack: `Palette bytes are null!`};

      const hashedFilename = getFilename(
        new Uint8Array(entry.textureBytes),
        new Uint8Array(entry.paletteBytes),
        entry.width,
        entry.height,
        entry.clutformat,
        false
      );

      hashMap.push(`${hashedFilename} = ${entry.name}\n`);
    });
  }catch(error){
    const sanitisedStack = decodeURIComponent(error.stack.replace("window.Processor", "CustomUserScript").split("\n    at ProcessFile")[0].replace('(data:javascript/text,window.Processor = ', ''));

    throw {message: `Script could not run properly due to error below!`, stack: sanitisedStack};
  }  
}