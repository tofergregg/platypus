// Globals

var platypus = {};
var world = {};
const SWIM_COLOR = '#4EFFFF';
const GROUND_COLOR = '#FFF1DA';
const WALL_COLOR = 'black';
const CANVAS_SIZE = 300;
const INIT_ROWS = 5;
const INIT_COLS = 5;
// code

const init = async () => {
    await loadWorld('worlds/first.txt');    

    // Call the drawWorld function to draw the grid worldially
    drawWorld();
    drawPlatypus();
}
const createWorld = () => {
    world = {};
    world.text = '';
    world.bases = {
        'l': GROUND_COLOR,
        'w': SWIM_COLOR,
        'b': WALL_COLOR,
    }
    world.canvasSize = CANVAS_SIZE;
    world.grid = [];
    world.images = {
        c: new Image(), // crab
        e: new Image(), // egg
    }
    world.images.c.src = "img/crab.png";
    world.images.e.src = "img/egg.png";

    return world;
}

const createPlatypus = (world) => {
    platypus = {};
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
    return platypus;
}

const drawWorld = (x, y, src) => {
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

    // Draw the colored squares and objects
    for (let r = 0; r < world.numRows; r++) {
        for (let c = 0; c < world.numCols; c++) {
            colorSquare(r, c, world.grid[gridLoc(r, c)].base);
            for (let obj of world.grid[gridLoc(r, c)].objects) {
                drawWorldObject(r, c, obj);
            }
        }
    }

    // draw the text
    document.querySelector('#instructions').innerText = world.text;
}

const drawPlatypus = ()  => {
    const canvas = document.getElementById("gridCanvas");
    const context = canvas.getContext("2d");
    const xpos = platypus.col * platypus.square_side_len + platypus.border;
    const ypos = platypus.row * platypus.square_side_len + platypus.border;
    context.drawImage(platypus.images[platypus.direction], xpos, ypos, platypus.square_side_len- 2 * platypus.border, platypus.square_side_len - 2 * platypus.border);
}

const drawWorldObject = (row, col, base)  => {
    const canvas = document.getElementById("gridCanvas");
    const context = canvas.getContext("2d");
    const xpos = col * platypus.square_side_len + platypus.border;
    const ypos = row * platypus.square_side_len + platypus.border;
    context.drawImage(world.images[base], xpos, ypos, platypus.square_side_len- 2 * platypus.border, platypus.square_side_len - 2 * platypus.border);
}

const colorSquare = (row, col, base) => {
    const canvas = document.getElementById("gridCanvas");
    const context = canvas.getContext("2d");
    const xpos = col * platypus.square_side_len + 1;
    const ypos = row * platypus.square_side_len + 1;
    context.beginPath();
    context.rect(xpos, ypos, platypus.square_side_len - 2, platypus.square_side_len - 2);
    context.fillStyle = world.bases[base];
    context.fill();
}

const rotatePlatypus = (clockwise) => {
    let directionMap;
    if (clockwise) {
        directionMap = { E: 'S', S: 'W', W: 'N', N: 'E', };
        addCommandToProgram('turn_right()');
    } else {
        directionMap = { E: 'N', S: 'E', W: 'S', N: 'W', };
        addCommandToProgram('turn_left()');
    }
    const new_dir = directionMap[platypus.direction];
    platypus.direction = new_dir;
    platypus.image = platypus.images[new_dir];
    drawWorld();
    drawPlatypus();
}

const gridLoc = (row, col) => row * world.numCols + col;

const movePlatypus = (base) => {
    // mode and color must match
    if (base != world.grid[gridLoc(platypus.row, platypus.col)].base) {
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
    switch (base) {
        case 'w':
            addCommandToProgram('swim()');
            break;
        case 'l':
            addCommandToProgram('walk()');
            break;
    }

    drawWorld();
    drawPlatypus();
    return true;
}

const loadWorld = async (url) => {
        await fetch(url)
            .then(res => res.text())
            .then(data => {
                world = createWorld();
                lines = data.split('\n');
                var line_num = 0;
                while (line_num < lines.length) {
                    let line = lines[line_num];
                    if (line.indexOf('#') == 0 || line == '') {
                        // skip comments and blanks
                        line_num++;
                        continue;
                    }
                    if (line == 'rows:') {
                        world.numRows = parseInt(lines[line_num + 1]);
                        line_num++;
                    } else if (line == 'cols:') {
                        world.numCols = parseInt(lines[line_num + 1]);
                        line_num++;
                    } else if (line == 'init_direction:') {
                        platypus.direction = lines[line_num + 1];
                        line_num++;
                    } else if (line == 'world:') {
                        for (var row = 0; row < world.numRows; row++) {
                            line_num++;
                            line = lines[line_num];
                            for (var col = 0; col < world.numCols; col++) {
                                world.grid.push({base: line[col], objects: []});
                            }
                            platypus = createPlatypus(world);
                        }
                        line_num++;
                    } else if (line == 'objects:') {
                        for (var row = 0; row < world.numRows; row++) {
                            line_num++;
                            line = lines[line_num];
                            for (var col = 0; col < world.numCols; col++) {
                                if (line[col] == 'p') {
                                    platypus.row = row;
                                    platypus.col = col;
                                } else if (line[col] != '.') {
                                    world.grid[row * world.numCols + col].objects.push(line[col]);
                                }
                            }
                        }
                        line_num++;
                    } else if (line == ':text:') {
                        world.text = '';
                        line_num++;
                        line = lines[line_num];
                        while (line != ':endtext:') {
                            world.text += line + '\n';
                            line_num++;
                            line = lines[line_num];
                        }
                        line_num++;
                    }

                    // console.log(line); 
                    line_num++;
                }
                platypus.square_side_len = world.canvasSize / Math.max(world.numRows, world.numCols);
                drawWorld();
                drawPlatypus();
        });
}

const eat = () => {
    // can only eat crabs
    const loc = gridLoc(platypus.row, platypus.col);
    objects = world.grid[loc].objects
    if (objects.indexOf('c') != -1) {
        removeObjectFromWorld(platypus.row, platypus.col, 'c')
        addCommandToProgram('eat()');
        return true;
    } else {
        return false;
    }
}

const lay_egg = () => {
    // eggs can only be layed on land
    const loc = gridLoc(platypus.row, platypus.col);
    base = world.grid[loc].base;
    if (base == 'l') {
        addObjectToWorld(platypus.row, platypus.col, 'e');
        addCommandToProgram('lay_egg()');
        return true;
    }
    return false;
}

const removeObjectFromWorld = (row, col, obj) => {
    const loc = gridLoc(platypus.row, platypus.col);
    world.grid[loc].objects.pop(world.grid[loc].objects.indexOf(obj)); 
    drawWorld();
    drawPlatypus();
}

const addObjectToWorld = (row, col, obj) => {
    const loc = gridLoc(platypus.row, platypus.col);
    world.grid[loc].objects.push(obj); 
    drawWorld();
    drawPlatypus();
}

const addCommandToProgram = (command) => {
    let editor = window.cmEditor;
    const newCode = editor.state.doc.toString() + command + '\n';
    editor.dispatch({
        changes: {from: 0, to: editor.state.doc.length, insert: newCode}
    });
    editor.domAtPos(editor.state.doc.length).node.scrollIntoView({block:'end'})
}
