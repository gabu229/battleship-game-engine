// DUMMY FILE JUST FOR PLAYGROUND TESTING
// FILE CONTENT 

import { Board } from "../core/board/board";
import { CoordinateUtils } from "../utils/coordinate";

const BOARD_SIZE = 10;

console.info("Starting engine playground tests...");

const board = Board.create(BOARD_SIZE);

console.info(`Board size: ${BOARD_SIZE} x ${BOARD_SIZE}`);

// console.log(CoordinateUtils.getAllCoordinates(10));
// console.log(CoordinateUtils.random(BOARD_SIZE));
// const a = CoordinateUtils.random(board.boardSize);
// const b = CoordinateUtils.random(board.boardSize);

// console.log(board.getAllCells());

console.log(board.getCell({ x: 4, y: 4 })?.coordinate);

console.log(
  CoordinateUtils.getNeighbors(
    board.getCell({ x: 4, y: 4 })!.coordinate,
    board.boardSize,
  ),
);

// console.log({ a, b });

console.info("Closing engine tests...");
