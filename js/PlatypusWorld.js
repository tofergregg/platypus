const WATER_COLOR = '#A1E2FC';
const GROUND_COLOR = '#FFF1DA';

class PlatypusWorld {
    constructor(numRows, numCols, mainCanvas, solutionCanvas) {
        this._numRows = numRows;
        this._numCols = numCols;
        this._mainCanvas = mainCanvas;
        this._solutionCanvas = solutionCanvas;
        this._grids = {
            initial: [],
            current: [],
            solution: [],
        }
        this.loadWorldImages();
        for (let row = 0; row < numRows; row++) {
            const newRow = [];
            for (let col = 0; col < numCols; col++) {
                newRow.push({base: 'w'});
            }
            this._grids.initial.push(JSON.parse(JSON.stringify(newRow)));
            this._grids.current.push(JSON.parse(JSON.stringify(newRow)));
            this._grids.solution.push(JSON.parse(JSON.stringify(newRow)));
        }
        this._platypus = {
            initial: {row: 0, col: 0, direction: 'E', crab: 100, egg: 100},
            current: {row: 0, col: 0, direction: 'E', crab: 100, egg: 100},
            solution: {row: 0, col: 0, direction: 'E'}, // no need to count solution amounts
        };
    }

    set numRows(updatedRows) {
        let newGrid = [];
        if (updatedRows > this._numRows) {
            // add rows
            for (let row = 0; row < updatedRows - this._numRows; row++) {
            const newRow = [];
            for (let col = 0; col < this._numCols; col++) {
                newRow.push({base: 'w'});
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
        if (this._platypus.initial.row >= this._numRows) {
            this._platypus.initial.row = this._numRows - 1;
        }
        if (this._platypus.current.row >= this._numRows) {
            this._platypus.current.row = this._numRows - 1;
        }
        if (this._platypus.solution.row >= this._numRows) {
            this._platypus.solution.row = this._numRows - 1;
        }
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
                    this._grids.initial[row].push({base: 'w'});
                    this._grids.current[row].push({base: 'w'});
                    this._grids.solution[row].push({base: 'w'});
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
        if (this._platypus.initial.col >= this._numCols) {
            this._platypus.initial.col = this._numCols - 1;
        }
        if (this._platypus.current.col >= this._numCols) {
            this._platypus.current.col = this._numCols - 1;
        }
        if (this._platypus.solution.col >= this._numCols) {
            this._platypus.solution.col = this._numCols - 1;
        }
        this.drawWorld();
    }

    get numCols() {
        return this._numCols;
    }

    drawWorld() {
        this._mainCanvas = document.querySelector('#mainCanvas');
        this._solutionCanvas = document.querySelector('#solutionCanvas');
        const instructionsDiv = document.querySelector('#instructions');
        
        this.drawWorldOnCanvas(this._mainCanvas);
        if (this._solutionCanvas) {
            this._solutionCanvas.width = this._solutionCanvas.height = instructionsDiv.offsetWidth;
            this.drawWorldOnCanvas(this._solutionCanvas);
        }
        updateEggsAndCrabs(this._platypus.current.egg, this._platypus.current.crab);
    }
    drawWorldOnCanvas(canvas) {
        const cellSize = canvas.width / (Math.max(this._numRows, this._numCols));
        const context = canvas.getContext("2d");
        // Calculate the size of each cell (always square)
        const width = cellSize * this.numCols;
        const height = cellSize * this.numRows;

        // Clear the canvas
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.beginPath();
        // Draw the vertical _grid lines
        for (let x = 0; x <= width; x += cellSize) {
            context.moveTo(x, 0);
            context.lineTo(x, height);
        }
        // Draw the horizontal _grid lines
        for (let y = 0; y <= height; y += cellSize) {
            context.moveTo(0, y);
            context.lineTo(width, y);
        }

        // Set the color and stroke of the _grid lines
        context.strokeStyle = "black";
        context.lineWidth = 1;

        // Draw the _grid lines
        context.stroke();

        // Draw the colored squares
        // Water can be colorful, but land must have the land icon
        let grid = this._grids.current;
        if (canvas == this._solutionCanvas) {
            grid = this._grids.solution;
        }
        for (let r = 0; r < this.numRows; r++) {
            for (let c = 0; c < this.numCols; c++) {
                const xpos = c * cellSize + 1;
                const ypos = r * cellSize + 1;
                context.beginPath();
                context.rect(xpos, ypos, cellSize - 2, cellSize - 2);
                let baseColor;
                switch (grid[r][c].base) {
                    case 'w': 
                        baseColor = WATER_COLOR;
                        break;
                    case 'l': 
                        baseColor = GROUND_COLOR;
                        break;
                    default:
                        baseColor = grid[r][c].base;
                }
                context.fillStyle = baseColor;
                context.fill();
                if (grid[r][c].base == 'l') {
                    // draw land
                    const waitForLand = () => {
                        if (!this._worldImages['land'].loaded) {
                            setTimeout(waitForLand, 50);
                        } else {
                            const img = this._worldImages['land'];
                            context.drawImage(img, xpos, ypos, cellSize, cellSize);
                        }
                    }
                    waitForLand();

                }
            }
        }

        // Draw the objects and the platypus
        const drawObjs = () => {
            // wait until all images are loaded
            for (let obj in this._worldImages) {
                if (!this._worldImages[obj].loaded) {
                    setTimeout(drawObjs, 50);
                }
            }
            // okay, all images are loaded!
            // draw the non-platypus objects
            let grid = this._grids.current;
            if (canvas == this._solutionCanvas) {
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
                        const x = col * cellSize;
                        const y = row * cellSize;
                        const img = this._worldImages[obj];
                        context.drawImage(img, x, y, cellSize, cellSize);

                    }
                }
            }

            // draw the platypus
            let plat = this._platypus.current;
            if (canvas == this._solutionCanvas) {
                plat = this._platypus.solution;
            }
            const platImg = this._worldImages['plat' + plat.direction];
            let x = plat.col * cellSize;
            let y = plat.row * cellSize;
            context.drawImage(platImg, x, y, cellSize, cellSize);
        }
        drawObjs();
    }

    loadWorldImages() {
        this._worldImages = {
            crab: new Image(),
            egg: new Image(),
            platE: new Image(),
            platS: new Image(),
            platW: new Image(),
            platN: new Image(),
            land: new Image(),
        }
        this._worldImages.crab.onload = () => this.processLoadedImage('crab');
        this._worldImages.egg.onload = () => this.processLoadedImage('egg');
        this._worldImages.platE.onload = () => this.processLoadedImage('platE');
        this._worldImages.platS.onload = () => this.processLoadedImage('platS');
        this._worldImages.platW.onload = () => this.processLoadedImage('platW');
        this._worldImages.platN.onload = () => this.processLoadedImage('platN');
        this._worldImages.land.onload = () => this.processLoadedImage('land');
        this._worldImages.crab.src = "images/platypus/crab.png";
        this._worldImages.egg.src = "images/platypus/egg.png";
        this._worldImages.platE.src = "images/platypus/platypus-facing-E.png";
        this._worldImages.platS.src = "images/platypus/platypus-facing-S.png";
        this._worldImages.platW.src = "images/platypus/platypus-facing-W.png";
        this._worldImages.platN.src = "images/platypus/platypus-facing-N.png";
        this._worldImages.land.src = "images/platypus/land.png";
    }

    processLoadedImage(img) {
        this._worldImages[img].loaded = true;
    }

    addPlatypus(x, y, canvas) {
        let plat = this._platypus.initial;
        if (canvas == solutionCanvas) {
            plat = this._platypus.solution;
        }
        const cellSize = canvas.width / (Math.max(this._numRows, this._numCols));
        const clickRow = Math.floor(y / cellSize);
        const clickCol = Math.floor(x / cellSize);
        if (this._grids.initial[clickRow][clickCol].base == 'w') {
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
            this._platypus.current = JSON.parse(JSON.stringify(this._platypus.initial));
            this.drawWorld();
        }
    }

    addRemoveObject(x, y, canvas, obj, adding, force=false) {
        const cellSize = canvas.width / (Math.max(this._numRows, this._numCols));
        const clickRow = Math.floor(y / cellSize);
        const clickCol = Math.floor(x / cellSize);
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
        } else {
            if (obj in grid[clickRow][clickCol]) {
                grid[clickRow][clickCol][obj]--;
                if (grid[clickRow][clickCol][obj] == 0) {
                    delete grid[clickRow][clickCol][obj];
                }
            }
        }
        // update initial to current for drawing
        this._grids.current = JSON.parse(JSON.stringify(this._grids.initial));
        this.drawWorld();
    }

    addRemoveBase(x, y, canvas, base, adding) {
        const cellSize = canvas.width / (Math.max(this._numRows, this._numCols));
        const clickRow = Math.floor(y / cellSize);
        const clickCol = Math.floor(x / cellSize);
        // always update both initial and solution,
        // becuase the base is always the same
        if (adding) {
            switch(base) {
                case 'water':
                    this._grids.initial[clickRow][clickCol].base = 'w';
                    this._grids.solution[clickRow][clickCol].base = 'w';
                    break;
                case 'land':
                    if (!(this._platypus.initial.row == clickRow && this._platypus.initial.col == clickCol)) {
                        this._grids.initial[clickRow][clickCol].base = 'l';
                        this._grids.solution[clickRow][clickCol].base = 'l';
                    }
                    break;
            }
        }
        // update initial to current for drawing
        this._grids.current = JSON.parse(JSON.stringify(this._grids.initial));
        this.drawWorld();
    }
    addRemoveColor(x, y, canvas, obj, adding, color, force=false) {
        const cellSize = canvas.width / (Math.max(this._numRows, this._numCols));
        const clickRow = Math.floor(y / cellSize);
        const clickCol = Math.floor(x / cellSize);
        let grid = this._grids.initial;
        if (canvas == this._solutionCanvas) {
            grid = this._grids.solution;
        }
        if (adding) {
            grid[clickRow][clickCol].base = color;
        } else {
            grid[clickRow][clickCol].base = 'w';
        }
        // update initial to current for drawing
        this._grids.current = JSON.parse(JSON.stringify(this._grids.initial));
        this.drawWorld();
    }

    exportWorld() {
        // make sure current is equivalent to initial
        this._platypus.current = JSON.parse(JSON.stringify(this._platypus.initial));
        this._grids.current = JSON.parse(JSON.stringify(this._grids.initial));
        const exportString = JSON.stringify({
            numRows: this._numRows,
            numCols: this._numCols,
            grids: this._grids,
            platypus: this._platypus,
            // starterCode: cmEditor.state.doc.toString(),
            // instructions: document.querySelector('#instructions').value,
        }, null, 2);
        // console.log(exportString);
        return exportString;
    }

    populateData(data) {
        this._grids = data.grids;
        this._platypus = data.platypus;
        this._instructions = data.instructions;
        this._starterCode = data.starterCode;
    }
}

if (typeof window !== "undefined") {
    window.PlatypusWorld = PlatypusWorld;
}

const loadWorlds = async (mainCanvas, solutionCanvas, url) => {
    const worlds = [];
    const response = await fetch(url);
    const data = await response.json();
    for (let worldData of data.worlds) {
        const world = new PlatypusWorld(worldData.numRows, worldData.numCols, mainCanvas, solutionCanvas); 
        world.populateData(worldData);
        worlds.push(world);
    }
    return {
        worlds: worlds,
        instructions: data.instructions,
        starterCode: data.starterCode,
    };
}
if (typeof window !== "undefined") {
    window.loadWorlds = loadWorlds;
}

const loadWorldFromJson = (mainCanvas, solutionCanvas, dataStr) => {
    const data = JSON.parse(dataStr); 
    const world = new PlatypusWorld(data.numRows, data.numCols, mainCanvas, solutionCanvas); 
    world.populateData(data);
    return world;
}
if (typeof window !== "undefined") {
    window.loadWorldFromJson = loadWorldFromJson;
}

const updateEggsAndCrabs = (numEggs, numCrabs) => {
    const eggCrabSpan = document.querySelector('#numEggsAndCrabs');
    if (eggCrabSpan) {
        if (numEggs >= 0) {
            let updateStr = 'The platypus is carrying ' + numEggs.toString() + ' eggs and ' + numCrabs.toString() + ' crabs.';
            if (numEggs == 1) {
                updateStr = updateStr.replace('eggs', 'egg');
            }
            
            if (numCrabs == 1) {
                updateStr = updateStr.replace('crabs', 'crab');
            }
            eggCrabSpan.innerText = updateStr;
        } else {
            eggCrabSpan.innerText = '';
        }
    }
}

export { loadWorlds };
