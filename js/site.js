// Globals

var platypus = {};
var world = {};

// code

const init = () => {
    world.canvasSize = 300;
    world.numRows = 5;
    world.numCols = 5;
    world.groundColor = '#FFF1DA';
    world.waterColor = '#4EFFFF';
    world.wallColor = 'black'
    world.grid = [];
    for (let i = 0; i < world.numRows * world.numCols; i++) {
        const randVal = Math.random();
        if (randVal < 0.5) {
            world.grid.push(world.groundColor);
        } else if (randVal < 0.8) {
            world.grid.push(world.waterColor);
        } else {
            world.grid.push(world.wallColor);
        }
    }

    world.modes = {
        'walk': world.groundColor,
        'swim': world.waterColor,
    }

    // set up lemur
    platypus.direction = 'E';
    platypus.top_left_x = 0;
    platypus.top_left_y = 0;
    platypus.row = 0;
    platypus.col = 0;
    platypus.square_side_len = world.canvasSize / Math.max(world.numRows, world.numCols);
    platypus.num_rows = world.numRows;
    platypus.num_cols = world.numCols;
    platypus.border = 2;
    platypus.images = {
        E: new Image(),
        S: new Image(),
        W: new Image(),
        N: new Image(),
    };
    platypus.images.E.src = "img/platypus-facing-E.png";
    platypus.images.S.src = "img/platypus-facing-S.png";
    platypus.images.W.src = "img/platypus-facing-W.png";
    platypus.images.N.src = "img/platypus-facing-N.png";

    // Call the drawGrid function to draw the grid worldially
    drawGrid();
    platypus.images.E.onload = () => {
        drawPlatypus();
    }
}

const drawGrid = (x, y, src) => {
    // Get the canvas element and its 2D rendering context
    const canvas = document.getElementById("gridCanvas");
    const context = canvas.getContext("2d");

    // Set the number of rows and columns
    const numRows = world.numRows;
    const numCols = world.numCols; 
    const canvasSize = world.canvasSize;

    // Set the size of the canvas
    canvas.width = world.canvasSize;
    canvas.height = world.canvasSize;

    // Calculate the size of each cell (always square)
    const cellSize = canvasSize / (Math.max(numRows, numCols));
    const width = cellSize * numCols;
    const height = cellSize * numRows;

    // Clear the canvas
    context.clearRect(0, 0, canvasSize, canvasSize);

    // Draw the vertical grid lines
    for (let x = 0; x <= width; x += cellSize) {
        context.moveTo(x, 0);
        context.lineTo(x, height);
    }

    // Draw the horizontal grid lines
    for (let y = 0; y <= height; y += cellSize) {
        context.moveTo(0, y);
        context.lineTo(width, y);
    }

    // Set the color and stroke of the grid lines
    context.strokeStyle = "black";
    context.lineWidth = 1;

    // Draw the grid lines
    context.stroke();

    // Draw the colored squares
    for (let r = 0; r < world.numRows; r++) {
        for (let c = 0; c < world.numCols; c++) {
            colorSquare(r, c, world.grid[gridLoc(r, c)]);
        }
    }
}

const drawPlatypus = ()  => {
    const canvas = document.getElementById("gridCanvas");
    const context = canvas.getContext("2d");
    const xpos = platypus.col * platypus.square_side_len + platypus.border;
    const ypos = platypus.row * platypus.square_side_len + platypus.border;
    context.drawImage(platypus.images[platypus.direction], xpos, ypos, platypus.square_side_len- 2 * platypus.border, platypus.square_side_len - 2 * platypus.border);
}

const colorSquare = (row, col, color) => {
    const canvas = document.getElementById("gridCanvas");
    const context = canvas.getContext("2d");
    const xpos = col * platypus.square_side_len + 1;
    const ypos = row * platypus.square_side_len + 1;
    context.beginPath();
    context.rect(xpos, ypos, platypus.square_side_len - 2, platypus.square_side_len - 2);
    context.fillStyle = color;
    context.fill();
}

const rotatePlatypus = (clockwise) => {
    let directionMap;
    if (clockwise) {
        directionMap = { E: 'S', S: 'W', W: 'N', N: 'E', };
    } else {
        directionMap = { E: 'N', S: 'E', W: 'S', N: 'W', };
    }
    const new_dir = directionMap[platypus.direction];
    platypus.direction = new_dir;
    platypus.image = platypus.images[new_dir];
    drawGrid();
    drawPlatypus();
}

const gridLoc = (row, col) => row * world.numCols + col;

const movePlatypus = (mode) => {
    // mode and color must match
    if (world.modes[mode] != world.grid[gridLoc(platypus.row, platypus.col)]) {
        return false;
    }

    switch(platypus.direction) {
            // cannot go out of bounds or through walls
        case 'E':
            if (platypus.col == platypus.num_cols - 1 ||
                world.grid[gridLoc(platypus.row, platypus.col + 1)] == world.wallColor) {
                // alert("Cannot go outside of grid!");
                return false;
            }
            platypus.col++;
            break;
        case 'S':
            if (platypus.row == platypus.num_rows - 1 ||
                world.grid[gridLoc(platypus.row + 1, platypus.col)] == world.wallColor) {
                // alert("Cannot go outside of grid!");
                return false;
            }
            platypus.row++;
            break;
        case 'W':
            if (platypus.col == 0 || 
                world.grid[gridLoc(platypus.row, platypus.col - 1)] == world.wallColor) {
                // alert("Cannot go outside of grid!");
                return false;
            }
            platypus.col--;
            break;
        case 'N':
            if (platypus.row == 0 ||
                world.grid[gridLoc(platypus.row - 1, platypus.col)] == world.wallColor) {
                // alert("Cannot go outside of grid!");
                return false;
            }
            platypus.row--;
            break;
    }
    drawGrid();
    drawPlatypus();
    return true;
}

const parse_world = (world, url) => {
    fetch(url)
        .then(res => res.text())
        .then(data => {
            console.log(data);
        });
}


