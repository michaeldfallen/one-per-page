const { expect, sinon } = require('../util/chai');
const { i18NextInstance, i18nMiddleware } = require('../../src/i18n/i18Next');

describe('i18n/i18Next', () => {
  describe('i18nMiddleware', () => {
    it('exposes an express middleware', () => {
      expect(i18nMiddleware).to.be.a('function');
      expect(i18nMiddleware.toString()).to.match(/req,res,next/);
    });

    const executeMiddleware = ({
      req = { cookies: {} },
      res = { cookie: sinon.stub() }
    } = {}) => new Promise((resolve, reject) => {
      const next = error => {
        if (error) {
          reject(error);
        } else {
          resolve({ req, res });
        }
      };
      i18nMiddleware(req, res, next);
    });

    it('does nothing if req.i18Next exists', () => {
      const fakeI18Next = { changeLanguage: sinon.stub(), language: 'en' };
      return executeMiddleware({ req: { i18Next: fakeI18Next } })
        .then(({ req }) => expect(req.i18Next).to.not.eql(i18NextInstance));
    });

    it('attaches i18Next to req.i18Next', () => {
      return executeMiddleware()
        .then(({ req }) => expect(req.i18Next).to.eql(i18NextInstance));
    });

    it('attaches i18n to req', () => {
      return executeMiddleware().then(({ req }) => {
        expect(req.i18n).to.be.an('object');
        expect(req.i18n.t).to.be.a('function');
      });
    });

    it('defaults the current language to english', () => {
      const req = {
        i18Next: { changeLanguage: sinon.stub(), language: 'en' },
        cookies: {}
      };
      const res = { cookie: sinon.stub() };
      return executeMiddleware({ req, res }).then(() => {
        expect(req.i18Next.changeLanguage).calledWith('en');
      });
    });

    it('defaults the current language to english if i18n has no lang', () => {
      const req = {
        i18Next: { changeLanguage: sinon.stub() },
        cookies: {}
      };
      const res = { cookie: sinon.stub() };
      return executeMiddleware({ req, res }).then(() => {
        expect(req.i18Next.changeLanguage).calledWith('en');
        expect(res.cookie).calledWith('i18n', 'en');
      });
    });

    it('sets the current language if req.param.lng is present', () => {
      const req = {
        i18Next: { changeLanguage: sinon.stub(), language: 'en' },
        cookies: {},
        query: { lng: 'cy' }
      };
      const res = { cookie: sinon.stub() };
      return executeMiddleware({ req, res }).then(() => {
        expect(req.i18Next.changeLanguage).calledWith('cy');
      });
    });

    it('sets the current language i18n cookie is present', () => {
      const req = {
        i18Next: { changeLanguage: sinon.stub(), language: 'en' },
        cookies: { i18n: 'cy' }
      };
      const res = { cookie: sinon.stub() };
      return executeMiddleware({ req, res }).then(() => {
        expect(req.i18Next.changeLanguage).calledWith('cy');
      });
    });

    describe('req.i18n.availableLanguages', () => {
      it('returns all langs that have content for the current step', () => {
        const i18Next = {
          t: sinon.stub(),
          changeLanguage: sinon.stub(),
          language: 'en',
          services: {
            resourceStore: {
              // eslint-disable-next-line id-blacklist
              data: {
                en: { FooStep: {} },
                cy: { FooStep: {} }
              }
            }
          }
        };
        const currentStep = { name: 'FooStep' };
        const expected = [
          { code: 'en', name: 'English' },
          { code: 'cy', name: 'Welsh' }
        ];
        i18Next.t.withArgs('en').returns('English');
        i18Next.t.withArgs('cy').returns('Welsh');

        return executeMiddleware({ req: { i18Next, currentStep } })
          .then(({ req }) =>
            expect(req.i18n.availableLanguages).to.eql(expected)
          );
      });
    });

    describe('req.i18n.currentLanguage', () => {
      it('returns the language currently used by i18Next', () => {
        const i18Next = {
          t: sinon.stub(),
          changeLanguage: sinon.stub(),
          language: 'cy'
        };
        const currentStep = { name: 'FooStep' };

        return executeMiddleware({ req: { i18Next, currentStep } })
          .then(({ req }) => {
            expect(req.i18n.currentLanguage).to.eql('cy');
          });
      });

      it('defaults to english if no i18Next has no chosen language', () => {
        const i18Next = {
          t: sinon.stub(),
          changeLanguage: sinon.stub()
        };
        const currentStep = { name: 'FooStep' };

        return executeMiddleware({ req: { i18Next, currentStep } })
          .then(({ req }) => {
            expect(req.i18n.currentLanguage).to.eql('en');
          });
      });
    });
  });


  describe('i18NextInstance', () => {
    it('exposes an instance of i18Next', () => {
      expect(i18NextInstance).to.be.an('object');
      expect(i18NextInstance).to.have.property('t').that.is.a('function');
      expect(i18NextInstance)
        .to.have.property('addResourceBundle').that.is.a('function');
    });
  });
});
