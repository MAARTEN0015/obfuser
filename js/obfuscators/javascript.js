import { BaseObfuscator } from './base.js';

export class JavaScriptObfuscator extends BaseObfuscator {
    constructor() {
        super();
    }
    
    obfuscate(code, options) {
        this.options = options;
        this.reset();
        
        let result = code;
        
        try {
            // Step 1: Remove comments
            result = this.removeComments(result);
            
            // Step 2: Process strings
            if (options.stringArray) {
                result = this.processStrings(result);
            }
            
            // Step 3: Rename identifiers
            if (options.renameVariables || options.renameFunctions) {
                result = this.renameIdentifiers(result);
            }
            
            // Step 4: Transform literals
            result = this.transformLiterals(result);
            
            // Step 5: Transform numbers
            if (options.numbersToExpressions || options.numbersToHex) {
                result = this.transformNumbers(result);
            }
            
            // Step 6: Control flow
            if (options.controlFlowFlattening) {
                result = this.flattenControlFlow(result);
            }
            
            // Step 7: Dead code injection
            if (options.deadCodeInjection) {
                result = this.injectDeadCode(result);
            }
            
            // Step 8: Add protections
            if (options.selfDefending) {
                result = this.addSelfDefending(result);
            }
            
            if (options.antiDebug) {
                result = this.addAntiDebug(result);
            }
            
            if (options.disableConsole) {
                result = this.addConsoleDisable(result);
            }
            
            // Step 9: Prepend string array
            if (this.stringArray.length > 0) {
                result = this.prependStringArray(result);
            }
            
            // Step 10: Compact output
            if (options.compact) {
                result = this.compactCode(result);
            }
            
            return result;
            
        } catch (error) {
            console.error('Obfuscation error:', error);
            throw new Error('Failed to obfuscate code: ' + error.message);
        }
    }
    
    removeComments(code) {
        // Remove single-line comments
        code = code.replace(/\/\/.*$/gm, '');
        
        // Remove multi-line comments
        code = code.replace(/\/\*[\s\S]*?\*\//g, '');
        
        return code;
    }
    
    processStrings(code) {
        this.stringArrayName = this.getUniqueName();
        this.stringArrayCallName = this.getUniqueName();
        
        const stringPattern = /(["'`])(?:(?!\1|\\).|\\.)*\1/g;
        
        code = code.replace(stringPattern, (match) => {
            const quote = match[0];
            const content = match.slice(1, -1);
            
            // Skip empty strings and very short strings
            if (content.length < 2) return match;
            
            // Skip template literals with expressions
            if (quote === '`' && content.includes('${')) return match;
            
            // Check threshold
            if (this.random() * 100 > this.options.stringThreshold) {
                return match;
            }
            
            // Add to string array
            let index = this.stringArray.indexOf(content);
            if (index === -1) {
                index = this.stringArray.length;
                this.stringArray.push(content);
            }
            
            return `${this.stringArrayCallName}(${this.encodeNumber(index)})`;
        });
        
        return code;
    }
    
    prependStringArray(code) {
        let encoded = this.stringArray.map(str => {
            if (this.options.stringEncoding && this.options.stringEncoding !== 'none') {
                // For array, we'll use simpler encoding
                if (this.options.unicodeEscape) {
                    return '"' + this.toUnicodeEscape(this.escapeStringContent(str)) + '"';
                }
                return this.escapeString(str);
            }
            return this.escapeString(str);
        });
        
        // Shuffle if enabled
        let rotationAmount = 0;
        if (this.options.shuffleStringArray) {
            // Create index map for shuffling
            const indices = encoded.map((_, i) => i);
            const shuffled = this.shuffle(indices);
            
            // Reorder array
            const newEncoded = shuffled.map(i => encoded[i]);
            
            // Update code references
            shuffled.forEach((oldIdx, newIdx) => {
                const oldCall = `${this.stringArrayCallName}(${this.encodeNumber(oldIdx)})`;
                const newCall = `${this.stringArrayCallName}(${this.encodeNumber(newIdx)})`;
                // This is simplified - real implementation would need AST
            });
            
            encoded = newEncoded;
        }
        
        // Rotate if enabled
        if (this.options.rotateStringArray && encoded.length > 1) {
            rotationAmount = this.randomInt(1, encoded.length - 1);
            // Would rotate the array and add rotation logic
        }
        
        // Build array declaration
        const arrayDecl = `var ${this.stringArrayName}=[${encoded.join(',')}];`;
        
        // Build getter function
        let getterFn;
        if (this.options.wrapStringCalls) {
            const innerName = this.getUniqueName();
            getterFn = `var ${this.stringArrayCallName}=function(${innerName}){return ${this.stringArrayName}[${innerName}]};`;
        } else {
            getterFn = `var ${this.stringArrayCallName}=function(i){return ${this.stringArrayName}[i]};`;
        }
        
        return arrayDecl + getterFn + code;
    }
    
    renameIdentifiers(code) {
        // Find all declarations
        const declarations = new Map();
        
        // Match var/let/const declarations
        const varPattern = /\b(var|let|const)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
        let match;
        
        while ((match = varPattern.exec(code)) !== null) {
            const name = match[2];
            if (!this.isReserved(name) && !declarations.has(name)) {
                declarations.set(name, this.getUniqueName());
            }
        }
        
        // Match function declarations
        if (this.options.renameFunctions) {
            const funcPattern = /\bfunction\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
            while ((match = funcPattern.exec(code)) !== null) {
                const name = match[1];
                if (!this.isReserved(name) && !declarations.has(name)) {
                    declarations.set(name, this.getUniqueName());
                }
            }
        }
        
        // Match function parameters (simplified)
        const paramPattern = /\bfunction\s*[^(]*\(([^)]*)\)/g;
        while ((match = paramPattern.exec(code)) !== null) {
            const params = match[1].split(',').map(p => p.trim());
            params.forEach(param => {
                // Handle default values
                const paramName = param.split('=')[0].trim();
                if (paramName && !this.isReserved(paramName) && !declarations.has(paramName)) {
                    declarations.set(paramName, this.getUniqueName());
                }
            });
        }
        
        // Arrow function parameters
        const arrowPattern = /\(([^)]*)\)\s*=>/g;
        while ((match = arrowPattern.exec(code)) !== null) {
            const params = match[1].split(',').map(p => p.trim());
            params.forEach(param => {
                const paramName = param.split('=')[0].trim();
                if (paramName && !this.isReserved(paramName) && !declarations.has(paramName)) {
                    declarations.set(paramName, this.getUniqueName());
                }
            });
        }
        
        // Replace all occurrences
        declarations.forEach((newName, oldName) => {
            const regex = new RegExp(`\\b${oldName}\\b`, 'g');
            code = code.replace(regex, newName);
        });
        
        this.variableMap = declarations;
        
        return code;
    }
    
    transformLiterals(code) {
        // Transform true/false
        if (this.options.transformBooleans) {
            code = code.replace(/\btrue\b/g, () => this.transformBoolean(true));
            code = code.replace(/\bfalse\b/g, () => this.transformBoolean(false));
        }
        
        // Transform undefined
        if (this.options.transformUndefined) {
            code = code.replace(/\bundefined\b/g, () => this.transformUndefined());
        }
        
        // Transform null
        if (this.options.transformNull) {
            code = code.replace(/\bnull\b/g, () => this.transformNull());
        }
        
        // Transform Infinity
        if (this.options.transformInfinity) {
            code = code.replace(/\bInfinity\b/g, () => this.transformInfinity());
        }
        
        // Transform NaN
        if (this.options.transformNaN) {
            code = code.replace(/\bNaN\b/g, () => this.transformNaN());
        }
        
        return code;
    }
    
    transformNumbers(code) {
        // Match numbers not in strings or property access
        const numberPattern = /\b(\d+)\b/g;
        
        return code.replace(numberPattern, (match, num) => {
            const value = parseInt(num, 10);
            
            // Skip large numbers and special cases
            if (value > 10000 || isNaN(value)) return match;
            
            return this.encodeNumber(value);
        });
    }
    
    flattenControlFlow(code) {
        // Simplified control flow flattening
        // Real implementation would need AST parsing
        
        const threshold = this.options.flatteningThreshold / 100;
        if (this.random() > threshold) return code;
        
        // Wrap function bodies in while-switch
        const funcPattern = /function\s*([^(]*)\(([^)]*)\)\s*\{([\s\S]*?)\}/g;
        
        return code.replace(funcPattern, (match, name, params, body) => {
            // Skip small functions
            if (body.length < 50) return match;
            
            // Split into statements (simplified)
            const statements = body.split(';').filter(s => s.trim());
            if (statements.length < 3) return match;
            
            const stateVar = this.getUniqueName();
            const cases = statements.map((stmt, i) => `case ${i}:${stmt};${stateVar}=${i + 1};break;`);
            
            const flattened = `var ${stateVar}=0;while(${stateVar}<${statements.length}){switch(${stateVar}){${cases.join('')}default:${stateVar}=${statements.length};}}`;
            
            return `function ${name}(${params}){${flattened}}`;
        });
    }
    
    injectDeadCode(code) {
        const amount = this.options.deadCodeAmount / 100;
        const deadSnippets = [
            `if(${this.transformBoolean(false)}){console.log(${this.encodeNumber(this.randomInt(0, 1000))});}`,
            `var ${this.getUniqueName()}=${this.transformBoolean(false)}?${this.encodeNumber(1)}:${this.encodeNumber(0)};`,
            `(function(){return ${this.transformBoolean(false)};})();`,
            `void(${this.encodeNumber(0)});`,
            `${this.transformBoolean(true)}||${this.encodeNumber(0)};`
        ];
        
        // Insert dead code at random positions
        const lines = code.split('\n');
        const insertCount = Math.floor(lines.length * amount);
        
        for (let i = 0; i < insertCount; i++) {
            const pos = this.randomInt(0, lines.length - 1);
            lines.splice(pos, 0, this.randomElement(deadSnippets));
        }
        
        return lines.join('\n');
    }
    
    addSelfDefending(code) {
        const selfDefend = `
(function(){
    var ${this.getUniqueName()}=function(){
        var ${this.getUniqueName()}=new RegExp('function\\\\s*\\\\(\\\\s*\\\\)');
        var ${this.getUniqueName()}=new RegExp('\\\\+\\\\+\\\\s*\\\\w+|\\\\w+\\\\s*\\\\+\\\\+','i');
        var ${this.getUniqueName()}='init';
        if(${this.getUniqueName()}.test(${this.getUniqueName()}.toString())||${this.getUniqueName()}.test(${this.getUniqueName()}.toString())){
            ${this.getUniqueName()}='chain';
        }else{
            ${this.getUniqueName()}='debu';
        }
    };
    return ${this.getUniqueName()}();
})();`;
        
        return selfDefend + code;
    }
    
    addAntiDebug(code) {
        const antiDebug = `
(function(){
    var ${this.getUniqueName()}=function(){
        try{
            (function(){}['constructor']('debugger')());
        }catch(${this.getUniqueName()}){}
    };
    setInterval(${this.getUniqueName()},${this.encodeNumber(this.randomInt(500, 2000))});
})();`;
        
        return antiDebug + code;
    }
    
    addConsoleDisable(code) {
        const disableConsole = `
(function(){
    var ${this.getUniqueName()}=['log','warn','info','error','debug','table','trace'];
    for(var ${this.getUniqueName()}=${this.encodeNumber(0)};${this.getUniqueName()}<${this.getUniqueName()}.length;${this.getUniqueName()}++){
        console[${this.getUniqueName()}[${this.getUniqueName()}]]=function(){};
    }
})();`;
        
        return disableConsole + code;
    }
    
    compactCode(code) {
        // Remove extra whitespace
        code = code.replace(/\s+/g, ' ');
        
        // Remove spaces around operators
        code = code.replace(/\s*([+\-*/%=<>!&|^~?:,;{}()[\]])\s*/g, '$1');
        
        // Restore necessary spaces
        code = code.replace(/(var|let|const|function|return|if|else|for|while|do|switch|case|break|continue|new|typeof|instanceof|in|of|class|extends|import|export|from|as|async|await|yield|throw|try|catch|finally|delete|void)([^a-zA-Z0-9_$])/g, '$1 $2');
        
        // Remove trailing semicolons before closing braces
        code = code.replace(/;}/g, '}');
        
        return code.trim();
    }
}
