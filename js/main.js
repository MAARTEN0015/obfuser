import { App } from './app.js';

require.config({ 
    paths: { 
        vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs' 
    }
});

require(['vs/editor/editor.main'], function() {
    setTimeout(() => {
        document.getElementById('loadingScreen').classList.add('hidden');
    }, 500);
    
    const app = new App();
    app.init();
    
    window.app = app;
});

document.addEventListener('dragover', (e) => e.preventDefault());
document.addEventListener('drop', (e) => e.preventDefault());
