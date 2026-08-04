// DUMMY FILE JUST FOR PLAYGROUND TESTING
// FILE CONTENT

import { Board } from "../core/board/board";
import { Ship } from "../core/ship";
import { ShipType } from "../types";
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
const bb = board.getCell({ x: 4, y: 4 })?.coordinate;
const ss = Ship.create(ShipType.X4, [bb!]);

console.log(board.getAllShips());

// console.log(
//   CoordinateUtils.getNeighbors(
//     board.getCell({ x: 4, y: 4 })!.coordinate,
//     board.boardSize,
//   ),
// );

// console.log({ a, b });

console.info("Closing engine tests...");
