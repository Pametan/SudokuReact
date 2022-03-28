/*

EXTRA:
1. Introduce notes
2. Update so that the moment a mistake is entered there will be highlighting on the squares
3. Introduce player highlighting
4. Give smart hints
5. Create Timer
6. Add dark mode

*/

import React from "react";
import ReactDOM from "react-dom";

import "./styles.css";
import * as board from "./boardGenerator.js";
import logo from "../settingsLogo.png";

let autocheck = false;

function Square(props){
  return(
    <>
      <input
      type = "text"
      maxLength = "1"
      className = {"input-sq-"+props.value+" square"}
      />
    </>
  );
}

class Board extends React.Component{

  renderBoxBorders(i){
    let returnStatement="";
    if (i%3==2 && (i%9 != 8)) {
      returnStatement += "rightBorder ";
    }

    if(Math.floor(i/9)%3==2 && Math.floor(i/9) != 8){
      returnStatement += "bottomBorder ";
    }

    return returnStatement;
  }

  renderSquare(i) {
    return <td className={"sudoku-grid sudoku-grid-td sq-"+i+" "+this.renderBoxBorders(i)} key={"sq-"+i}><Square value={i}/></td>;
  }

  renderRow(rowSize,i) {
    let returnStatement = [];
    for (var j = 0; j < rowSize; j++) {
      returnStatement.push( this.renderSquare(i*rowSize+j) );
    }
    return <tr key={"row-"+i} className={"sudoku-grid row-"+i}>{returnStatement}</tr>;
  }

  renderBoard(boardWidth) {
    let board = [];
    for (var i = 0; i < boardWidth; i++) {
      board.push( this.renderRow(boardWidth,i) );
    }
    return <tbody className="sudoku-grid">{board}</tbody>;
  }


  render() {
    return(
      <table className="sudoku-grid" cellSpacing="0">{this.renderBoard(9)}</table>
    );


  }
}

function SolveButton(){
  function handleClick() {
    console.log("solvin'...");
    $(".sudoku-grid-td").removeClass("wrong");
    $(".square").removeClass("wrong");
    if (board.isSolvableFromPosition()) {
      board.solveBoard();
      updateBoard();
    }else if(!board.returnTrueIfSolved()){
      alert("Board is not solvable from that position");
    }
  }


    return(
      <button className = "solve-button" onClick={() => handleClick()}> Solve</button>
    );

}

function NewBoardButton(props) {
  return(
    <button className = "new-board-button" onClick = {() => props.onClick()}> New Board</button>
  );
}

function HintButton() {
  function handleClick(){

    if(board.returnTrueIfSolved()){
      return;
    }
    console.log("hintin'...");
    let hintGiven = false;
    $(".sudoku-grid-td").removeClass("focused");
    for (var i = 0; i < 81; i++) {
      if (board.getBoardValAtSq(i) != 0) {
        if($(".square")[i].value != board.getSolvedBoardValAtSq(i)){
          $(".sudoku-grid-td").has("."+$(".square")[i].className.split(" ")[0]).addClass("wrong");
          hintGiven = true;
          break;
        }
      }
    }
    if(!hintGiven){
      let pos = board.findRandomZero();
      $("input")[pos].value = board.getSolvedBoardValAtSq(pos);
      board.setBoardValAtSq(pos, board.getSolvedBoardValAtSq(pos));
      $("input")[pos].disabled = true;
      $("input")[pos].className = $("input")[pos].className + " baseValue";
      $("td").has("."+$("input")[pos].className.split(" ")[0]).addClass("baseValParent");
      $("td").has("."+$("input")[pos].className.split(" ")[0]).addClass("justHinted");
      hintGiven = true;
    }
  }

  return(
    <button className = "hint-button" onClick={() => handleClick()}> Hint</button>
  );
}

function CheckButton() {
  function handleClick(){
    console.log("checkin'...");
    checkBoard();
  }

  return(
    <button className = "check-button" onClick={() => handleClick()}> Check</button>
  );
}

function AutoCheckButton() {
  function handleClick(){
    autocheck = !autocheck;
    checkBoard();
    if (autocheck) {
      $(".auto-checker-text").text("Turn off auto-check");
    }else{
      $(".auto-checker-text").text("Turn on auto-check");
    }

  }

  return(
    <label className = "auto-checker-container">
      <input type = "checkbox" className = "auto-check-button" onClick={() => handleClick()} />
      <div className = "auto-checker-text">Turn on auto-check</div>
    </label>
  );
}

function SettingsButton(props){
  return(
    <div className="settings-logo-container" onClick={() => props.onClick()}><img className="settings-logo" src={logo} alt="Settings" /></div>
  );
}

function NumberButton(props) {
  function handleClick(){
    if(!$(".focused").hasClass("baseValParent")){
      $(".focused").children()[0].value = props.value;
      let inputSq = parseInt($(".focused").children()[0].className.match(/\d/g).join(""));
      board.setBoardValAtSq(inputSq, parseInt(event.key));
      $(".sudoku-grid-td")[inputSq].classList.remove("wrong");
      $(".square")[inputSq].classList.remove("wrong");
      if(autocheck){
        checkBoard();
      }
      if(board.returnTrueIfSolved()){
        alert("Nice, you solved the Sudoku!");
      }
    }
  }

  return(
    <button className = "number-button" onClick={() => handleClick()}>{props.value}</button>
  );
}

class NumberGrid extends React.Component{

  renderSquare(i) {
    return <td className={"num-button num-button-"+i+1} key={"num-button-"+i+1}><NumberButton value={i+1}/></td>;
  }

  renderRow(rowSize,i) {
    let returnStatement = [];
    for (var j = 0; j < rowSize; j++) {
      returnStatement.push( this.renderSquare(i*rowSize+j) );
    }
    return <tr key={"num-row-"+i} className={"num-row-"+i}>{returnStatement}</tr>;
  }

  renderBoard(){
    let board = [];
    for (var i = 0; i < 3; i++) {
      board.push( this.renderRow(3,i) );
    }
    return <tbody>{board}</tbody>;
  }

  render(){
    return(
      <table cellSpacing="0">{this.renderBoard()}</table>
    );
  }
}

function DifficultyLevelButton(props){
  return(
    <button onClick = {() => props.onClick(props.value)} className = {"difficulty-level-button difficulty-button-"+props.value}>{props.value}</button>
  );
}

class ChooseDifficultyPanel extends React.Component {
  renderDifficulty(diff){
    return < DifficultyLevelButton key = {diff} value = {diff} onClick = {(attempts) => this.props.handleDifficultyClick(attempts)}/>;
  }
  renderPanel(){
    let panel = [];
    panel.push(this.renderDifficulty("Easy"));
    panel.push(this.renderDifficulty("Medium"));
    panel.push(this.renderDifficulty("Hard"));
    return panel;
  }


  render(){
    return(
      <div className = {"choose-difficulty-panel "+ (this.props.showVal ? "shown" : "hidden")}>
        <div className= "choose-difficulty-header">
          Choose Difficulty
        </div>

        {this.renderPanel()}
        <div className = "arrow-right">
        </div>
      </div>
    );
  }
}

function SettingsPanel(props) {
  return (

    <div className = {"settings-panel-super-container " + (props.showVal ? "shown" : "hidden")}>
      <div className = "settings-panel-container">
        <div className = "settings-panel-header">
        Settings
        </div>

        <div className = "settings-panel-close-button-container" onClick = {() => props.onClose()}>
          <div>
            x
          </div>
        </div>

        <div className = "settings-panel-theme-container">
          <div className = "settings-panel-theme-header">
          Theme
          </div>

          <input type="radio" id="light-radio" className="settings-panel-theme-radio" name="themes" value="light" defaultChecked/><label htmlFor="light-radio" className="settings-panel-theme-label">Light Theme</label><br />
          <input type="radio" id="dark-radio" className="settings-panel-theme-radio" name="themes"  value="dark"/><label htmlFor="dark-radio" className="settings-panel-theme-label">Dark Theme</label>
        </div>

        <div className="settings-panel-get-board-string-container">
          <div className="settings-panel-get-board-string-header">
          Export
          </div>
          <button className = "settings-panel-get-board-string-button">Get String</button>
          <input type="text" className = "settings-panel-get-board-string-input"/>

        </div>
      </div>
    </div>
  );
}

class Game extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      showDifficultyPanel: false,
      showSettingsPanel: false,
    };

  }

  newBoardClick(){
    this.setState({
      showDifficultyPanel: !this.state.showDifficultyPanel,
    });
  }

  handleClick(){
    if(this.state.showDifficultyPanel){
      this.setState({
        showDifficultyPanel: !this.state.showDifficultyPanel,
      });
    }
  }

  handleDifficultyClick(difficulty){
    console.log(difficulty);
    if(difficulty == "Easy"){
      board.generateBoard(5);
    }else if(difficulty == "Medium"){
      board.generateBoard(10);
    }else if(difficulty == "Hard"){
      board.generateBoard(20);
    }else{
      alert("Error Occurred");
    }

    updateBoard();
    this.setState({
      showDifficultyPanel: !this.state.showDifficultyPanel,
    });
  }

  handleOpenSettingsClick(){
    this.setState({
      showSettingsPanel: true,
    });
    board.exportSudoku();
  }

  handleCloseSettingsClick(){
    this.setState({
      showSettingsPanel: false,
    });
  }


  render(){
    const presentDifficultyPanel = this.state.showDifficultyPanel;
    const presentSettingsPanel = this.state.showSettingsPanel;
    return(
      <>
      <ChooseDifficultyPanel showVal = {presentDifficultyPanel} handleDifficultyClick = {(attempts) => this.handleDifficultyClick(attempts)}/>
      <div onClick={() => this.handleClick()}>
        <header>Sudoku<SettingsButton onClick = {() =>this.handleOpenSettingsClick()}/></header>
        <div className = "game-container">
          <div className = "board-container">
            <Board />

          </div>
          <div className = "all-buttons-container">
            <div className = "top-buttons-container">
              <NewBoardButton onClick={() => this.newBoardClick()}/>
              <SolveButton />
              <HintButton />
              <CheckButton />
              <AutoCheckButton />
            </div>
            <div className = "number-grid-container">
              <NumberGrid />
            </div>
          </div>
        </div>
        <footer>Made by Alejandro Breen</footer>
      </div>
      <SettingsPanel showVal = {presentSettingsPanel} onClose = {() => this.handleCloseSettingsClick()}/>
      </>
    );
  }
}

ReactDOM.render(<Game />, document.getElementById("root"));
updateBoard();


function updateBoard() {
  $(".sudoku-grid-td").removeClass("focused");
  for (var i = 0; i < 81; i++) {
    if (board.getBoardValAtSq(i) != 0) {
      $(".square")[i].value = board.getBoardValAtSq(i);
      $(".square")[i].disabled = true;
      $(".square")[i].className = $("input")[i].className + " baseValue";
      $(".sudoku-grid-td").has("."+$("input")[i].className.split(" ")[0]).addClass("baseValParent");
    }else{
      $(".sudoku-grid-td")[i].classList.remove("justHinted");
      $(".sudoku-grid-td")[i].classList.remove("baseValParent");
      $(".square")[i].classList.remove("baseValue");
      $(".square")[i].value = null;
      $(".square")[i].disabled = false;
    }
  }
}

function checkBoard() {
  for (var i = 0; i < 81; i++) {
    if (board.getBoardValAtSq(i) != 0) {
      if($(".square")[i].value != board.getSolvedBoardValAtSq(i)){
        $(".sudoku-grid-td").has("."+$(".square")[i].className.split(" ")[0]).addClass("wrong");
      }else{
        $(".square")[i].disabled = true;
        $(".square")[i].className = $(".square")[i].className + " baseValue";
        $(".sudoku-grid-td").has("."+$(".square")[i].className.split(" ")[0]).addClass("baseValParent");
      }
    }
  }
}

$(".square").on("focus", function (e) {
  $(".sudoku-grid-td").removeClass("focused");
  $(".sudoku-grid-td").removeClass("justHinted");
  $(this).parent().addClass("focused");
});


//LIMIT INPUT TO NUMBERS USING JQUERY EVENT LISTENERS AND UPDATE BOARD BASED ON INPUTS

$(".square").on("keydown", function (e) {
  if (!(1 <= event.key && event.key <= 9) && event.keyCode != 8) {
    $(this).prop("readOnly",true);
  } else if(event.key >= 1 && event.key <= 9){
    let inputSq = parseInt($(this)[0].className.match(/\d/g).join(""));
    if(board.getInitialBoardValAtSq(inputSq) == undefined){
      $(".sudoku-grid-td")[inputSq].classList.remove("wrong");
      $(".square")[inputSq].classList.remove("wrong");
      $(this)[0].value = event.key;
      board.setBoardValAtSq(inputSq, parseInt(event.key));
    }
    if(autocheck){
      checkBoard();
    }
    if(board.returnTrueIfSolved()){
      alert("Nice, you solved the Sudoku!");
    }
  } else if (event.keyCode == 8){
    let inputSq = parseInt($(this)[0].className.match(/\d/g).join(""));
    if (board.getInitialBoardValAtSq(inputSq) == undefined) {
      $(this)[0].value = null;
      board.setBoardValAtSq(inputSq, 0);
    }
    if (autocheck) {
      checkBoard();
    }
    $(".sudoku-grid-td")[inputSq].classList.remove("wrong");
    $(".square")[inputSq].classList.remove("wrong");
  }
});

$(".square").on("keyup", function (e) {
  $(this).prop("readOnly",false);
});
