import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { Round } from "../scripts/system/numbers";
import FileSelector from "./inputs/FileSelector";
import ProgressBar from "./ProgressBar";
import Button from "./inputs/Button";
import ProcessFile, { InjectScript, RegisterGlobalObject } from "../scripts/main";
import { DownloadAsFile } from "../scripts/system/file";
import BinaryReader, { SeekOrigin, BitConverter } from "../scripts/system/binary";
import Encoding from "../scripts/system/encoding";

import './PPSSPPHasher.css';
import sampleCode from "../sample_data/sample_code";
import CodeEditor from "./CodeEditor";
import Modal from "./Modal";
import { LocalStorage } from "../scripts/helpers";

RegisterGlobalObject('BinaryReader', BinaryReader);
RegisterGlobalObject('SeekOrigin', SeekOrigin);
RegisterGlobalObject('BitConverter', BitConverter);
RegisterGlobalObject('Encoding', Encoding);

export default function PPSSPPHasher(props){
  const [selectedFiles, setSelectedFile] = useState([]);
  const [isProcessingFiles, setIsProcessingFiles] = useState(false);
  const [processedFileCount, setProcessedFileCount] = useState(0);
  const [modalMessage, setModalMessage] = useState(null);
  const [userCode, setUserCode] = useState(null);
  const [defaultScript, setDefaultScript] = useState(LocalStorage.Read('ppsspp-hasher-user-code') ?? sampleCode);


  const handleFileChange = (files) => {
    setSelectedFile(Array.from(files));
  }


  const handleScriptSubmission = async () => {
    await InjectScript(userCode);

    setModalMessage({
      title: `File selection`,
      body: (
        <div>
          <p>Select the folder that contains all the files to be processed:</p>
          <FileSelector
            onChange={handleFileChange}
            directory={true}
            multiple={true}
          ></FileSelector>
        </div>
      )
    });
  }


  const handleScriptSaving = () => {
    LocalStorage.Save('ppsspp-hasher-user-code', userCode);
  }


  const reloadDefaultScript = () => {
    setDefaultScript(sampleCode);
  }


  const handleSampleFileScriptTest = async (files) => {
    try{
      const fileList = Array.from(files);

      const result = await InjectScript(userCode);

      if(result.error){
        throw result.error;
      }

      const hashMap = [];

      for(let i = 0; i < fileList.length; i++){
        await ProcessFile(hashMap, fileList[i], true);
      }

      setModalMessage({
        title: `Test hashmap generation successful!`,
        body: (
          <span>
            <p>Hash map entries generated: {hashMap.length}</p>
            <pre>
              <code>
                {hashMap.join('')}
              </code>
            </pre>
          </span>
        )
      });
    }catch(error){
      setModalMessage({
        isError: true,
        title: `Error: ${error.message}`,
        body: (
          <span>
            <div>Stack trace:</div>
            <pre>
              <code>{error.stack}</code>
            </pre>
          </span>
        )
      });
    }
  }


  const startProcessingFiles = async () => {
    setIsProcessingFiles(true);

    const hashMap = [];
    const errors = [];

    for(let i = 0; i < selectedFiles.length; i++){
      const file = selectedFiles[i];

      try{
        await ProcessFile(hashMap, file);
      }catch(error){
        errors.push(`Error processing file '${file.webkitRelativePath}':\n  ${error.stack}\n\n`);
      }

      setProcessedFileCount(c => c + 1);
    }

    setModalMessage({
      title: `Hashmap generation successful!`,
      body: (
        <span>
          {
            errors.length > 0 && <div>
              <p>Errors encountered: {errors.length}</p>
              <Button
                onClick={
                  () => {
                    DownloadAsFile('ppsspp_hashmap_errors.txt', encodeURIComponent(errors.join('')));
                  }
                }
              >Downlad errors</Button>
            </div>
          }
          <p>Hash map entries generated: {hashMap.length}</p>
          <Button
            onClick={
              () => {
                DownloadAsFile('ppsspp_hashmap.txt', encodeURIComponent(hashMap.join('')));
              }
            }
          >Downlad hashmap</Button>
        </span>
      )
    });
  }


  useEffect(() => {
    if(!isProcessingFiles || (processedFileCount === selectedFiles.length)) return;

    setModalMessage({
      title: `Processing files`,
      body: (
        <div>
          <p>Progression:</p>
          <ProgressBar progress={Round(processedFileCount / selectedFiles.length * 100, 0)}></ProgressBar>
        </div>
      )
    });
  }, [isProcessingFiles, processedFileCount, selectedFiles]);


  useEffect(() => {
    if(!selectedFiles.length || isProcessingFiles) return;

    setModalMessage({
      title: `File selection`,
      body: (
        <div>
          <p>Found files: {selectedFiles.length}</p>
          <Button onClick={startProcessingFiles}>Get hashes</Button>
        </div>
      )
    });
  }, [selectedFiles, isProcessingFiles]);


  return (
    <>
      <CodeEditor
        code={defaultScript}
        handleSampleFileScriptTest={handleSampleFileScriptTest}
        handleScriptSubmission={handleScriptSubmission}
        handleScriptSaving={handleScriptSaving}
        reloadDefaultScript={reloadDefaultScript}
        setUserCode={setUserCode}
      />
      {
        modalMessage !== null && createPortal(
          <Modal setContent={setModalMessage} data={modalMessage}></Modal>,
          document.body
        )
      }
    </>
  )
}