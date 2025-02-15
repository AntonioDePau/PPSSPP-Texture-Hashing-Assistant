import './App.css';
import PPSSPPHasher from './components/PPSSPPHasher.js';

//import { clut, texture } from "./sample_data/file.js";
//import Tests from "./scripts/tests/tests.js";

const debug = false;

//Tests.RunAll(texture, clut, debug);




function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>PPSSPP Hasher</h1>
        <PPSSPPHasher></PPSSPPHasher>
      </header>
    </div>
  );
}

export default App;