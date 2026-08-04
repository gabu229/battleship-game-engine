import { CoordinateUtils } from "../utils/coordinate";

const BOARD_SIZE = 10;

console.info("Starting engine playground tests...");
console.info(`Board size: ${BOARD_SIZE} x ${BOARD_SIZE}`);

// console.log(CoordinateUtils.getAllCoordinates(10));
// console.log(CoordinateUtils.random(BOARD_SIZE));
const a = CoordinateUtils.random(BOARD_SIZE);
const b = CoordinateUtils.random(BOARD_SIZE);

console.log({ a, b });

console.info("Closing engine tests...");
