import React from "react";
import ReactDOM from "react-dom";

class App extends React.Component{
  render() {
    return(
      <>
        <div className="App">
          <h1> Hello, world! </h1>
        </div>
      </>
    );
  }
}

console.log("a");

ReactDOM.render(<App />, document.getElementById("root"));
