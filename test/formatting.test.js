const prettier = require('prettier');
const globby = require('globby');
const fs = require('fs');

test('all files should be formatted with Prettier', () => {
  return globby(['./*.js', './test/**/*.js', './lib/**/*.js']).then(paths => {
    paths.forEach(function(path) {
      const result = prettier.check(fs.readFileSync(path).toString(), {
        singleQuote: true
      });
      // include a custom error message with path name because Jest doesn't allow this to my knowledge
      if (!result) console.error(`${path} isn't formatted right`);
      expect(result).toEqual(true);
    });
  });
});
