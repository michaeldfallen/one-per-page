const Journey = require('../src/Journey');
const {supertest, testApp} = require('./util/supertest');
const {expect} = require('./util/chai');
const Page = require('./../src/steps/Page');

const testUrl = '/test/page';
class TestPage extends Page {
  get url() { return testUrl; }
  get template() { return 'Page'; }
}

describe('Journey', () => {

  it('returns an express router', () => {
    const testJourney = Journey();

    expect(testJourney).to.be.a('function');
    expect(testJourney).itself.to.respondTo('use');
    expect(testJourney).itself.to.respondTo('get');
    expect(testJourney).itself.to.respondTo('post');
  });

  it('binds steps to the router', () => {
    const myJourney = Journey({
      steps: [new TestPage()]
    });
    const app = testApp();
    app.use(myJourney);

    return supertest(app).get(testUrl).expect(200);
  });

});
