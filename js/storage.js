export class StorageManager {
    constructor() {
        this.prefix = 'obfuscator_';
    }
    
    get(key) {
        try {
            const value = localStorage.getItem(this.prefix + key);
            return value ? JSON.parse(value) : null;
        } catch {
            return null;
        }
    }
    
    set(key, value) {
        try {
            localStorage.setItem(this.prefix + key, JSON.stringify(value));
            return true;
        } catch {
            return false;
        }
    }
    
    remove(key) {
        try {
            localStorage.removeItem(this.prefix + key);
            return true;
        } catch {
            return false;
        }
    }
    
    getDefaultEditorSettings() {
        return {
            theme: 'vs-dark',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 14,
            lineHeight: 1.5,
            ligatures: true,
            minimap: false,
            lineNumbers: true,
            folding: true,
            highlightLine: true,
            bracketPairs: true,
            indentGuides: true,
            whitespace: false,
            cursorStyle: 'line',
            cursorBlinking: 'blink',
            wordWrap: false,
            autoClosing: true,
            autoIndent: true,
            formatOnPaste: false,
            smoothScrolling: true
        };
    }
    
    getEditorSettings() {
        return this.get('editorSettings') || this.getDefaultEditorSettings();
    }
    
    setEditorSettings(settings) {
        return this.set('editorSettings', settings);
    }
    
    getHistory() {
        return this.get('history') || [];
    }
    
    addToHistory(item) {
        const history = this.getHistory();
        history.unshift(item);
        
        if (history.length > 50) {
            history.pop();
        }
        
        this.set('history', history);
    }
    
    clearHistory() {
        this.set('history', []);
    }
}
