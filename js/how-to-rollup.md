# How to rollup for codemirror6:

You must run the following steps when creating a new repo.
```plaintext
% npm i codemirror @codemirror/lang-javascript
% npm i codemirror @codemirror/lang-python
% npm i rollup @rollup/plugin-node-resolve

Run every time after modifying editor.mjs
% node_modules/.bin/rollup editor.mjs -f iife -o editor.bundle.js \
  -p @rollup/plugin-node-resolve
```
