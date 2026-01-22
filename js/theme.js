export class ThemeManager {
    constructor() {
        this.current = this.getSavedTheme() || this.getSystemTheme();
    }
    
    getSavedTheme() {
        return localStorage.getItem('obfuscator_theme');
    }
    
    getSystemTheme() {
        return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }
    
    setTheme(theme) {
        this.current = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('obfuscator_theme', theme);
    }
    
    toggle() {
        const newTheme = this.current === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
        return newTheme;
    }
}
