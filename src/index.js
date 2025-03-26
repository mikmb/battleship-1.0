import "./styles.css";
import Ship from "./ship";

const rotateButton = document.querySelector("#rotate-btn");
const optionContainer = document.querySelector(".option-container");
const startButton = document.querySelector("#start-game-btn");
const infoDisplay = document.querySelector("#info");
const turnDisplay = document.querySelector("#turn-display");

let shipRotated = false;
const boardWidth = 10;
let gameOver = false;
let playerTurn;
let playerHits = [];
let computerHits = [];
const shipsPlayerSunk = [];
const shipsComputerSunk = [];
let angle = 0;

const destroyer = new Ship("destroyer", 2, 0);
const submarine = new Ship("submarine", 3, 0);
const cruiser = new Ship("cruiser", 3, 0);
const battleship = new Ship("battleship", 4, 0);
const carrier = new Ship("carrier", 5, 0);

const ships = [destroyer, submarine, cruiser, battleship, carrier];
let notDropped;

const getValidity = (allBoardBlocks, isHorizontal, startIndex, ship) => {
  let shipBlocks = [];
  let validStart = isHorizontal
    ? startIndex <= boardWidth * boardWidth - ship.length
      ? startIndex
      : boardWidth * boardWidth - ship.length
    : // handle vertical
    startIndex <= boardWidth * boardWidth - boardWidth * ship.length
    ? startIndex
    : startIndex - ship.length * boardWidth + boardWidth;

  for (let i = 0; i < ship.length; i++) {
    if (isHorizontal) {
      shipBlocks.push(allBoardBlocks[Number(validStart) + i]);
    } else {
      shipBlocks.push(allBoardBlocks[Number(validStart) + i * boardWidth]);
    }
  }

  console.log("shipBlocks");
  console.log(shipBlocks.length);
  console.log(shipBlocks);
  console.log(shipBlocks[0]);
  let valid;
  if (isHorizontal) {
    valid = shipBlocks.every(
      (_shipBlock, index) =>
        shipBlocks[0].dataset.id % boardWidth !==
        boardWidth - (shipBlocks.length - (index + 1))
    );
  } else {
    valid = shipBlocks.every(
      (_shipBlock, index) =>
        shipBlocks[0].dataset.id < 90 + (boardWidth * index + 1)
    );
  }

  const notTaken = shipBlocks.every(
    (shipBlock) => !shipBlock.classList.contains("taken")
  );

  return { shipBlocks, valid, notTaken };
};

document.addEventListener("DOMContentLoaded", () => {
  showFleetPlacementScreen();
});

const rotate = () => {
  const optionShips = Array.from(optionContainer.children);
  angle = angle === 0 ? 90 : 0;
  optionShips.forEach(
    (optionShip) => (optionShip.style.transform = `rotate(${angle}deg)`)
  );
};

rotateButton.addEventListener("click", rotate);
const showFleetPlacementScreen = () => {
  setupPlacementBoard();

  const rotateButton = document.querySelector("#rotate-btn");
  rotateButton.addEventListener("click", () => {
    shipRotated = !shipRotated;
  });
};

const setupPlacementBoard = () => {
  const playerBoard = document.querySelector("#player-board");
  const computerBoard = document.querySelector("#computer-board");
  showGrids(playerBoard);
  showGrids(computerBoard);

  placeFleetOnGameBoard();

  const allPlayerBlocks = document.querySelectorAll("#player-board div");
  allPlayerBlocks.forEach((playerBlock) => {
    playerBlock.addEventListener("dragover", dragOver);
    playerBlock.addEventListener("drop", dropShip);
  });
  const optionShips = Array.from(optionContainer.children);
  optionShips.forEach((optionShip) =>
    optionShip.addEventListener("dragstart", dragStart)
  );
};

const showGrids = (gridContainer) => {
  for (let i = 0; i < boardWidth * boardWidth; i++) {
    const cell = document.createElement("div");
    cell.dataset.id = i;

    gridContainer.appendChild(cell);
  }
};

const placeFleetOnGameBoard = () => {
  ships.forEach((ship) => addShipToBoard("computer", ship));
};

const addShipToBoard = (user, ship, startId) => {
  const allBoardBlocks = document.querySelectorAll(`#${user}-board div`);

  let randomBoolean = Math.random() >= 0.5;
  let isHorizontal = user === "player" ? angle === 0 : randomBoolean;
  let randomStartIndex = Math.floor(Math.random() * boardWidth * boardWidth);

  let startIndex = startId ? startId : randomStartIndex;

  const { shipBlocks, valid, notTaken } = getValidity(
    allBoardBlocks,
    isHorizontal,
    startIndex,
    ship
  );
  if (valid && notTaken) {
    shipBlocks.forEach((shipBlock) => {
      shipBlock.classList.add(ship.name);
      shipBlock.classList.add("taken");
    });
  } else {
    if (user === "computer") addShipToBoard("computer", ship);
    else if (user === "player") notDropped = true;
  }
};

// Drag player ships
let draggedShip;
const dragStart = (e) => {
  notDropped = false;
  draggedShip = e.target;
};

const dragOver = (e) => {
  e.preventDefault();
  console.log(e.target.dataset.id);
  const ship = ships[draggedShip.id];
  highlightArea(e.target.dataset.id, ship);
};

const dropShip = (e) => {
  const startId = e.target.dataset.id;
  const ship = ships[draggedShip.id];
  addShipToBoard("player", ship, startId);
  if (!notDropped) {
    draggedShip.remove();
  }
};

// Add highlight
const highlightArea = (startIndex, ship) => {
  const allBoardBlocks = document.querySelectorAll("#player-board div");
  let isHorizontal = angle === 0;

  const { shipBlocks, valid, notTaken } = getValidity(
    allBoardBlocks,
    isHorizontal,
    startIndex,
    ship
  );

  if (valid && notTaken) {
    shipBlocks.forEach((shipBlock) => {
      shipBlock.classList.add("hover");
      setTimeout(() => {
        shipBlock.classList.remove("hover");
      }, 500);
    });
  }
};

// start the game
const startGame = () => {
  if (playerTurn === undefined) {
    if (optionContainer.children.length !== 0) {
      infoDisplay.textContent = "Please place all your ships first!";
    } else {
      const allBoardBlocks = document.querySelectorAll("#computer-board div");
      allBoardBlocks.forEach((block) =>
        block.addEventListener("click", handleClick)
      );
      playerTurn = true;
      turnDisplay.textContent = "Your turn.";
      infoDisplay.textContent = "The game has started.";
    }
  }
};

startButton.addEventListener("click", startGame);

const handleClick = (e) => {
  if (!gameOver) {
    if (e.target.classList.contains("taken")) {
      e.target.classList.add("boom");
      infoDisplay.textContent = "Boom! You hit the computer's ship.";
      let classes = Array.from(e.target.classList);
      //   classes = classes.filter((className) => className !== "block");
      classes = classes.filter((className) => className !== "boom");
      classes = classes.filter((className) => className !== "taken");
      playerHits.push(...classes);
      //   console.log(playerHits);
      checkScore("player", playerHits, shipsPlayerSunk);
    } else {
      infoDisplay.textContent = "Nothing hit this time.";
      e.target.classList.add("miss");
    }

    playerTurn = false;
    const allBoardBlocks = document.querySelectorAll("#computer-board div");
    allBoardBlocks.forEach((cell) => cell.replaceWith(cell.cloneNode(true)));
    setTimeout(computerGo, 3000);
  }
};

// computerGo

const computerGo = () => {
  if (!gameOver) {
    turnDisplay.textContent = "Computer's Turn";
    infoDisplay.textContent = "The computer is thinking...";

    setTimeout(() => {
      let randomGo = Math.floor(Math.random() * boardWidth * boardWidth);
      const allBoardBlocks = document.querySelectorAll("#player-board div");

      if (
        allBoardBlocks[randomGo].classList.contains("taken") &&
        allBoardBlocks[randomGo].classList.contains("boom")
      ) {
        computerGo();
        return;
      } else if (
        allBoardBlocks[randomGo].classList.contains("taken") &&
        !allBoardBlocks[randomGo].classList.contains("boom")
      ) {
        allBoardBlocks[randomGo].classList.add("boom");
        infoDisplay.textContent = "The computer hit your ship.";
        let classes = Array.from(allBoardBlocks[randomGo].classList);
        //   classes = classes.filter((className) => className !== "block");
        classes = classes.filter((className) => className !== "boom");
        classes = classes.filter((className) => className !== "taken");
        computerHits.push(...classes);
        checkScore("computer", computerHits, shipsComputerSunk);
      } else {
        infoDisplay.textContent = "Nothing hit this time.";
        allBoardBlocks[randomGo].classList.add("miss");
      }
    }, 3000);

    setTimeout(() => {
      playerTurn = true;
      turnDisplay.textContent = "Your turn!";
      infoDisplay.textContent = "Please take your turn.";
      const allBoardBlocks = document.querySelectorAll("#computer-board div");
      allBoardBlocks.forEach((cell) =>
        cell.addEventListener("click", handleClick)
      );
    }, 6000);
  }
};

const checkScore = (user, userHits, shipsUserSunk) => {
  const checkShip = (shipName, shipLength) => {
    if (
      userHits.filter((storedShipName) => storedShipName === shipName)
        .length === shipLength
    ) {
      if (user === "player") {
        infoDisplay.textContent = `You sunk the computer's ${shipName}`;
        playerHits = userHits.filter(
          (storedShipName) => storedShipName !== shipName
        );
      }

      if (user === "computer") {
        infoDisplay.textContent = `The computer sunk your ${shipName}`;
        computerHits = userHits.filter(
          (storedShipName) => storedShipName !== shipName
        );
      }

      shipsUserSunk.push(shipName);
    }
  };

  checkShip("destroyer", 2);
  checkShip("submarine", 3);
  checkShip("cruiser", 3);
  checkShip("battleship", 4);
  checkShip("carrier", 5);

  console.log("playerHits", playerHits);
  console.log("shipsPlayerSunk", shipsPlayerSunk);

  if (shipsPlayerSunk.length === 5) {
    infoDisplay.textContent = "You sunk all the computer's ships. You Won!!!";
    gameOver = true;
  }

  if (shipsComputerSunk.length === 5) {
    infoDisplay.textContent =
      "The computer has sunk all your ships. You Lost!!!";
    gameOver = true;
  }
};
