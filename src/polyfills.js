// Polyfills para módulos de Node.js en el navegador
global.Buffer = require('buffer').Buffer;
global.process = require('process');

// Polyfills para módulos que pptxgenjs necesita
if (typeof window !== 'undefined') {
  // Mock fs module
  window.require = window.require || function() { return {}; };
  
  // Mock https module  
  window.https = window.https || {};
  
  // Mock http module
  window.http = window.http || {};
  
  // Mock crypto module
  window.crypto = window.crypto || {
    randomBytes: () => Buffer.alloc(32),
    createHash: () => ({
      update: () => ({ digest: () => 'mock' })
    })
  };
}