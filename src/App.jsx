import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import './App.css'
import {useSocket} from "./socket";

function App() {
  const [count, setCount] = useState(0);
  const {send, messages} = useSocket();

  const [text, setText] = useState("");
  return (
    <>
      <div>
        {messages.map((m) => (<>
          <div>
            {m}
          </div>
        </>))}
      </div>
      <input value={text} onChange={(e) => {setText(e.target.value);}} />
      <button onClick={() => {send(text);}} >
        送信
      </button>
      <br />
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
    </>
  )
}

export default App
