// webworker.js

// Setup your project to serve `py-worker.js`. You should also serve
// `pyodide.js`, and all its associated `.asm.js`, `.data`, `.json`,
// and `.wasm` files as well:
importScripts("https://cdn.jsdelivr.net/pyodide/v0.23.1/full/pyodide.js");
importScripts("./drawingPyLib2.js");
importScripts("./platypusPyLib.js");

async function loadPyodideAndPackages() {
    let first = true;
    self.pyodide = await loadPyodide({
        stdout: text => {
            if (text == "Python initialization complete" && first) {
                first = false;
                return;
            }
            // console.log("output: " + text);
            self.postMessage({outputText: text + '\n'});
        },
        stderr: text => {
            // console.log("output: " + text);
            self.postMessage({outputText: text + '\n'});
        }
    });
    // await self.pyodide.loadPackage(["numpy", "pytz"]);
}
let pyodideReadyPromise = loadPyodideAndPackages();

self.jsMessage = null; 

self.onmessage = async (event) => {
    if (event.data.cmd === "stopProgram") {
        console.log("got stopProgram message");
        check_for_stop.stopped = true;
        return;
    }
    if (event.data.cmd === "input_result") {
        console.log("got input!");
        input_fixed.inputResult = event.data.value;
        return;
    }
    if (event.data.cmd === "mouse_pos") {
        getMousePos.x = event.data.x;
        getMousePos.y = event.data.y;
        return;
    }
    if (event.data.cmd === "mouse_down") {
        getMouseDown.x = event.data.x;
        getMouseDown.y = event.data.y;
        return;
    }
    
    if (event.data.cmd === "canvas_size") {
        getCanvasSize.width = event.data.width;
        getCanvasSize.height = event.data.height;
        return;
    }

    if (event.data.cmd === 'run_speed') {
        this.stepSleep = event.data.stepSleep; 
        return;
    }
    if (event.data.control !== undefined) {
        console.log("Control event");
        self.jsMessage = event.data.message;
        return;
    }
    if (event.data.buffer !== undefined) {
        // got the shared buffers
        self.sharedArr = new Uint8Array(event.data.buffer);
        self.waitArr = new Int32Array(event.data.waitBuffer);
        return;
    }

    // platypus return values
    if (event.data.cmd === 'swim') {
        swim_js.success = event.data.success;
        return;
    }
    
    if (event.data.cmd === 'put_down') {
        put_down_js.success = event.data.success;
        return;
    }
    
    if (event.data.cmd === 'pick_up') {
        pick_up_js.success = event.data.success;
        return;
    }
    
    if (event.data.cmd === 'check_is_water') {
        check_is_water_js.result = event.data.result;
        return;
    }
    
    if (event.data.cmd === 'facing') {
        facing_js.result = event.data.result;
        return;
    }
    
    if (event.data.cmd === 'count') {
        count_js.result = event.data.result;
        return;
    }

    // make sure loading is done
    await pyodideReadyPromise;
    self.pyodide.setInterruptBuffer(self.interruptBuffer);
    // Don't bother yet with this line, suppose our API is built in such a way:
    let { id, python, stepSleep, ...context } = event.data;
    this.stepSleep = stepSleep;
    // The worker copies the context in its own "memory" (an object mapping name to values)
    for (const key of Object.keys(context)) {
        self[key] = context[key];
    }
    check_for_stop.stopped = false;
    // Now is the easy part, the one that is similar to working in the main thread:

    try {
        await self.pyodide.runPythonAsync(`
        from js import input_fixed
        import asyncio
        import pyodide
        __builtins__.input = input_fixed
        `);
        await self.pyodide.runPythonAsync(drawingLib);
        await self.pyodide.runPythonAsync(platypusLib);
        await self.pyodide.loadPackagesFromImports(python);
        python = fixTimeImport(python)
        let results = await self.pyodide.runPythonAsync(python);
        self.postMessage({ results, id });
    } catch (error) {
        self.postMessage({ error: error.message, id });
    }
};

const waitForInput = (r) => {
    if (input_fixed.inputResult !== null) {
        return r(input_fixed.inputResult);
    }
    setTimeout(() => {
        waitForInput(r);
    }, 100);
}

async function input_fixed(text, first) {
    console.log("input requested: " + text)
    input_fixed.inputResult = null;
    self.postMessage({outputText: text, getInput: true});
    return new Promise((r) => setTimeout(() => {
        waitForInput(r);
    }));

    if (first) {
        console.log("input requested: " + text)
        input_fixed.inputResult = null;
        self.postMessage({outputText: text, getInput: true});
    } else {
        // console.log('.');
        // check for result
        // see if we can force the message to be read
        return pyodide.toPy({'done': true, 'result': "5"});
        if (input_fixed.inputResult !== null) {
            return pyodide.toPy({'done': true, 'result': inputResult});
        }
    }
    return pyodide.toPy({'done': false, 'result': 0});
};

function sleep_fixed(t_sec) {
    return new Promise(resolve => setTimeout(resolve, t_sec * 1000));
}


const fixTimeImport = (code) => {
    // this function finds `import time` and on the next line
    // it inserts code to fix the time.sleep function to work with pyodide
    // Notes: 
    // 1. it does not fix "import time, sys" constructs
    const insertCode1 = 'import time; from js import sleep_fixed; time.sleep = sleep_fixed\n';
    const insertCode2 = 'from time import sleep; from js import sleep_fixed; sleep = sleep_fixed\n';
    code = code.replace('import time\n', insertCode1);
    code = code.replace('from time import sleep\n', insertCode2);
    return code;
}

function updateCanvas(cmd, dict) {
    self.postMessage({cmd: 'updateCanvas', 'canvasCmd': cmd, 'dict': dict.toJs()});
}

const waitForMousePos = (r) => {
    if (getMousePos.x !== null && getMousePos.y !== null) {
        return r(pyodide.toPy({'x': getMousePos.x, 'y': getMousePos.y}));
    }
    setTimeout(() => {
        waitForMousePos(r);
    });
}

async function getMousePos(x_or_y) {
    getMousePos.result = null;
    self.postMessage({cmd: 'getMousePos'});
    return new Promise((r) => setTimeout(() => {
        waitForMousePos(r);
    }));
}

const waitForMouseDown = (r) => {
    if (getMouseDown.x !== null && getMouseDown.y !== null) {
        return r(pyodide.toPy({'x': getMouseDown.x, 'y': getMouseDown.y}));
    }
    setTimeout(() => {
        waitForMouseDown(r);
    });
}

function getMouseDown(x_or_y) {
    getMouseDown.x = null;
    getMouseDown.y = null;
    self.postMessage({cmd: 'getMouseDown'});
    return new Promise((r) => setTimeout(() => {
        waitForMouseDown(r);
    }));
}

const waitForCanvasSize = (r) => {
    if (getCanvasSize.width !== null && getCanvasSize.height !== null) {
        return r(pyodide.toPy({'width': getCanvasSize.width, 'height': getCanvasSize.height}));
    }
    setTimeout(() => {
        waitForCanvasSize(r);
    });
}

function getCanvasSize() {
    getCanvasSize.width = null;
    getCanvasSize.height = null;
    self.postMessage({cmd: 'getCanvasSize'});
    return new Promise((r) => setTimeout(() => {
        waitForCanvasSize(r);
    }));
}

function clearTerminal() {
    self.postMessage({cmd: 'clearTerminal'});
}

function check_for_stop() {
    if (check_for_stop.count === undefined) {
        check_for_stop.count = 0;
    } else {
        check_for_stop.count++;
    }
    if (check_for_stop.count % 1000 == 0) {
        console.log(check_for_stop.count);
    }
    // return new Promise(resolve => setTimeout(resolve, 0, check_for_stop.stopped));
    return Promise.resolve(check_for_stop.stopped);
}

// platypus commands
async function turn_right_js() {
    await sleep_fixed(0.3 * 50 / this.stepSleep);
    self.postMessage({platypusCommand: 'turn_right()'});
}

async function turn_left_js() {
    await sleep_fixed(0.3 * 50 / this.stepSleep);
    self.postMessage({platypusCommand: 'turn_left()'});
}

async function swim_js() {
    swim_js.success = undefined; // prep for until
    await sleep_fixed(0.3 * 50 / this.stepSleep);
    self.postMessage({platypusCommand: 'swim()'});
    await until(() => { return swim_js.success !== undefined });
    return swim_js.success;
}

async function put_down_js(obj) {
    put_down_js.success = undefined; // prep for until
    await sleep_fixed(0.3 * 50 / this.stepSleep);
    self.postMessage({platypusCommand: 'put_down()', arg: obj});
    await until(() => { return put_down_js.success !== undefined });
    return put_down_js.success;
}

async function pick_up_js(obj) {
    pick_up_js.success = undefined; // prep for until
    await sleep_fixed(0.3 * 50 / this.stepSleep);
    self.postMessage({platypusCommand: 'pick_up()', arg: obj});
    await until(() => { return pick_up_js.success !== undefined });
    return pick_up_js.success;
}

async function check_is_water_js(area) {
    // area is 'front', 'left', or 'right'
    check_is_water_js.result = undefined; // prep for until
    await sleep_fixed(0.3 * 50 / this.stepSleep);
    self.postMessage({platypusCommand: 'check_is_water()', area:area});
    await until(() => { return check_is_water_js.result !== undefined });
    return check_is_water_js.result;
}

async function facing_js(direction) {
    facing_js.result = undefined; // prep for until
    await sleep_fixed(0.3 * 50 / this.stepSleep);
    self.postMessage({platypusCommand: 'facing()', direction:direction});
    await until(() => { return facing_js.result !== undefined });
    return facing_js.result;
}

async function count_js(who, obj) {
    count_js.result = undefined; // prep for until
    await sleep_fixed(0.3 * 50 / this.stepSleep);
    self.postMessage({platypusCommand: 'count()', who:who, obj:obj});
    await until(() => { return count_js.result !== undefined });
    return count_js.result;
}

const until = (predFn) => {
  const poll = (done) => (predFn() ? done() : setTimeout(() => {
      poll(done);
  }, 1));
  return new Promise(poll);
};

