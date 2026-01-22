import { EditorManager } from './editor.js';
import { SettingsManager } from './settings.js';
import { ThemeManager } from './theme.js';
import { UIManager } from './ui.js';
import { StorageManager } from './storage.js';
import { JavaScriptObfuscator } from './obfuscators/javascript.js';
import { PythonObfuscator } from './obfuscators/python.js';
import { LuaObfuscator } from './obfuscators/lua.js';

export class App {
    constructor() {
        this.currentLanguage = 'javascript';
        this.editors = new EditorManager();
        this.settings = new SettingsManager();
        this.theme = new ThemeManager();
        this.ui = new UIManager(this);
        this.storage = new StorageManager();
        
        this.obfuscators = {
            javascript: new JavaScriptObfuscator(),
            typescript: new JavaScriptObfuscator(),
            python: new PythonObfuscator(),
            lua: new LuaObfuscator()
        };
    }
    
    init() {
        this.editors.init();
        this.loadState();
        this.bindEvents();
        this.bindKeyboardShortcuts();
        this.bindDragDrop();
        this.editors.onInputChange(() => this.updateInputStats());
        
        console.log('🔐 Obfuscator Pro initialized');
    }
    
    bindEvents() {
        // Language tabs
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.addEventListener('click', () => this.switchLanguage(btn.dataset.lang));
        });
        
        // Preset buttons
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.settings.applyPreset(btn.dataset.preset);
            });
        });
        
        // Obfuscate button
        document.getElementById('obfuscateBtn').addEventListener('click', () => this.obfuscate());
        
        // Swap button
        document.getElementById('swapBtn').addEventListener('click', () => this.swapEditors());
        
        // Compare button
        document.getElementById('compareBtn').addEventListener('click', () => this.compareCode());
        
        // Editor actions
        document.getElementById('formatBtn').addEventListener('click', () => this.editors.formatInput());
        document.getElementById('clearBtn').addEventListener('click', () => this.clearInput());
        document.getElementById('uploadBtn').addEventListener('click', () => document.getElementById('fileInput').click());
        document.getElementById('fileInput').addEventListener('change', (e) => this.handleFileUpload(e));
        
        // Output actions
        document.getElementById('copyBtn').addEventListener('click', () => this.copyOutput());
        document.getElementById('downloadBtn').addEventListener('click', () => this.downloadOutput());
        document.getElementById('runBtn').addEventListener('click', () => this.runCode());
        
        // Sidebar toggle
        document.getElementById('sidebarToggle').addEventListener('click', () => this.toggleSidebar());
        
        // Collapsible sections
        document.querySelectorAll('.section-header.collapsible').forEach(header => {
            header.addEventListener('click', () => {
                header.classList.toggle('collapsed');
                const content = document.getElementById(header.dataset.section + '-content');
                if (content) content.classList.toggle('collapsed');
            });
        });
        
        // Slider value updates
        this.bindSliderUpdates();
        
        // Theme toggle
        document.getElementById('themeBtn').addEventListener('click', () => {
            this.theme.toggle();
            this.editors.setTheme(this.theme.current);
        });
        
        // Settings modal
        document.getElementById('settingsBtn').addEventListener('click', () => this.showModal('settingsModal'));
        document.getElementById('closeSettings').addEventListener('click', () => this.hideModal('settingsModal'));
        document.getElementById('saveEditorSettings').addEventListener('click', () => this.saveEditorSettings());
        document.getElementById('resetEditorSettings').addEventListener('click', () => this.resetEditorSettings());
        
        // Shortcuts modal
        document.getElementById('shortcutsBtn').addEventListener('click', () => this.showModal('shortcutsModal'));
        document.getElementById('closeShortcuts').addEventListener('click', () => this.hideModal('shortcutsModal'));
        
        // History button
        document.getElementById('historyBtn').addEventListener('click', () => this.showHistory());
        
        // Modal tabs
        document.querySelectorAll('.modal-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.modal-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.modal-tab-content').forEach(c => c.classList.remove('active'));
                tab.classList.add('active');
                document.getElementById('tab-' + tab.dataset.tab).classList.add('active');
            });
        });
        
        // Modal backdrop close
        document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
            backdrop.addEventListener('click', () => {
                backdrop.closest('.modal').classList.remove('active');
            });
        });
        
        // Import/Export/Reset
        document.getElementById('importSettingsBtn').addEventListener('click', () => this.importSettings());
        document.getElementById('exportSettingsBtn').addEventListener('click', () => this.exportSettings());
        document.getElementById('resetSettingsBtn').addEventListener('click', () => this.resetSettings());
        
        // Anti-debug options visibility
        const antiDebugCheckbox = document.getElementById('antiDebug');
        if (antiDebugCheckbox) {
            antiDebugCheckbox.addEventListener('change', (e) => {
                const options = document.getElementById('antiDebugOptions');
                if (options) options.style.display = e.target.checked ? 'block' : 'none';
            });
        }
        
        // Editor settings sliders
        document.getElementById('editorFontSize').addEventListener('input', (e) => {
            document.getElementById('fontSizeDisplay').textContent = e.target.value + 'px';
        });
        
        document.getElementById('editorLineHeight').addEventListener('input', (e) => {
            document.getElementById('lineHeightDisplay').textContent = e.target.value;
        });
    }
    
    bindSliderUpdates() {
        const sliders = [
            { id: 'nameLength', suffix: '' },
            { id: 'stringThreshold', suffix: '%' },
            { id: 'splitChunk', suffix: '' },
            { id: 'encodingIterations', suffix: '' },
            { id: 'numberComplexity', suffix: '' },
            { id: 'flatteningThreshold', suffix: '%' },
            { id: 'deadCodeAmount', suffix: '%' }
        ];
        
        sliders.forEach(({ id, suffix }) => {
            const slider = document.getElementById(id);
            const display = document.getElementById(id + 'Value');
            if (slider && display) {
                slider.addEventListener('input', () => {
                    display.textContent = slider.value + suffix;
                });
            }
        });
    }
    
    bindKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
            const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;
            
            // Ctrl/Cmd + Enter - Obfuscate
            if (cmdOrCtrl && e.key === 'Enter') {
                e.preventDefault();
                this.obfuscate();
            }
            
            // Ctrl/Cmd + Shift + F - Format
            if (cmdOrCtrl && e.shiftKey && e.key.toLowerCase() === 'f') {
                e.preventDefault();
                this.editors.formatInput();
            }
            
            // Ctrl/Cmd + Shift + C - Copy output
            if (cmdOrCtrl && e.shiftKey && e.key.toLowerCase() === 'c') {
                e.preventDefault();
                this.copyOutput();
            }
            
            // Ctrl/Cmd + Shift + R - Run
            if (cmdOrCtrl && e.shiftKey && e.key.toLowerCase() === 'r') {
                e.preventDefault();
                this.runCode();
            }
            
            // Ctrl/Cmd + B - Toggle sidebar
            if (cmdOrCtrl && e.key.toLowerCase() === 'b') {
                e.preventDefault();
                this.toggleSidebar();
            }
            
            // Ctrl/Cmd + Shift + T - Toggle theme
            if (cmdOrCtrl && e.shiftKey && e.key.toLowerCase() === 't') {
                e.preventDefault();
                this.theme.toggle();
                this.editors.setTheme(this.theme.current);
            }
            
            // Ctrl/Cmd + O - Upload file
            if (cmdOrCtrl && e.key.toLowerCase() === 'o') {
                e.preventDefault();
                document.getElementById('fileInput').click();
            }
            
            // Ctrl/Cmd + S - Download
            if (cmdOrCtrl && e.key.toLowerCase() === 's') {
                e.preventDefault();
                this.downloadOutput();
            }
            
            // Ctrl/Cmd + Shift + X - Clear
            if (cmdOrCtrl && e.shiftKey && e.key.toLowerCase() === 'x') {
                e.preventDefault();
                this.clearInput();
            }
            
            // Ctrl/Cmd + , - Settings
            if (cmdOrCtrl && e.key === ',') {
                e.preventDefault();
                this.showModal('settingsModal');
            }
            
            // Escape - Close modals
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal.active').forEach(m => m.classList.remove('active'));
            }
        });
    }
    
    bindDragDrop() {
        const dropZone = document.getElementById('dropZone');
        let dragCounter = 0;
        
        document.addEventListener('dragenter', (e) => {
            e.preventDefault();
            dragCounter++;
            if (e.dataTransfer.types.includes('Files')) {
                dropZone.classList.add('active');
            }
        });
        
        document.addEventListener('dragleave', (e) => {
            e.preventDefault();
            dragCounter--;
            if (dragCounter === 0) {
                dropZone.classList.remove('active');
            }
        });
        
        document.addEventListener('dragover', (e) => {
            e.preventDefault();
        });
        
        document.addEventListener('drop', (e) => {
            e.preventDefault();
            dragCounter = 0;
            dropZone.classList.remove('active');
            
            const file = e.dataTransfer.files[0];
            if (file) this.loadFile(file);
        });
    }
    
    switchLanguage(lang) {
        this.currentLanguage = lang;
        
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === lang);
        });
        
        const monacoLang = {
            'javascript': 'javascript',
            'typescript': 'typescript', 
            'python': 'python',
            'lua': 'lua'
        }[lang] || 'javascript';
        
        this.editors.setLanguage(monacoLang);
        this.updateSettingsVisibility();
        this.saveState();
    }
    
    updateSettingsVisibility() {
        // Hide JS-specific settings for other languages
        const jsOnly = ['controlFlowFlattening', 'selfDefending', 'antiDebug', 'deadCodeInjection'];
        const isJS = this.currentLanguage === 'javascript' || this.currentLanguage === 'typescript';
        
        jsOnly.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                const parent = el.closest('.toggle-setting') || el.closest('.setting-item');
                if (parent) parent.style.display = isJS ? '' : 'none';
            }
        });
    }
    
    obfuscate() {
        const code = this.editors.getInputValue();
        
        if (!code.trim()) {
            this.ui.showToast('Please enter some code to obfuscate', 'warning');
            return;
        }
        
        try {
            const options = this.settings.getOptions();
            const obfuscator = this.obfuscators[this.currentLanguage];
            
            const startTime = performance.now();
            const result = obfuscator.obfuscate(code, options);
            const endTime = performance.now();
            
            this.editors.setOutputValue(result);
            this.updateStats(code, result);
            
            // Save to history
            this.storage.addToHistory({
                language: this.currentLanguage,
                input: code.substring(0, 100),
                output: result.substring(0, 100),
                time: new Date().toISOString(),
                options: options
            });
            
            this.ui.showToast(`Obfuscated in ${(endTime - startTime).toFixed(0)}ms`, 'success');
            
        } catch (error) {
            console.error('Obfuscation error:', error);
            this.ui.showToast(error.message || 'Obfuscation failed', 'error');
        }
    }
    
    updateInputStats() {
        const code = this.editors.getInputValue();
        const lines = code.split('\n').length;
        const chars = code.length;
        
        document.getElementById('inputLines').textContent = `Lines: ${lines.toLocaleString()}`;
        document.getElementById('inputChars').textContent = `Chars: ${chars.toLocaleString()}`;
    }
    
    updateStats(original, obfuscated) {
        const origBytes = new Blob([original]).size;
        const obfBytes = new Blob([obfuscated]).size;
        const ratio = origBytes > 0 ? ((obfBytes / origBytes) * 100).toFixed(0) : 0;
        
        const lines = obfuscated.split('\n').length;
        const chars = obfuscated.length;
        
        document.getElementById('outputLines').textContent = `Lines: ${lines.toLocaleString()}`;
        document.getElementById('outputChars').textContent = `Chars: ${chars.toLocaleString()}`;
        document.getElementById('sizeRatio').querySelector('span').textContent = `${ratio}%`;
    }
    
    swapEditors() {
        const input = this.editors.getInputValue();
        const output = this.editors.getOutputValue();
        this.editors.setInputValue(output);
        this.editors.setOutputValue(input);
        this.updateInputStats();
        this.ui.showToast('Editors swapped', 'info');
    }
    
    compareCode() {
        // Simple comparison - show size difference
        const input = this.editors.getInputValue();
        const output = this.editors.getOutputValue();
        
        if (!input || !output) {
            this.ui.showToast('Need both input and output to compare', 'warning');
            return;
        }
        
        const inputSize = new Blob([input]).size;
        const outputSize = new Blob([output]).size;
        const diff = outputSize - inputSize;
        const percent = ((outputSize / inputSize) * 100).toFixed(1);
        
        const message = diff > 0 
            ? `Output is ${this.formatBytes(diff)} larger (${percent}%)`
            : `Output is ${this.formatBytes(Math.abs(diff))} smaller (${percent}%)`;
            
        this.ui.showToast(message, 'info');
    }
    
    formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }
    
    clearInput() {
        this.editors.setInputValue('');
        this.updateInputStats();
        this.ui.showToast('Input cleared', 'info');
    }
    
    async copyOutput() {
        const output = this.editors.getOutputValue();
        if (!output) {
            this.ui.showToast('Nothing to copy', 'warning');
            return;
        }
        
        try {
            await navigator.clipboard.writeText(output);
            this.ui.showToast('Copied to clipboard', 'success');
        } catch (err) {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = output;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            this.ui.showToast('Copied to clipboard', 'success');
        }
    }
    
    downloadOutput() {
        const output = this.editors.getOutputValue();
        if (!output) {
            this.ui.showToast('Nothing to download', 'warning');
            return;
        }
        
        const extensions = {
            'javascript': 'js',
            'typescript': 'ts',
            'python': 'py',
            'lua': 'lua'
        };
        
        const ext = extensions[this.currentLanguage] || 'txt';
        const filename = `obfuscated_${Date.now()}.${ext}`;
        
        const blob = new Blob([output], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.ui.showToast(`Downloaded ${filename}`, 'success');
    }
    
    runCode() {
        if (this.currentLanguage !== 'javascript' && this.currentLanguage !== 'typescript') {
            this.ui.showToast('Run is only available for JavaScript/TypeScript', 'warning');
            return;
        }
        
        const code = this.editors.getOutputValue();
        if (!code) {
            this.ui.showToast('Nothing to run', 'warning');
            return;
        }
        
        try {
            // Create a sandboxed console
            const originalConsole = { ...console };
            const logs = [];
            
            console.log = (...args) => {
                logs.push(['log', args]);
                originalConsole.log(...args);
            };
            console.warn = (...args) => {
                logs.push(['warn', args]);
                originalConsole.warn(...args);
            };
            console.error = (...args) => {
                logs.push(['error', args]);
                originalConsole.error(...args);
            };
            
            const result = eval(code);
            
            // Restore console
            Object.assign(console, originalConsole);
            
            if (logs.length > 0) {
                this.ui.showToast(`Executed with ${logs.length} console output(s)`, 'success');
            } else {
                this.ui.showToast('Code executed successfully', 'success');
            }
            
        } catch (error) {
            this.ui.showToast(`Runtime Error: ${error.message}`, 'error');
        }
    }
    
    handleFileUpload(e) {
        const file = e.target.files[0];
        if (file) this.loadFile(file);
        e.target.value = '';
    }
    
    loadFile(file) {
        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            this.ui.showToast('File too large (max 5MB)', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            this.editors.setInputValue(e.target.result);
            this.updateInputStats();
            
            // Auto-detect language from extension
            const ext = file.name.split('.').pop().toLowerCase();
            const langMap = {
                'js': 'javascript',
                'mjs': 'javascript',
                'cjs': 'javascript',
                'ts': 'typescript',
                'tsx': 'typescript',
                'py': 'python',
                'lua': 'lua'
            };
            
            if (langMap[ext]) {
                this.switchLanguage(langMap[ext]);
            }
            
            this.ui.showToast(`Loaded: ${file.name}`, 'success');
        };
        
        reader.onerror = () => {
            this.ui.showToast('Failed to read file', 'error');
        };
        
        reader.readAsText(file);
    }
    
    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        sidebar.classList.toggle('collapsed');
        
        // Resize editors after animation
        setTimeout(() => {
            this.editors.layout();
        }, 300);
    }
    
    showModal(id) {
        const modal = document.getElementById(id);
        if (modal) {
            modal.classList.add('active');
            
            // Load current settings into modal
            if (id === 'settingsModal') {
                this.loadEditorSettingsIntoModal();
            }
        }
    }
    
    hideModal(id) {
        const modal = document.getElementById(id);
        if (modal) {
            modal.classList.remove('active');
        }
    }
    
    loadEditorSettingsIntoModal() {
        const settings = this.storage.getEditorSettings();
        
        // Theme
        const themeRadio = document.querySelector(`input[name="editorTheme"][value="${settings.theme || 'vs-dark'}"]`);
        if (themeRadio) themeRadio.checked = true;
        
        // Font
        document.getElementById('editorFontFamily').value = settings.fontFamily || "'JetBrains Mono', monospace";
        document.getElementById('editorFontSize').value = settings.fontSize || 14;
        document.getElementById('fontSizeDisplay').textContent = (settings.fontSize || 14) + 'px';
        document.getElementById('editorLineHeight').value = settings.lineHeight || 1.5;
        document.getElementById('lineHeightDisplay').textContent = settings.lineHeight || 1.5;
        document.getElementById('editorLigatures').checked = settings.ligatures !== false;
        
        // Display
        document.getElementById('editorMinimap').checked = settings.minimap === true;
        document.getElementById('editorLineNumbers').checked = settings.lineNumbers !== false;
        document.getElementById('editorFolding').checked = settings.folding !== false;
        document.getElementById('editorHighlightLine').checked = settings.highlightLine !== false;
        document.getElementById('editorBracketPairs').checked = settings.bracketPairs !== false;
        document.getElementById('editorIndentGuides').checked = settings.indentGuides !== false;
        document.getElementById('editorWhitespace').checked = settings.whitespace === true;
        
        // Behavior
        document.getElementById('editorCursorStyle').value = settings.cursorStyle || 'line';
        document.getElementById('editorCursorBlinking').value = settings.cursorBlinking || 'blink';
        document.getElementById('editorWordWrap').checked = settings.wordWrap === true;
        document.getElementById('editorAutoClosing').checked = settings.autoClosing !== false;
        document.getElementById('editorAutoIndent').checked = settings.autoIndent !== false;
        document.getElementById('editorFormatOnPaste').checked = settings.formatOnPaste === true;
        document.getElementById('editorSmoothScrolling').checked = settings.smoothScrolling !== false;
    }
    
    saveEditorSettings() {
        const settings = {
            theme: document.querySelector('input[name="editorTheme"]:checked')?.value || 'vs-dark',
            fontFamily: document.getElementById('editorFontFamily').value,
            fontSize: parseInt(document.getElementById('editorFontSize').value),
            lineHeight: parseFloat(document.getElementById('editorLineHeight').value),
            ligatures: document.getElementById('editorLigatures').checked,
            minimap: document.getElementById('editorMinimap').checked,
            lineNumbers: document.getElementById('editorLineNumbers').checked,
            folding: document.getElementById('editorFolding').checked,
            highlightLine: document.getElementById('editorHighlightLine').checked,
            bracketPairs: document.getElementById('editorBracketPairs').checked,
            indentGuides: document.getElementById('editorIndentGuides').checked,
            whitespace: document.getElementById('editorWhitespace').checked,
            cursorStyle: document.getElementById('editorCursorStyle').value,
            cursorBlinking: document.getElementById('editorCursorBlinking').value,
            wordWrap: document.getElementById('editorWordWrap').checked,
            autoClosing: document.getElementById('editorAutoClosing').checked,
            autoIndent: document.getElementById('editorAutoIndent').checked,
            formatOnPaste: document.getElementById('editorFormatOnPaste').checked,
            smoothScrolling: document.getElementById('editorSmoothScrolling').checked
        };
        
        this.storage.setEditorSettings(settings);
        this.editors.applySettings(settings);
        this.hideModal('settingsModal');
        this.ui.showToast('Editor settings saved', 'success');
    }
    
    resetEditorSettings() {
        const defaults = this.storage.getDefaultEditorSettings();
        this.storage.setEditorSettings(defaults);
        this.loadEditorSettingsIntoModal();
        this.editors.applySettings(defaults);
        this.ui.showToast('Editor settings reset', 'info');
    }
    
    showHistory() {
        const history = this.storage.getHistory();
        if (history.length === 0) {
            this.ui.showToast('No history yet', 'info');
            return;
        }
        
        // For now, just show a toast with count
        this.ui.showToast(`${history.length} items in history`, 'info');
    }
    
    importSettings() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const settings = JSON.parse(event.target.result);
                    this.settings.loadFromObject(settings);
                    this.ui.showToast('Settings imported', 'success');
                } catch (err) {
                    this.ui.showToast('Invalid settings file', 'error');
                }
            };
            reader.readAsText(file);
        };
        
        input.click();
    }
    
    exportSettings() {
        const settings = this.settings.getOptions();
        const json = JSON.stringify(settings, null, 2);
        
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `obfuscator_settings_${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.ui.showToast('Settings exported', 'success');
    }
    
    resetSettings() {
        if (confirm('Reset all obfuscation settings to defaults?')) {
            this.settings.reset();
            
            // Reset preset buttons
            document.querySelectorAll('.preset-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.preset === 'balanced');
            });
            
            this.ui.showToast('Settings reset to defaults', 'info');
        }
    }
    
    loadState() {
        // Load theme
        const savedTheme = this.storage.get('theme');
        if (savedTheme) {
            this.theme.setTheme(savedTheme);
            this.editors.setTheme(savedTheme);
        }
        
        // Load language
        const savedLang = this.storage.get('language');
        if (savedLang) {
            this.switchLanguage(savedLang);
        }
        
        // Load editor settings
        const editorSettings = this.storage.getEditorSettings();
        this.editors.applySettings(editorSettings);
        
        // Load last code (optional)
        const lastCode = this.storage.get('lastCode');
        if (lastCode) {
            this.editors.setInputValue(lastCode);
        }
    }
    
    saveState() {
        this.storage.set('theme', this.theme.current);
        this.storage.set('language', this.currentLanguage);
        this.storage.set('lastCode', this.editors.getInputValue());
    }
}
