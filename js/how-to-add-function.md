To add a python function:

- in webworker.js:
(no need)  - add function to `from js import turn_right,` ...
  - add js version of function (e.g., `async function put_down(obj)`)
- in site.js:
  - add function to `parse_functions`   
  - create function to interact with canvas, if necessary
- in py-worker.js:
  - add command to `pyodideWorker.onmessage` 
- in platypusPyLib.js:
  - add command to call js 
