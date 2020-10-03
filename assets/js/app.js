'use strict'

import HtmlService from './HtmlService.js';
import FinanceService from './FinanceService.js';

class App {

  constructor() {
    this.registerServiceWorker();
    this.start();
    
  }

  start() {
    const financeService = new FinanceService();
    new HtmlService(financeService);
  }

  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      const onsuccess = () => console.log('[Service Worker] Registered');
      const onfailure = () => console.log('[Service Worker] Failed');
    
      navigator.serviceWorker
        .register('sw.js')
        .then(onsuccess)
        .catch(onfailure);
    } 
  }
}

new App();

