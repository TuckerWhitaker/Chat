import "./App.css";
const { io } = require("socket.io-client");
var socket = io.connect("ws://localhost:80");

const Send = () => {
  socket.emit("message", "test message");
  console.log("message sent");
};

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <button
          onClick={() => {
            Send();
          }}
        >
          click
        </button>
      </header>
    </div>
  );
}

export default App;
