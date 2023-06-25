const WATER_COLOR = '#4EFFFF';
const GROUND_COLOR = '#FFF1DA';
const MAIN_CANVAS_WIDTH = 300;
const FINAL_CANVAS_WIDTH = 300;

class PlatypusWorld {
    constructor(numRows, numCols, _mainCanvas, _solutionCanvas) {
        this._numRows = numRows;
        this._numCols = numCols;
        this._mainCanvas = _mainCanvas;
        this._solutionCanvas = _solutionCanvas;
        this._grids = {
            initial: [],
            current: [],
            solution: [],
        }
        this.loadWorldImages();
        for (let row = 0; row < numRows; row++) {
            const newRow = [];
            for (let col = 0; col < numCols; col++) {
                newRow.push({base: WATER_COLOR});
            }
            this._grids.initial.push(JSON.parse(JSON.stringify(newRow)));
            this._grids.current.push(JSON.parse(JSON.stringify(newRow)));
            this._grids.solution.push(JSON.parse(JSON.stringify(newRow)));
        }
        this._platypus = {
            initial: {row: 0, col: 0, direction: 'E'},
            current: {row: 0, col: 0, direction: 'E'},
            solution: {row: 0, col: 0, direction: 'E'},
        };
    }
    set numRows(updatedRows) {
        let newGrid = [];
        if (updatedRows > this._numRows) {
            // add rows
            for (let row = 0; row < updatedRows - this._numRows; row++) {
            const newRow = [];
            for (let col = 0; col < this._numCols; col++) {
                newRow.push({base: WATER_COLOR});
            }
            this._grids.initial.push(JSON.parse(JSON.stringify(newRow)));
            this._grids.current.push(JSON.parse(JSON.stringify(newRow)));
            this._grids.solution.push(JSON.parse(JSON.stringify(newRow)));
            }
        } else {
            // remove rows
            for (let row = 0; row < this._numRows - updatedRows; row++) {
                this._grids.initial.pop();
                this._grids.current.pop();
                this._grids.solution.pop();
            }
        }
        this._numRows = updatedRows;
        this.drawWorld();
    }

    get numRows() {
        return this._numRows;
    }
    
    set numCols(updatedCols) {
        let newGrid = [];
        for (let row = 0; row < this._numRows; row++) {
            // add or remove columns
            if (updatedCols > this._numCols) {
                for (let col = 0; col < updatedCols - this._numCols; col++) {
                    this._grids.initial[row].push({base: WATER_COLOR});
                    this._grids.current[row].push({base: WATER_COLOR});
                    this._grids.solution[row].push({base: WATER_COLOR});
                }
            } else {
                for (let col = 0; col < this._numCols - updatedCols; col++) {
                    this._grids.initial[row].pop();
                    this._grids.current[row].pop();
                    this._grids.solution[row].pop();
                }
            }
        }
        this._numCols = updatedCols;
        if (this._mainCanvas) {
            this.drawWorld();
        }
    }

    get numCols() {
        return this._numCols;
    }

    drawWorld() {
        this.drawWorldOnCanvas(this._mainCanvas);
        if (this._solutionCanvas) {
            this.drawWorldOnCanvas(this._solutionCanvas);
        }
    }
    drawWorldOnCanvas(canvas) {
        this._cellSize = canvas.width / (Math.max(this._numRows, this._numCols));
        const context = canvas.getContext("2d");
        // Calculate the size of each cell (always square)
        const width = this._cellSize * this.numCols;
        const height = this._cellSize * this.numRows;

        // Clear the canvas
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.beginPath();
        // Draw the vertical _grid lines
        for (let x = 0; x <= width; x += this._cellSize) {
            context.moveTo(x, 0);
            context.lineTo(x, height);
        }
        // Draw the horizontal _grid lines
        for (let y = 0; y <= height; y += this._cellSize) {
            context.moveTo(0, y);
            context.lineTo(width, y);
        }

        // Set the color and stroke of the _grid lines
        context.strokeStyle = "black";
        context.lineWidth = 1;

        // Draw the _grid lines
        context.stroke();

        // Draw the colored squares
        // You cannot change the land and water
        // so it will always be from the initial grid
        let grid = this._grids.initial;
        for (let r = 0; r < this.numRows; r++) {
            for (let c = 0; c < this.numCols; c++) {
            const xpos = c * this._cellSize + 1;
            const ypos = r * this._cellSize + 1;
            context.beginPath();
            context.rect(xpos, ypos, this._cellSize - 2, this._cellSize - 2);
            context.fillStyle = grid[r][c].base;
            context.fill();
            }
        }

        // Draw the objects and the platypus
        const drawObjs = () => {
            // wait until all images are loaded
            for (let obj in this._worldImages) {
                if (!this._worldImages[obj].loaded) {
                    setTimeout(drawObjs, 50);
                    return;
                }
            }
            // okay, all images are loaded!
            // draw the non-platypus objects
            let grid = this._grids.current;
            if (canvas == solutionCanvas) {
                grid = this._grids.solution;
            }
            for (let row = 0; row < this._numRows; row++) {
                for (let col = 0; col < this._numCols; col++) {
                    const objs = grid[row][col];
                    for (let obj in objs) {
                        if (obj == 'base') {
                            continue;
                        }
                        const count = objs[obj];
                        const x = col * this._cellSize;
                        const y = row * this._cellSize;
                        const img = this._worldImages[obj[0]];
                        context.drawImage(img, x, y, this._cellSize, this._cellSize);
                        
                    }
                }
            }

            // draw the platypus
            let plat = this._platypus.current;
            if (canvas == solutionCanvas) {
                plat = this._platypus.solution;
            }
            const platImg = this._worldImages['plat' + plat.direction];
            let x = plat.col * this._cellSize;
            let y = plat.row * this._cellSize;
            context.drawImage(platImg, x, y, this._cellSize, this._cellSize);
        }
        drawObjs();
    }

    loadWorldImages() {
        this._worldImages = {
            c: new Image(), // crab
            e: new Image(), // egg
            platE: new Image(),
            platS: new Image(),
            platW: new Image(),
            platN: new Image(),
        }
        this._worldImages.c.onload = () => this.processLoadedImage('c');
        this._worldImages.e.onload = () => this.processLoadedImage('e');
        this._worldImages.platE.onload = () => this.processLoadedImage('platE');
        this._worldImages.platS.onload = () => this.processLoadedImage('platS');
        this._worldImages.platW.onload = () => this.processLoadedImage('platW');
        this._worldImages.platN.onload = () => this.processLoadedImage('platN');
        this._worldImages.c.src = "img/crab.png";
        this._worldImages.e.src = "img/egg.png";
        this._worldImages.platE.src = "img/platypus-facing-E.png";
        this._worldImages.platS.src = "img/platypus-facing-S.png";
        this._worldImages.platW.src = "img/platypus-facing-W.png";
        this._worldImages.platN.src = "img/platypus-facing-N.png";
    }

    processLoadedImage(img) {
        this._worldImages[img].loaded = true;
    }

    addPlatypus(x, y, canvas) {
        let plat = this._platypus.initial;
        if (canvas == solutionCanvas) {
            plat = this._platypus.solution;
        }
        const clickRow = Math.floor(y / this._cellSize);
        const clickCol = Math.floor(x / this._cellSize);
        if (plat.row == clickRow && plat.col == clickCol) {
            // rotate clockwise
            switch(plat.direction) {
                case 'E':
                    plat.direction = 'S';
                    break;
                case 'S':
                    plat.direction = 'W';
                    break;
                case 'W':
                    plat.direction = 'N';
                    break;
                case 'N':
                    plat.direction = 'E';
                    break;
            }
        } else {
            plat.row = clickRow;
            plat.col = clickCol;
        }
        // update initial to current for drawing
        Object.assign(this._platypus.current, this._platypus.initial);
        this.drawWorld();
    }

    addRemoveObject(x, y, canvas, obj, adding) {
        const clickRow = Math.floor(y / this._cellSize);
        const clickCol = Math.floor(x / this._cellSize);
        let grid = this._grids.initial;
        if (canvas == this._solutionCanvas) {
            grid = this._grids.solution;
        }
        if (adding) {
            if (!(obj in grid[clickRow][clickCol])) {
                grid[clickRow][clickCol][obj] = 1;
            } else {
                grid[clickRow][clickCol][obj]++;
            }
        }
        // update initial to current for drawing
        Object.assign(this._grids.current, this._grids.initial);
        this.drawWorld();
    }
    
    addRemoveBase(x, y, canvas, base, adding) {
        const clickRow = Math.floor(y / this._cellSize);
        const clickCol = Math.floor(x / this._cellSize);
        // always update both initial and solution,
        // becuase the base is always the same
        if (adding) {
            switch(base) {
                case 'water':
                    this._grids.initial[clickRow][clickCol].base = WATER_COLOR;
                    this._grids.solution[clickRow][clickCol].base = WATER_COLOR;
                    break;
                case 'land':
                    this._grids.initial[clickRow][clickCol].base = GROUND_COLOR;
                    this._grids.solution[clickRow][clickCol].base = GROUND_COLOR;
                    break;
            }
        }
        // update initial to current for drawing
        Object.assign(this._grids.current, this._grids.initial);
        this.drawWorld();
    }
}

window.PlatypusWorld = PlatypusWorld;

const onMouseClick = (e) => {
    const objType = document.querySelector('input[name=object-name]:checked').value;
    const adding = document.querySelector('input[name=add-remove-object]:checked').value == 'add-obj';
    if (objType == 'platypus') {
        window.world.addPlatypus(e.offsetX, e.offsetY, e.currentTarget);
    }
    if (objType == 'crab' || objType == 'egg') {
        window.world.addRemoveObject(e.offsetX, e.offsetY, e.currentTarget, objType, adding);
    }

    if (objType == 'land' || objType == 'water') {
        window.world.addRemoveBase(e.offsetX, e.offsetY, e.currentTarget, objType, adding);
    }

}

window.init_main = () => {

    const mainCanvas = document.querySelector('#mainCanvas');
    const solutionCanvas = document.querySelector('#solutionCanvas');

    mainCanvas.width = mainCanvas.height = MAIN_CANVAS_WIDTH;
    solutionCanvas.width = solutionCanvas.height = FINAL_CANVAS_WIDTH;

    window.world = new PlatypusWorld(2, 2, mainCanvas, solutionCanvas);
    mainCanvas.addEventListener("click", onMouseClick, false);
    solutionCanvas.addEventListener("click", onMouseClick, false);

    world.drawWorld();
}
