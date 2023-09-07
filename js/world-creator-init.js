const MAIN_CANVAS_WIDTH = 400;
const FINAL_CANVAS_WIDTH = 400;
const INSERTION_CODE = '# __insertion will start here (leave this line)__';

window.init_main = () => {

    const mainCanvas = document.querySelector('#mainCanvas');
    const solutionCanvas = document.querySelector('#solutionCanvas');

    mainCanvas.width = mainCanvas.height = MAIN_CANVAS_WIDTH;
    solutionCanvas.width = solutionCanvas.height = FINAL_CANVAS_WIDTH;
    window.numWorlds = 1; // start with one world
    window.worlds = []; // our array of worlds

    // put in the first world
    window.worlds.push(new PlatypusWorld(2, 2, mainCanvas, solutionCanvas));
    mainCanvas.addEventListener("click", onMouseClick, false);
    solutionCanvas.addEventListener("click", onMouseClick, false);

    worlds[0].drawWorld();

    const currentValue = cmEditor.state.doc.toString();
    const endPosition = currentValue.length;

    cmEditor.dispatch({
      changes: {
        from: 0,
        to: endPosition,
        insert: INSERTION_CODE,
      },
    });
}

const onMouseClick = (e) => {
    const objType = document.querySelector('input[name=object-name]:checked').value;
    const adding = document.querySelector('input[name=add-remove-object]:checked').value == 'add-obj';
    const world = worlds[parseInt(document.querySelector('#world-selector').value)];
    if (objType == 'platypus') {
        world.addPlatypus(e.offsetX, e.offsetY, e.currentTarget);
    }
    if (objType == 'crab' || objType == 'egg') {
        world.addRemoveObject(e.offsetX, e.offsetY, e.currentTarget, objType, adding);
    }

    if (objType == 'land' || objType == 'water') {
        world.addRemoveBase(e.offsetX, e.offsetY, e.currentTarget, objType, adding);
    }
}

const updateNumWorlds = () => {
    const oldNumWorlds = window.numWorlds;
    numWorldsSelector = document.querySelector('#num-worlds');
    window.numWorlds = parseInt(numWorldsSelector.value);
    if (window.numWorlds < oldNumWorlds) {
        if (!window.confirm("Are you sure you want to remove the last world?")) {
            numWorldsSelector.value = oldNumWorlds.toString();
            return;
        }
    }
    const selector = document.querySelector('#world-selector');
    const worldIdx = parseInt(selector.value);
    removeOptions(selector);
    for (let i = 0; i < window.numWorlds; i++) {
        let opt = '<option value="' + i + '"';
        if (i == window.numWorlds - 1) { 
            opt += ' selected';
        }
        opt += '>' + (i + 1) + '</option>\n'; // off-by-one for human consumption
        selector.innerHTML += opt;
    }

    if (window.numWorlds > oldNumWorlds) {
        // duplicate the last world into the new worlds
        const lastWorld = worlds[oldNumWorlds - 1];
        const currentWorldJson = lastWorld.exportWorld();
        for (let i = oldNumWorlds; i < window.numWorlds; i++) {
            const newWorld = loadWorldFromJson(mainCanvas, solutionCanvas, currentWorldJson);
            window.worlds.push(newWorld);
        }
    }
    changeWorld(); 
}

const changeWorld = () => {
    const worldIdx = parseInt(document.querySelector('#world-selector').value);
    worlds[worldIdx].drawWorld();
    // we have to update the numRows/Cols and the platypus details as well
    document.querySelector('#rows').value = worlds[worldIdx].numRows;
    document.querySelector('#cols').value = worlds[worldIdx].numCols;
    document.querySelector('#num-crabs').value = worlds[worldIdx]._platypus.initial.crab;
    document.querySelector('#num-eggs').value = worlds[worldIdx]._platypus.initial.egg;

}

function removeOptions(selectElement) {
   var i, L = selectElement.options.length - 1;
   for(i = L; i >= 0; i--) {
      selectElement.remove(i);
   }
}

const exportWorlds = () => {
    const worldsArr = [];
    for (let world of worlds) {
        worldsArr.push(JSON.parse(world.exportWorld()));
    }

    const worldsJson = JSON.stringify({
        worlds: worldsArr,
        starterCode: cmEditor.state.doc.toString(),
        instructions: document.querySelector('#instructions').value,
    }, null, 2);
    copyToClipboard(worldsJson);
}

const copyToClipboard = async (text) => {
    try {
        await navigator.clipboard.writeText(text);
        console.log('Content copied to clipboard');
    } catch (err) {
        console.error('Failed to copy: ', err);
    }
}

const uploadWorlds = async () => {
    const worldsArr = [];
    for (let world of worlds) {
        worldsArr.push(JSON.parse(world.exportWorld()));
    }

    const worldsJson = JSON.stringify({
        worlds: worldsArr,
        starterCode: cmEditor.state.doc.toString(),
        instructions: document.querySelector('#instructions').value,
    }, null, 2);
    const response = await fetch('https://yourfirstyearteaching.com/cgi-bin/platypus/saveNewWorlds.py', {
    method: "POST", 
    cache: "no-cache", 
    headers: {
      "Content-Type": "application/json",
    },
        body: worldsJson, // body data type must match "Content-Type" header
    });
    const urlSuffix = await response.json();
    // urlSuffix should be in the form wrd1-wrd2-wrd3-wrd4
    // window.history.pushState('shared kira code', '', '?shared='+urlSuffix)
    // await copyToClipboard(window.location.href);
    // alert("You've shared your code!\nLink copied to clipboard:\n" + window.location.href);
    const completeUrl = 'https://yourfirstyearteaching.com/platypus/?testing='+urlSuffix;
    await copyToClipboard(completeUrl);
    alert("You've shared your code!\nLink copied to clipboard:\n" + completeUrl);
}
