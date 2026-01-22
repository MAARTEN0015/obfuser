export class SettingsManager {
    constructor() {
        this.defaults = {
            // Identifiers
            renameVariables: true,
            renameGlobals: false,
            renameProperties: false,
            renameFunctions: true,
            identifierGenerator: 'hexadecimal',
            nameLength: 6,
            identifierPrefix: '',
            reservedNames: '',
            
            // Strings
            stringArray: true,
            rotateStringArray: true,
            shuffleStringArray: true,
            splitStrings: false,
            unicodeEscape: false,
            stringEncoding: 'base64',
            stringThreshold: 75,
            splitChunk: 5,
            encodingIterations: 1,
            wrapStringCalls: false,
            encodeUrls: false,
            
            // Numbers
            numbersToExpressions: false,
            numbersToHex: false,
            numbersToBitwise: false,
            numberComplexity: 2,
            
            // Control Flow
            controlFlowFlattening: false,
            flatteningThreshold: 75,
            deadCodeInjection: false,
            deadCodeAmount: 20,
            opaquePredicates: false,
            blockStatementSplitting: false,
            functionOutlining: false,
            proxyFunctions: false,
            
            // Transformations
            transformBooleans: true,
            transformUndefined: false,
            transformNull: false,
            transformInfinity: false,
            transformNaN: false,
            memberExpressionToBracket: false,
            objectExpressionTransform: false,
            templateLiteralTransform: false,
            arrowFunctionTransform: false,
            destructuringTransform: false,
            computedProperties: false,
            sequenceExpressions: false,
            
            // Protection
            selfDefending: false,
            antiDebug: false,
            debugDetectInterval: true,
            debugDetectDebugger: true,
            debugDetectDevtools: false,
            debugDetectTiming: false,
            disableConsole: false,
            antiTampering: false,
            integrityCheck: false,
            domainLock: '',
            expirationDate: '',
            licenseKey: '',
            
            // Output
            target: 'browser',
            esVersion: 'es2015',
            compact: true,
            simplify: true,
            sourceMap: false,
            sourceMapInline: false,
            seed: ''
        };
        
        this.presets = {
            minimal: {
                renameVariables: true,
                renameFunctions: true,
                stringArray: false,
                transformBooleans: false,
                compact: true
            },
            balanced: {
                renameVariables: true,
                renameFunctions: true,
                stringArray: true,
                rotateStringArray: true,
                shuffleStringArray: true,
                stringEncoding: 'base64',
                transformBooleans: true,
                compact: true
            },
            aggressive: {
                renameVariables: true,
                renameFunctions: true,
                renameProperties: true,
                identifierGenerator: 'hexadecimal',
                nameLength: 8,
                stringArray: true,
                rotateStringArray: true,
                shuffleStringArray: true,
                splitStrings: true,
                stringEncoding: 'rc4',
                numbersToExpressions: true,
                controlFlowFlattening: true,
                flatteningThreshold: 50,
                deadCodeInjection: true,
                deadCodeAmount: 30,
                transformBooleans: true,
                transformUndefined: true,
                memberExpressionToBracket: true,
                compact: true
            },
            paranoid: {
                renameVariables: true,
                renameFunctions: true,
                renameProperties: true,
                renameGlobals: true,
                identifierGenerator: 'hexadecimal',
                nameLength: 12,
                stringArray: true,
                rotateStringArray: true,
                shuffleStringArray: true,
                splitStrings: true,
                unicodeEscape: true,
                stringEncoding: 'rc4',
                encodingIterations: 3,
                wrapStringCalls: true,
                numbersToExpressions: true,
                numbersToHex: true,
                numbersToBitwise: true,
                numberComplexity: 4,
                controlFlowFlattening: true,
                flatteningThreshold: 100,
                deadCodeInjection: true,
                deadCodeAmount: 50,
                opaquePredicates: true,
                functionOutlining: true,
                proxyFunctions: true,
                transformBooleans: true,
                transformUndefined: true,
                transformNull: true,
                transformInfinity: true,
                transformNaN: true,
                memberExpressionToBracket: true,
                computedProperties: true,
                sequenceExpressions: true,
                selfDefending: true,
                antiDebug: true,
                disableConsole: true,
                antiTampering: true,
                compact: true
            }
        };
    }
    
    getOptions() {
        const options = {};
        
        Object.keys(this.defaults).forEach(key => {
            const element = document.getElementById(key);
            
            if (element) {
                if (element.type === 'checkbox') {
                    options[key] = element.checked;
                } else if (element.type === 'range' || element.type === 'number') {
                    options[key] = parseFloat(element.value);
                } else {
                    options[key] = element.value;
                }
            } else {
                options[key] = this.defaults[key];
            }
        });
        
        return options;
    }
    
    loadFromObject(settings) {
        Object.keys(settings).forEach(key => {
            const element = document.getElementById(key);
            
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = settings[key];
                } else {
                    element.value = settings[key];
                }
                
                // Trigger input event for sliders
                if (element.type === 'range') {
                    element.dispatchEvent(new Event('input'));
                }
            }
        });
    }
    
    applyPreset(presetName) {
        const preset = this.presets[presetName];
        if (!preset) return;
        
        // First reset to defaults
        this.loadFromObject(this.defaults);
        
        // Then apply preset overrides
        this.loadFromObject(preset);
    }
    
    reset() {
        this.loadFromObject(this.defaults);
    }
}
