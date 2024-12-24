import * as assert from 'assert';
import * as extension from '../extension';
import * as vscode from 'vscode';
import * as tmp from 'tmp';
import * as fs from 'fs';
import * as path from 'path';

suite('Extension Test Suite', function () {

	vscode.window.showInformationMessage('Start all tests.');

	test('activation', () => {
		assert.ok(extension.activate);
	});

    test('format command', async function() {
        await vscode.extensions.getExtension('your-publisher-name.html-liquid-preview')?.activate();

        const tempDir = tmp.dirSync();
        const tempFilePath = path.join(tempDir.name, 'test.liquid');

        const initialContent = '{% if 1 == 1 %}{% if 1 == 1 %}<p>Hello World!</p>{% endif %}{% endif %}';
        fs.writeFileSync(tempFilePath, initialContent);

        let document = await vscode.workspace.openTextDocument(tempFilePath);
		document = await vscode.languages.setTextDocumentLanguage(document, 'liquid');
        const editor = await vscode.window.showTextDocument(document);

        await vscode.commands.executeCommand('html-liquid-preview.format');

        const formattedText = editor.document.getText();
        const expectedText = '{% if 1 == 1 -%}\r\n  {%- if 1 == 1 %}\r\n    <p>Hello World!</p>\r\n  {% endif -%}\r\n{%- endif %}\r\n';

        assert.equal(formattedText, expectedText);

        // Clean up the temporary file and directory
        fs.unlinkSync(tempFilePath);
        tempDir.removeCallback();
    });
});
