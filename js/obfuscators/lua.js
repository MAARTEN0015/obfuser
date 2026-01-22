import { BaseObfuscator } from './base.js';

export class LuaObfuscator extends BaseObfuscator {
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
                result = result.replace(/\btrue\b/g, '(1==1)');
                result = result.replace(/\bfalse\b/g, '(1~=1)');
            }
            
            // Transform nil
            if (options.transformNull) {
                result = result.replace(/\bnil\b/g, '({}[1])');
            }
            
            // Compact if enabled
            if (options.compact) {
                result = this.compactCode(result);
            }
            
            return result;
            
        } catch (error) {
            throw new Error('Failed to obfuscate Lua code: ' + error.message);
        }
    }
    
    removeComments(code) {
        // Remove block comments
        code = code.replace(/--\[\[[\s\S]*?\]\]/g, '');
        
        // Remove single-line comments
        code = code.replace(/--.*$/gm, '');
        
        return code;
    }
    
    renameIdentifiers(code) {
        const reserved = new Set([
            'and', 'break', 'do', 'else', 'elseif', 'end', 'false', 'for',
            'function', 'goto', 'if', 'in', 'local', 'nil', 'not', 'or',
            'repeat', 'return', 'then', 'true', 'until', 'while',
            'print', 'pairs', 'ipairs', 'next', 'type', 'tostring', 'tonumber',
            'string', 'table', 'math', 'io', 'os', 'coroutine', 'debug',
            'error', 'assert', 'pcall', 'xpcall', 'load', 'loadstring',
            'require', 'module', 'package', '_G', '_VERSION', 'select', 'unpack',
            'setmetatable', 'getmetatable', 'rawget', 'rawset', 'collectgarbage'
        ]);
        
        const declarations = new Map();
        
        // Find local declarations
        const localPattern = /\blocal\s+([a-zA-Z_][a-zA-Z0-9_]*)/g;
        let match;
        
        while ((match = localPattern.exec(code)) !== null) {
            const name = match[1];
            if (!reserved.has(name) && !declarations.has(name)) {
                declarations.set(name, this.generateLuaName());
            }
        }
        
        // Find function definitions
        const funcPattern = /\bfunction\s+([a-zA-Z_][a-zA-Z0-9_]*)/g;
        while ((match = funcPattern.exec(code)) !== null) {
            const name = match[1];
            if (!reserved.has(name) && !declarations.has(name)) {
                declarations.set(name, this.generateLuaName());
            }
        }
        
        // Replace
        declarations.forEach((newName, oldName) => {
            const regex = new RegExp(`\\b${oldName}\\b`, 'g');
            code = code.replace(regex, newName);
        });
        
        return code;
    }
    
    generateLuaName() {
        const chars = '_lI1O0o';
        let name = '_';
        const length = this.options.nameLength || 6;
        
        for (let i = 1; i < length; i++) {
            name += chars[this.randomInt(0, chars.length - 1)];
        }
        
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
            
            // Convert to string.char
            const codes = content.split('').map(c => c.charCodeAt(0)).join(',');
            return `string.char(${codes})`;
        });
    }
    
    compactCode(code) {
        // Remove extra whitespace but preserve newlines for Lua syntax
        code = code.replace(/[ \t]+/g, ' ');
        code = code.replace(/\n\s*\n/g, '\n');
        code = code.replace(/[ \t]+$/gm, '');
        
        return code.trim();
    }
}
