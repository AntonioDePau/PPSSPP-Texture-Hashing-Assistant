import { Editor } from "prism-react-editor";

import "prism-react-editor/prism/languages/javascript";
import "prism-react-editor/languages/common";
import "prism-react-editor/layout.css"
import "prism-react-editor/themes/github-dark.css"
import "prism-react-editor/search.css"

import './CodeEditor.css';
import Button from './inputs/Button';
import FileSelector from './inputs/FileSelector';
import { IndentGuides } from "prism-react-editor/guides"
import { useBracketMatcher } from "prism-react-editor/match-brackets";
import { useHightlightBracketPairs } from "prism-react-editor/highlight-brackets";
import { useHighlightSelectionMatches, useSearchWidget } from "prism-react-editor/search";
import { useCursorPosition } from "prism-react-editor/cursor";
import { useHighlightMatchingTags, useTagMatcher } from "prism-react-editor/match-tags";
import { useDefaultCommands, useEditHistory } from "prism-react-editor/commands";
import { useAutoComplete, registerCompletions, strictFilter } from "prism-react-editor/autocomplete";
import {
  completeKeywords,
  completeScope,
  jsContext,
  jsDocCompletion
} from 'prism-react-editor/autocomplete/javascript';

import 'prism-react-editor/autocomplete.css';
import 'prism-react-editor/autocomplete-icons.css';

function MyExtensions({ editor }) {
	useBracketMatcher(editor)
	useHightlightBracketPairs(editor)
	useTagMatcher(editor)
	useHighlightMatchingTags(editor)
	useDefaultCommands(editor)
	useEditHistory(editor)
	useSearchWidget(editor)
	useHighlightSelectionMatches(editor)
	useCursorPosition(editor)
  useAutoComplete(editor, {
    filter: strictFilter /* fuzzyFilter */
  })

  registerCompletions(['javascript'], {
    context: jsContext,
    sources: [
      completeScope({Encoding: window.Encoding}),
      completeScope({BitConverter: window.BitConverter}),
      completeScope({BinaryReader: new window.BinaryReader(new Uint8Array())}),
      completeKeywords,
      jsDocCompletion
    ],
  });

  return <IndentGuides editor={editor} />
}

export default function CodeEditor(props){
  return (
    <div className="CodeEditor">
      <Editor
        language="javascript"
        value={props.code}
        lineNumbers={true}
        onUpdate={code => {
          props.setUserCode(code);
        }}
      >
        {editor => <MyExtensions editor={editor} />}
      </Editor>
      <div className="CodeEditor-buttons">
        <FileSelector
          onChange={props.handleSampleFileScriptTest}
          text="Test script on file"
          directory={false}
          multiple={false}
        ></FileSelector>
        <Button type="execute" onClick={props.handleScriptSubmission}>Run script on files</Button>
        <Button onClick={props.reloadDefaultScript} type={"delete"}>🗘 Reload default script</Button>
        <Button title="Save this script to local storage (it will only be available on this machine and on this browser!)" onClick={props.handleScriptSaving}>💾 Save script</Button>
      </div>
    </div>
  )
}