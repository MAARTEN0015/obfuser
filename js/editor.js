export class EditorManager {
    constructor() {
        this.inputEditor = null;
        this.outputEditor = null;
        this.currentLanguage = 'javascript';
        this.onInputChangeCallback = null;
    }
    
    init() {
        // Define custom themes
        this.defineThemes();
        
        // Common editor options
        const commonOptions = {
            automaticLayout: true,
            fontSize: 14,
            fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
            fontLigatures: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            renderLineHighlight: 'line',
            lineNumbers: 'on',
            folding: true,
            bracketPairColorization: { enabled: true },
            smoothScrolling: true,
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            padding: { top: 16, bottom: 16 },
            scrollbar: {
                vertical: 'auto',
                horizontal: 'auto',
                verticalScrollbarSize: 10,
                horizontalScrollbarSize: 10
            },
            overviewRulerBorder: false,
            hideCursorInOverviewRuler: true,
            renderLineHighlightOnlyWhenFocus: true,
            lineDecorationsWidth: 0,
            lineNumbersMinChars: 3
        };
        
        // Initialize input editor
        this.inputEditor = monaco.editor.create(document.getElementById('inputEditor'), {
            ...commonOptions,
            value: this.getDefaultCode(),
            language: 'javascript',
            theme: this.getMonacoTheme()
        });
        
        // Initialize output editor
        this.outputEditor = monaco.editor.create(document.getElementById('outputEditor'), {
            ...commonOptions,
            value: '',
            language: 'javascript',
            theme: this.getMonacoTheme(),
            readOnly: true,
            domReadOnly: true
        });
        
        // Handle input changes
        this.inputEditor.onDidChangeModelContent(() => {
            if (this.onInputChangeCallback) {
                this.onInputChangeCallback();
            }
        });
        
        // Initial stats update
        if (this.onInputChangeCallback) {
            this.onInputChangeCallback();
        }
    }
    
    defineThemes() {
        // Dark theme
        monaco.editor.defineTheme('obfuscator-dark', {
            base: 'vs-dark',
            inherit: true,
            rules: [
                { token: 'comment', foreground: '6A9955' },
                { token: 'keyword', foreground: 'C586C0' },
                { token: 'string', foreground: 'CE9178' },
                { token: 'number', foreground: 'B5CEA8' },
                { token: 'function', foreground: 'DCDCAA' }
            ],
            colors: {
                'editor.background': '#1e1e22',
                'editor.foreground': '#d4d4d4',
                'editor.lineHighlightBackground': '#2a2a2f',
                'editor.selectionBackground': '#264f78',
                'editor.inactiveSelectionBackground': '#3a3d41',
                'editorLineNumber.foreground': '#5a5a5f',
                'editorLineNumber.activeForeground': '#c6c6c6',
                'editorCursor.foreground': '#6366f1',
                'editor.selectionHighlightBackground': '#add6ff26',
                'editorIndentGuide.background': '#404040',
                'editorIndentGuide.activeBackground': '#707070',
                'editorBracketMatch.background': '#0064001a',
                'editorBracketMatch.border': '#888888'
            }
        });
        
        // Light theme
        monaco.editor.defineTheme('obfuscator-light', {
            base: 'vs',
            inherit: true,
            rules: [
                { token: 'comment', foreground: '008000' },
                { token: 'keyword', foreground: 'AF00DB' },
                { token: 'string', foreground: 'A31515' },
                { token: 'number', foreground: '098658' },
                { token: 'function', foreground: '795E26' }
            ],
            colors: {
                'editor.background': '#ffffff',
                'editor.foreground': '#1e1e1e',
                'editor.lineHighlightBackground': '#f5f5f5',
                'editor.selectionBackground': '#add6ff',
                'editorLineNumber.foreground': '#999999',
                'editorLineNumber.activeForeground': '#333333',
                'editorCursor.foreground': '#6366f1',
                'editorIndentGuide.background': '#e0e0e0',
                'editorIndentGuide.activeBackground': '#c0c0c0'
            }
        });
    }
    
    getMonacoTheme() {
        const theme = document.documentElement.getAttribute('data-theme');
        return theme === 'light' ? 'obfuscator-light' : 'obfuscator-dark';
    }
    
    getDefaultCode() {
        return `// Welcome to Obfuscator Pro!
// Paste your code here and click "Obfuscate"

function greet(name) {
    const message = "Hello, " + name + "!";
    console.log(message);
    return message;
}

const user = "World";
greet(user);

// Try different presets and options
// to customize the obfuscation`;
    }
    
    onInputChange(callback) {
        this.onInputChangeCallback = callback;
    }
    
    getInputValue() {
        return this.inputEditor ? this.inputEditor.getValue() : '';
    }
    
    setInputValue(value) {
        if (this.inputEditor) {
            this.inputEditor.setValue(value);
        }
    }
    
    getOutputValue() {
        return this.outputEditor ? this.outputEditor.getValue() : '';
    }
    
    setOutputValue(value) {
        if (this.outputEditor) {
            this.outputEditor.setValue(value);
        }
    }
    
    setLanguage(lang) {
        this.currentLanguage = lang;
        
        if (this.inputEditor) {
            monaco.editor.setModelLanguage(this.inputEditor.getModel(), lang);
        }
        if (this.outputEditor) {
            monaco.editor.setModelLanguage(this.outputEditor.getModel(), lang);
        }
    }
    
    setTheme(theme) {
        const monacoTheme = theme === 'light' ? 'obfuscator-light' : 'obfuscator-dark';
        monaco.editor.setTheme(monacoTheme);
    }
    
    formatInput() {
        if (this.inputEditor) {
            this.inputEditor.getAction('editor.action.formatDocument').run();
        }
    }
    
    layout() {
        if (this.inputEditor) this.inputEditor.layout();
        if (this.outputEditor) this.outputEditor.layout();
    }
    
    applySettings(settings) {
        const options = {
            fontSize: settings.fontSize || 14,
            fontFamily: settings.fontFamily || "'JetBrains Mono', monospace",
            fontLigatures: settings.ligatures !== false,
            lineHeight: settings.lineHeight ? settings.lineHeight * (settings.fontSize || 14) : undefined,
            minimap: { enabled: settings.minimap === true },
            lineNumbers: settings.lineNumbers !== false ? 'on' : 'off',
            folding: settings.folding !== false,
            renderLineHighlight: settings.highlightLine !== false ? 'line' : 'none',
            bracketPairColorization: { enabled: settings.bracketPairs !== false },
            guides: {
                indentation: settings.indentGuides !== false,
                bracketPairs: settings.bracketPairs !== false
            },
            renderWhitespace: settings.whitespace ? 'all' : 'none',
            cursorStyle: settings.cursorStyle || 'line',
            cursorBlinking: settings.cursorBlinking || 'blink',
            wordWrap: settings.wordWrap ? 'on' : 'off',
            autoClosingBrackets: settings.autoClosing !== false ? 'always' : 'never',
            autoIndent: settings.autoIndent !== false ? 'full' : 'none',
            formatOnPaste: settings.formatOnPaste === true,
            smoothScrolling: settings.smoothScrolling !== false
        };
        
        if (this.inputEditor) {
            this.inputEditor.updateOptions(options);
        }
        
        if (this.outputEditor) {
            this.outputEditor.updateOptions({
                ...options,
                readOnly: true,
                domReadOnly: true
            });
        }
        
        // Apply theme
        if (settings.theme) {
            monaco.editor.setTheme(settings.theme);
        }
    }
}
