import * as assert from 'assert';
import { join } from 'path';
import renderContent from '../renderContent';


suite('lib/renderContent', () => {
  test('render plain html', async () => {
    const html = await renderContent('Hello <b>World!</b>', '', '');
    assert.equal(html, 'Hello <b>World!</b>');
  });

  test('render liquid object', async () => {
    console.log(join(__dirname, '../examples/simple.liquid'));
    const html = await renderContent('Super {{foo}}!', '{ "foo": "bar" }', '');
    assert.equal(html, 'Super bar!');
  });
});
