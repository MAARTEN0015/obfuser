export class BaseObfuscator {
    constructor() {
        this.options = {};
        this.usedNames = new Set();
        this.variableMap = new Map();
        this.stringArray = [];
        this.stringArrayName = '';
    }
    
    reset() {
        this.usedNames.clear();
        this.variableMap.clear();
        this.stringArray = [];
    }
    
    // Random utilities
    random() {
        return Math.random();
    }
    
    randomInt(min, max) {
        return Math.floor(this.random() * (max - min + 1)) + min;
    }
    
    randomElement(array) {
        return array[this.randomInt(0, array.length - 1)];
    }
    
    shuffle(array) {
        const result = [...array];
        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(this.random() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
    }
    
    // Name generators
    generateName(length, style) {
        const prefix = this.options.identifierPrefix || '';
        
        switch (style) {
            case 'hexadecimal':
                return prefix + '_0x' + this.randomHex(length);
            case 'mangled':
                return prefix + this.mangledName();
            case 'dictionary':
                return prefix + this.dictionaryName();
            case 'randomUnicode':
                return prefix + this.unicodeName(length);
            case 'zalgo':
                return prefix + this.zalgoName(length);
            case 'invisible':
                return prefix + this.invisibleName(length);
            case 'confusables':
                return prefix + this.confusableName(length);
            case 'greek':
                return prefix + this.greekName(length);
            case 'emoji':
                return prefix + this.emojiName();
            default:
                return prefix + this.randomAlpha(length);
        }
    }
    
    randomHex(length) {
        const chars = '0123456789abcdef';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars[this.randomInt(0, 15)];
        }
        return result;
    }
    
    randomAlpha(length) {
        const first = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_$';
        const rest = first + '0123456789';
        
        let result = first[this.randomInt(0, first.length - 1)];
        for (let i = 1; i < length; i++) {
            result += rest[this.randomInt(0, rest.length - 1)];
        }
        return result;
    }
    
    mangledCounter = 0;
    mangledName() {
        const chars = 'abcdefghijklmnopqrstuvwxyz';
        let n = this.mangledCounter++;
        let result = '';
        
        do {
            result = chars[n % 26] + result;
            n = Math.floor(n / 26) - 1;
        } while (n >= 0);
        
        return result;
    }
    
    dictionaryWords = ['data', 'info', 'temp', 'val', 'item', 'obj', 'arr', 'str', 'num', 'fn', 'cb', 'res', 'req', 'cfg', 'opt', 'ctx', 'ref', 'key', 'idx', 'len', 'max', 'min', 'sum', 'cnt', 'ptr', 'buf', 'msg', 'err', 'log', 'out'];
    
    dictionaryName() {
        const word = this.randomElement(this.dictionaryWords);
        return '_' + word + this.randomInt(0, 999);
    }
    
    unicodeName(length) {
        const ranges = [
            [0x0100, 0x017F], // Latin Extended-A
            [0x0180, 0x024F], // Latin Extended-B
            [0x0250, 0x02AF], // IPA Extensions
        ];
        
        let result = '';
        for (let i = 0; i < length; i++) {
            const range = this.randomElement(ranges);
            result += String.fromCharCode(this.randomInt(range[0], range[1]));
        }
        return '_' + result;
    }
    
    zalgoChars = {
        up: ['\u0300', '\u0301', '\u0302', '\u0303', '\u0304', '\u0305', '\u0306', '\u0307', '\u0308', '\u0309', '\u030A', '\u030B', '\u030C', '\u030D', '\u030E', '\u030F'],
        down: ['\u0316', '\u0317', '\u0318', '\u0319', '\u031C', '\u031D', '\u031E', '\u031F', '\u0320', '\u0324', '\u0325', '\u0326', '\u0329', '\u032A', '\u032B', '\u032C'],
        mid: ['\u0334', '\u0335', '\u0336', '\u0337', '\u0338']
    };
    
    zalgoName(length) {
        let result = '_';
        for (let i = 0; i < length; i++) {
            result += this.randomElement(this.zalgoChars.up);
            result += this.randomElement(this.zalgoChars.mid);
            result += this.randomElement(this.zalgoChars.down);
        }
        return result;
    }
    
    invisibleName(length) {
        const invisibles = ['\u200B', '\u200C', '\u200D', '\uFEFF'];
        let result = '_';
        for (let i = 0; i < length; i++) {
            result += this.randomElement(invisibles);
        }
        return result;
    }
    
    confusableName(length) {
        const confusables = ['I', 'l', '1', 'O', '0', 'o'];
        let result = this.randomElement(['I', 'l', 'O', 'o']); // Start with letter
        for (let i = 1; i < length; i++) {
            result += this.randomElement(confusables);
        }
        return result;
    }
    
    greekName(length) {
        const greek = ['α', 'β', 'γ', 'δ', 'ε', 'ζ', 'η', 'θ', 'ι', 'κ', 'λ', 'μ', 'ν', 'ξ', 'ο', 'π', 'ρ', 'σ', 'τ', 'υ', 'φ', 'χ', 'ψ', 'ω'];
        let result = '';
        for (let i = 0; i < length; i++) {
            result += this.randomElement(greek);
        }
        return result;
    }
    
    emojiVariables = ['$🔒', '$🔐', '$🔑', '$🛡️', '$⚡', '$🔥', '$💀', '$👻', '$🎭', '$🌀'];
    
    emojiName() {
        return this.randomElement(this.emojiVariables) + this.randomInt(0, 999);
    }
    
    getUniqueName() {
        const style = this.options.identifierGenerator || 'hexadecimal';
        const length = this.options.nameLength || 6;
        
        let attempts = 0;
        let name;
        
        do {
            name = this.generateName(length, style);
            attempts++;
            
            if (attempts > 1000) {
                throw new Error('Could not generate unique name');
            }
        } while (this.usedNames.has(name) || this.isReserved(name));
        
        this.usedNames.add(name);
        return name;
    }
    
    isReserved(name) {
        const reserved = new Set([
            // JavaScript reserved words
            'break', 'case', 'catch', 'continue', 'debugger', 'default', 'delete',
            'do', 'else', 'finally', 'for', 'function', 'if', 'in', 'instanceof',
            'new', 'return', 'switch', 'this', 'throw', 'try', 'typeof', 'var',
            'void', 'while', 'with', 'class', 'const', 'enum', 'export', 'extends',
            'import', 'super', 'implements', 'interface', 'let', 'package', 'private',
            'protected', 'public', 'static', 'yield', 'async', 'await', 'of',
            
            // Globals
            'undefined', 'null', 'true', 'false', 'NaN', 'Infinity',
            'console', 'window', 'document', 'global', 'process', 'require', 'module', 'exports',
            'Object', 'Array', 'String', 'Number', 'Boolean', 'Function', 'Symbol', 'BigInt',
            'Math', 'JSON', 'Date', 'RegExp', 'Error', 'Promise', 'Map', 'Set', 'WeakMap', 'WeakSet',
            'Proxy', 'Reflect', 'eval', 'parseInt', 'parseFloat', 'isNaN', 'isFinite',
            'encodeURI', 'decodeURI', 'encodeURIComponent', 'decodeURIComponent',
            'arguments', 'self', 'globalThis'
        ]);
        
        // Add user-defined reserved names
        if (this.options.reservedNames) {
            this.options.reservedNames.split(',').forEach(n => {
                reserved.add(n.trim());
            });
        }
        
        return reserved.has(name);
    }
    
    // String encoding
    encodeString(str, method) {
        switch (method) {
            case 'base64':
                return this.encodeBase64(str);
            case 'rc4':
                return this.encodeRC4(str);
            case 'xor':
                return this.encodeXOR(str);
            case 'aes':
                return this.encodeAES(str);
            default:
                return this.escapeString(str);
        }
    }
    
    encodeBase64(str) {
        try {
            return `atob("${btoa(unescape(encodeURIComponent(str)))}")`;
        } catch {
            return this.escapeString(str);
        }
    }
    
    encodeRC4(str) {
        const key = this.randomAlpha(8);
        const encoded = this.rc4(str, key);
        const hex = Array.from(encoded).map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join('');
        
        // Add RC4 decoder inline
        return `(function(s,k){var r='',i,j=0,S=[],T=[];for(i=0;i<256;i++){S[i]=i;T[i]=k.charCodeAt(i%k.length)}for(i=0;i<256;i++){j=(j+S[i]+T[i])%256;var t=S[i];S[i]=S[j];S[j]=t}i=j=0;for(var n=0;n<s.length;n++){i=(i+1)%256;j=(j+S[i])%256;var t=S[i];S[i]=S[j];S[j]=t;r+=String.fromCharCode(s.charCodeAt(n)^S[(S[i]+S[j])%256])}return r})("${this.escapeStringContent(encoded)}","${key}")`;
    }
    
    rc4(str, key) {
        const S = [];
        const T = [];
        
        for (let i = 0; i < 256; i++) {
            S[i] = i;
            T[i] = key.charCodeAt(i % key.length);
        }
        
        let j = 0;
        for (let i = 0; i < 256; i++) {
            j = (j + S[i] + T[i]) % 256;
            [S[i], S[j]] = [S[j], S[i]];
        }
        
        let result = '';
        let i = 0;
        j = 0;
        
        for (let n = 0; n < str.length; n++) {
            i = (i + 1) % 256;
            j = (j + S[i]) % 256;
            [S[i], S[j]] = [S[j], S[i]];
            result += String.fromCharCode(str.charCodeAt(n) ^ S[(S[i] + S[j]) % 256]);
        }
        
        return result;
    }
    
    encodeXOR(str) {
        const key = this.randomInt(1, 255);
        const encoded = str.split('').map(c => c.charCodeAt(0) ^ key);
        return `String.fromCharCode(...[${encoded.join(',')}].map(c=>c^${key}))`;
    }
    
    encodeAES(str) {
        return this.encodeBase64(str);
    }
    
    escapeString(str) {
        return '"' + this.escapeStringContent(str) + '"';
    }
    
    escapeStringContent(str) {
        return str
            .replace(/\\/g, '\\\\')
            .replace(/"/g, '\\"')
            .replace(/'/g, "\\'")
            .replace(/\n/g, '\\n')
            .replace(/\r/g, '\\r')
            .replace(/\t/g, '\\t')
            .replace(/\0/g, '\\0');
    }
    
    toUnicodeEscape(str) {
        return str.split('').map(c => {
            const code = c.charCodeAt(0);
            if (code > 127) {
                return '\\u' + code.toString(16).padStart(4, '0');
            }
            return c;
        }).join('');
    }
    
    toHexEscape(str) {
        return str.split('').map(c => {
            return '\\x' + c.charCodeAt(0).toString(16).padStart(2, '0');
        }).join('');
    }
    
    // Number encoding
    encodeNumber(num) {
        if (!this.options.numbersToExpressions) {
            if (this.options.numbersToHex) {
                return '0x' + num.toString(16);
            }
            return String(num);
        }
        
        const complexity = this.options.numberComplexity || 2;
        return this.generateNumberExpression(num, complexity);
    }
    
    generateNumberExpression(num, depth) {
        if (depth <= 0 || num < 0) return String(num);
        
        const methods = [];
        
        // Addition
        if (num > 1) {
            const a = this.randomInt(1, num - 1);
            const b = num - a;
            methods.push(`(${this.generateNumberExpression(a, depth - 1)}+${this.generateNumberExpression(b, depth - 1)})`);
        }
        
        // Subtraction
        if (num < 1000) {
            const a = num + this.randomInt(1, 100);
            const b = a - num;
            methods.push(`(${a}-${b})`);
        }
        
        // Multiplication
        for (let i = 2; i <= Math.sqrt(num); i++) {
            if (num % i === 0) {
                methods.push(`(${i}*${num / i})`);
                break;
            }
        }
        
        // Bitwise
        if (this.options.numbersToBitwise) {
            methods.push(`(${num}|0)`);
            methods.push(`(${num}^0)`);
            methods.push(`(~~${num})`);
        }
        
        // Hex
        if (this.options.numbersToHex && num > 9) {
            methods.push('0x' + num.toString(16));
        }
        
        // Special cases
        if (num === 0) methods.push('(+[])', '(0|0)', '(1-1)');
        if (num === 1) methods.push('(+!![])', '(0+1)', '(-~0)');
        
        return methods.length > 0 ? this.randomElement(methods) : String(num);
    }
    
    // Boolean/literal transformations
    transformBoolean(value) {
        if (!this.options.transformBooleans) {
            return value ? 'true' : 'false';
        }
        
        if (value) {
            const trueExpressions = ['!![]', '!0', '!!1', '!""', '!!{}'];
            return '(' + this.randomElement(trueExpressions) + ')';
        } else {
            const falseExpressions = ['![]', '!1', '!!0', '!{}', '!!""'];
            return '(' + this.randomElement(falseExpressions) + ')';
        }
    }
    
    transformUndefined() {
        if (!this.options.transformUndefined) return 'undefined';
        
        const expressions = [
            'void 0',
            'void(0)',
            '[][0]',
            '({}[0])',
            '(()=>{})()'
        ];
        return '(' + this.randomElement(expressions) + ')';
    }
    
    transformNull() {
        if (!this.options.transformNull) return 'null';
        return '({}[0]||null)';
    }
    
    transformInfinity() {
        if (!this.options.transformInfinity) return 'Infinity';
        
        const expressions = [
            '1/0',
            '1e309',
            'Number.POSITIVE_INFINITY'
        ];
        return '(' + this.randomElement(expressions) + ')';
    }
    
    transformNaN() {
        if (!this.options.transformNaN) return 'NaN';
        
        const expressions = [
            '0/0',
            'NaN',
            'Number.NaN',
            '+"x"'
        ];
        return '(' + this.randomElement(expressions) + ')';
    }
}
