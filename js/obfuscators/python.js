import { BaseObfuscator } from './base.js';

export class PythonObfuscator extends BaseObfuscator {
    constructor() {
        super();
    }
    
    obfuscate(code, options) {
        this.options = options;
        this.reset();
        
        let result = code;
        
        try {
            // Remove comments
            result = this.removeComments(result);
            
            // Rename variables
            if (options.renameVariables) {
                result = this.renameIdentifiers(result);
            }
            
            // Encode strings
            if (options.stringArray) {
                result = this.encodeStrings(result);
            }
            
            // Transform booleans
            if (options.transformBooleans) {
                result = this.transformBooleans(result);
            }
            
            // Transform None
            if (options.transformNull) {
                result = result.replace(/\bNone\b/g, '(lambda:None)()');
            }
            
            // Compact if enabled
            if (options.compact) {
                result = this.compactCode(result);
            }
            
            return result;
            
        } catch (error) {
            throw new Error('Failed to obfuscate Python code: ' + error.message);
        }
    }
    
    removeComments(code) {
        // Remove single-line comments
        code = code.replace(/#.*$/gm, '');
        
        // Remove docstrings (simplified)
        code = code.replace(/'''[\s\S]*?'''/g, '');
        code = code.replace(/"""[\s\S]*?"""/g, '');
        
        return code;
    }
    
    renameIdentifiers(code) {
        const reserved = new Set([
            'False', 'None', 'True', 'and', 'as', 'assert', 'async', 'await',
            'break', 'class', 'continue', 'def', 'del', 'elif', 'else', 'except',
            'finally', 'for', 'from', 'global', 'if', 'import', 'in', 'is',
            'lambda', 'nonlocal', 'not', 'or', 'pass', 'raise', 'return', 'try',
            'while', 'with', 'yield', 'print', 'input', 'len', 'range', 'str',
            'int', 'float', 'list', 'dict', 'set', 'tuple', 'type', 'open',
            'self', 'cls', '__init__', '__name__', '__main__', '__file__'
        ]);
        
        const declarations = new Map();
        
        // Find variable assignments
        const assignPattern = /^(\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*=/gm;
        let match;
        
        while ((match = assignPattern.exec(code)) !== null) {
            const name = match[2];
            if (!reserved.has(name) && !declarations.has(name)) {
                declarations.set(name, this.generatePythonName());
            }
        }
        
        // Find function definitions
        const funcPattern = /def\s+([a-zA-Z_][a-zA-Z0-9_]*)/g;
        while ((match = funcPattern.exec(code)) !== null) {
            const name = match[1];
            if (!reserved.has(name) && !declarations.has(name)) {
                declarations.set(name, this.generatePythonName());
            }
        }
        
        // Replace
        declarations.forEach((newName, oldName) => {
            const regex = new RegExp(`\\b${oldName}\\b`, 'g');
            code = code.replace(regex, newName);
        });
        
        return code;
    }
    
    generatePythonName() {
        const chars = '_OoIl1';
        let name = '_';
        const length = this.options.nameLength || 6;
        
        for (let i = 1; i < length; i++) {
            name += chars[this.randomInt(0, chars.length - 1)];
        }
        
        // Ensure uniqueness
        while (this.usedNames.has(name)) {
            name += chars[this.randomInt(0, chars.length - 1)];
        }
        
        this.usedNames.add(name);
        return name;
    }
    
    encodeStrings(code) {
        const stringPattern = /(["'])(?:(?!\1|\\).|\\.)*\1/g;
        
        return code.replace(stringPattern, (match) => {
            const quote = match[0];
            const content = match.slice(1, -1);
            
            if (content.length < 2) return match;
            
            switch (this.options.stringEncoding) {
                case 'base64':
                    try {
                        const encoded = btoa(unescape(encodeURIComponent(content)));
                        return `__import__('base64').b64decode('${encoded}').decode()`;
                    } catch {
                        return match;
                    }
                case 'hex':
                    const hex = content.split('').map(c => 
                        c.charCodeAt(0).toString(16).padStart(2, '0')
                    ).join('');
                    return `bytes.fromhex('${hex}').decode()`;
                default:
                    return match;
            }
        });
    }
    
    transformBooleans(code) {
        code = code.replace(/\bTrue\b/g, '(not not 1)');
        code = code.replace(/\bFalse\b/g, '(not 1)');
        return code;
    }
    
    compactCode(code) {
        // Remove extra blank lines
        code = code.replace(/\n\s*\n/g, '\n');
        
        // Remove trailing whitespace
        code = code.replace(/[ \t]+$/gm, '');
        
        return code.trim();
    }
}
