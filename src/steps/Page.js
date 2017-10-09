const BaseStep = require('./BaseStep');
const addLocals = require('../middleware/addLocals');
const { METHOD_NOT_ALLOWED } = require('http-status-codes');
const loadStepContent = require('../i18n/loadStepContent');
const resolveTemplate = require('../middleware/resolveTemplate');
const i18Next = require('../i18n/i18Next');
const { proxyHandler } = require('../i18n/contentProxy');

class Page extends BaseStep {
  constructor() {
    super();
    this.content = new Proxy(i18Next, proxyHandler);
  }

  get middleware() {
    return [resolveTemplate, addLocals, loadStepContent];
  }

  handler(req, res) {
    if (req.method === 'GET') {
      res.render(this.template);
    } else {
      res.sendStatus(METHOD_NOT_ALLOWED);
    }
  }
}

module.exports = Page;
