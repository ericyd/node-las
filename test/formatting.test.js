const prettier = require('prettier');
const globby = require('globby');
const fs = require('fs');

// expect.extend({
//   toBeValid(received, validator) {
//     if (validator(received)) {
//       return {
//         message: () => `Email ${received} should NOT be valid`,
//         pass: true
//       };
//     } else {
//       return {
//         message: () => `Email ${received} should be valid`,
//         pass: false
//       };
//     }
//   }
// });

test('all files should be formatted with Prettier', () => {
  return globby(['./*.js', './test/**/*.js', './lib/**/*.js']).then(paths => {
    paths.forEach(function(path) {
      const result = prettier.check(fs.readFileSync(path).toString(), {
        singleQuote: true
      });
      expect(result).toEqual(true);
    });
  });
});
