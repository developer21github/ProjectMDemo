
const fs = require('fs');

const commonCliConfig = 'node_modules/@angular/cli/models/webpack-configs/common.js';
const pug_rule = `\n{
  test: /\\.(pug|jade)$/,
  use: [
    'apply-loader',
    {
      loader: 'pug-loader',
      options: {
        pretty: true,
        doctype: 'html',
        plugins: ["pug-plugin-ng"]
      }
    }
  ]
},`;

fs.readFile(commonCliConfig, (err, data) => {
    if (err) { throw err; }

    const configText = data.toString();

if (configText.indexOf(pug_rule) > -1) {
    console.log('Pug webpack rule already inserted.');
    return;
}

console.log('Inserting pug webpack rule...');

const position = configText.indexOf('rules: [') + 8;
const output = [configText.slice(0, position), pug_rule, configText.slice(position)].join('');

const file = fs.openSync(commonCliConfig, 'r+');
fs.writeFile(file, output, (err) => {
    console.log('Pug webpack rule inserted.');
if(err) {
    console.error('Error when inserting pug webpack rule.');
}
});
fs.close(file, (err) => {
    if(err) {
        console.error('Error when inserting pug webpack rule.');
    }
});
});