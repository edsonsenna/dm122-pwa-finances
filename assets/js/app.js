'use strict'

import HtmlService from './HtmlService.js';
import FinanceService from './FinanceService.js';

class App {

  constructor() {
    this.registerServiceWorker();
    this.setUpMask();
    this.start();
    
  }

  setUpMask() {

    const maskArgs = {
      allowNegative: false,
      negativeSignAfter: false,
      prefix: 'R$ ',
      suffix: '',
      fixed: true,
      fractionDigits: 2,
      decimalSeparator: ',',
      thousandsSeparator: '.',
      cursor: 'end'
    };

    this.input = SimpleMaskMoney.setMask('#value', maskArgs);
  }

  start() {
    const financeService = new FinanceService();
    new HtmlService(financeService, this.input);
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

