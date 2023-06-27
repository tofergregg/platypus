import { updateCanvas } from "./drawing.js";

let pyodideWorker;
window.codeRunning = false;
const callbacks = {};

const interruptExecution = () => {
    // sometimes, the program does not handle the interrupt
    // so, we'll just keep trying to interrupt until we 
    // get confirmation that the program has stopped
    // Basically, we'll keep hitting ctrl-c until we stop the program!
    window.codeRunning = false;
    pyodideWorker.terminate();
    setupWorker();
}

const setupWorker = () => {
    pyodideWorker = new Worker("./js/webworker.js");

    window.pyodideWorker = pyodideWorker;

    pyodideWorker.onmessage = async (event) => {
        const { id, ...data } = event.data;
        if (event.data.platypusCommand !== undefined) {
            const command = event.data.platypusCommand;
            if (command == 'turn_right()') {
                rotatePlatypus(true); // clockwise
                
            }
            if (command == 'turn_left()') {
                rotatePlatypus(false); // counterclockwise
            }
            
            if (command == 'swim()') {
                const success = movePlatypus('w'); // counterclockwise
                pyodideWorker.postMessage({cmd: "swim", success: success});
            }
            
            if (command == 'put_down()') {
                const success = put_down(event.data.arg); // counterclockwise
                pyodideWorker.postMessage({cmd: "put_down", success: success});
            }
            if (command == 'pick_up()') {
                const success = pick_up(event.data.arg); // counterclockwise
                pyodideWorker.postMessage({cmd: "pick_up", success: success});
            }
            
            if (command == 'check_is_water()') {
                const result = check_is_water(event.data.area); // counterclockwise
                pyodideWorker.postMessage({cmd: "check_is_water", result: result});
            }
            return;
        }
        if (event.data.outputText !== undefined) {
            console.log(event.data.outputText);
            const terminal = document.getElementById('console-output');
            terminal.value += event.data.outputText;
            terminal.blur();
            terminal.focus();

            if (event.data.getInput !== undefined && event.data.getInput) {
                getInputFromTerminal();
            }
            return;
        }
        if (event.data.cmd === 'updateCanvas') {
            updateCanvas(event.data.canvasCmd, event.data.dict);
            return;
        }

        if (event.data.cmd === 'getMousePos') {
            const lastX = window.lastMouse.x;
            const lastY = window.lastMouse.y;

            pyodideWorker.postMessage({cmd: "mouse_pos", x: lastX, y: lastY});
            return;
        }

        if (event.data.cmd === 'getMouseDown') {
            const lastX = window.lastMouseDown.x;
            const lastY = window.lastMouseDown.y;
            // update so we indicate that we've read it
            window.lastMouseDown.x = -1;
            window.lastMouseDown.y = -1;
            pyodideWorker.postMessage({cmd: "mouse_down", x: lastX, y: lastY});

            return;
        }
        if (event.data.cmd === 'clearTerminal') {
            const terminal = document.getElementById('console-output');
            terminal.value = '';
            return;
        }
        window.codeRunning = false;
        const onSuccess = callbacks[id];
        delete callbacks[id];
        if (typeof(onSuccess) === 'function') {
            onSuccess(data);
        } else {
            console.log("Error: " + error);
        }
    };
}

const sendMessageToWorker = (message) => {
    // console.log("Sending ");
    // console.log({'control': true, "message": message}); 
    pyodideWorker.postMessage({'control': true, "message": message});
};

const passSharedBuffer = (buf, waitBuf) => {
    pyodideWorker.postMessage({'buffer': buf, 'waitBuffer': waitBuf}); 
}

const asyncRun = ((script, context, stepSleep=50) => {
    let id = 0; // identify a Promise
    return (script, context, stepSleep) => {
        // the id could be generated more carefully
        id = (id + 1) % Number.MAX_SAFE_INTEGER;
        window.codeRunning = true;
        return new Promise((onSuccess) => {
            callbacks[id] = onSuccess;
            pyodideWorker.postMessage({
                ...context,
                python: script,
                id,
                stepSleep,
            });
        });
    };
})();

const consoleListener = () => {
    const terminal = document.getElementById('console-output');
    // first, check to see that the original text is still
    // present (otherwise, change back)
    const currentVal = terminal.value;
    if (!currentVal.startsWith(window.originalText)) {
        terminal.value = window.originalText + window.userInput;
    } else if (currentVal.endsWith('\n')) {
        terminal.removeEventListener('input', consoleListener);
        console.log("sending message: " + window.userInput);
        pyodideWorker.postMessage({cmd: "input_result", value: window.userInput});
    }
    else{
        window.userInput = currentVal.substring(window.originalText.length);
    }
}

const getInputFromTerminal = () => {
    const terminal = document.getElementById('console-output');
    const end = terminal.value.length;

    terminal.setSelectionRange(end, end);
    terminal.focus();
    // we need to configure the textarea so that we can control how the user
    // changes it. I.e., only allow text after the current text
    // get the current text in the textarea so we have it when there are changes
    window.originalText = terminal.value;
    window.userInput = '';
    terminal.addEventListener('input', consoleListener, false);
}

const updateSpeed = () => {
    const speed = document.querySelector('#speed-slider').value;
    pyodideWorker.postMessage({cmd: "run_speed", stepSleep:speed});
}

export { setupWorker, asyncRun, sendMessageToWorker, interruptExecution, updateSpeed };
