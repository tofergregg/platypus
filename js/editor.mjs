import {basicSetup, EditorView} from "codemirror"
import {keymap} from "@codemirror/view"
import {python} from "@codemirror/lang-python"
import {EditorState} from "@codemirror/state"
import {autocompletion} from "@codemirror/autocomplete"
import {indentUnit} from "@codemirror/language"
import {indentWithTab} from "@codemirror/commands"

let editorTheme = EditorView.theme(
    {  '&': { maxHeight: '200px' },
        '.cm-gutter,.cm-content': { minHeight: '200px' },
        '.cm-scroller': { overflow: 'auto' },
    });

let editor = new EditorView({
    extensions: [
        basicSetup, 
        keymap.of([indentWithTab]),
        python(),
        autocompletion({activateOnTyping: false}),
        indentUnit.of("    "),
        editorTheme,
    ],
    parent: document.getElementById('editor')
})

window.cmEditor = editor;
