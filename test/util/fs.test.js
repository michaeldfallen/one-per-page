const { expect } = require('./chai');
const path = require('path');
const { fileExists, glob } = require('../../src/util/fs');

describe('util/fs', () => {
  describe('#fileExists', () => {
    it('resolves if the file exists', () => {
      const file = path.resolve(__dirname, '../views/TestPage.html');
      return expect(fileExists(file)).to.become(file);
    });

    it('rejects if the file doesnt exist', () => {
      const file = path.resolve(__dirname, './nonexistantfile');
      return expect(fileExists(file)).to.eventually.be.rejected;
    });

    it('rejects if the path isnt a file', () => {
      const file = path.resolve(__dirname, '.');
      return expect(fileExists(file)).to.eventually.be.rejected;
    });
  });

  describe('#glob', () => {
    const fixturesDir = path.resolve(__dirname, 'fixtures/glob/');

    it('resolves with a filename', () => {
      const pattern = path.resolve(fixturesDir, 'file1.txt');
      return expect(glob(pattern)).to.eventually.eql([pattern]);
    });

    it('resolves with all filenames that match a pattern', () => {
      const pattern = path.resolve(fixturesDir, 'file*.txt');
      const expected = [
        path.resolve(fixturesDir, 'file1.txt'),
        path.resolve(fixturesDir, 'file2.txt'),
        path.resolve(fixturesDir, 'file3.txt')
      ];
      return expect(glob(pattern)).to.eventually.eql(expected);
    });

    it('resolves with an empty array if nothing matched', () => {
      const pattern = path.resolve(fixturesDir, 'nonexistant.txt');
      return expect(glob(pattern)).to.eventually.eql([]);
    });

    it('rejects if no path provided', () => {
      return expect(glob()).rejectedWith(/pattern string required/);
    });
  });
});
