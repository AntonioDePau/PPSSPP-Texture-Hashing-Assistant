async function ReadFile(file){
  return new Promise((resolve) => {
    const fileReader = new FileReader();

    fileReader.onload = (event) => {
      resolve(fileReader.result);
    }

    fileReader.onerror = (error) => {
      throw Error(error);
    }

    fileReader.readAsArrayBuffer(file);
  });
}

export async function ReadAsUint8Array(file){
  const fileData = await ReadFile(file);
  return new Uint8Array(fileData);
}

export function DownloadAsFile(filename, data, type = 'data:text/plain;charset=utf-8,'){
  const element = document.createElement('a');
  element.setAttribute('href', `${type}${data}`);
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}