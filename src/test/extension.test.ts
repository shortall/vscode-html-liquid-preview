import * as assert from 'assert';
import * as extension from '../extension';
import * as vscode from 'vscode';
import * as tmp from 'tmp';
import * as fs from 'fs';
import * as path from 'path';

suite('Extension Test Suite', function () {

    vscode.window.showInformationMessage('Start all tests.');

    test('activation', function() {
        assert.ok(extension.activate);
    });

    test('format command', async function() {
        await vscode.extensions.getExtension('your-publisher-name.html-liquid-preview')?.activate();

        const tempDir = tmp.dirSync();
        const tempFilePath = path.join(tempDir.name, 'test.liquid');

        try {
            const initialContent = '{% if 1 == 1 %}{% if 1 == 1 %}<p>Hello World!</p>{% endif %}{% endif %}';
            fs.writeFileSync(tempFilePath, initialContent);

            let document = await vscode.workspace.openTextDocument(tempFilePath);
            document = await vscode.languages.setTextDocumentLanguage(document, 'liquid');
            const editor = await vscode.window.showTextDocument(document);

            await vscode.commands.executeCommand('html-liquid-preview.format');

            const formattedText = editor.document.getText();
            const expectedText = '{% if 1 == 1 -%}\r\n  {%- if 1 == 1 %}\r\n    <p>Hello World!</p>\r\n  {% endif -%}\r\n{%- endif %}\r\n';

            assert.equal(formattedText, expectedText);
        } finally {
            await new Promise(resolve => setTimeout(resolve, 500));
            fs.unlinkSync(tempFilePath);
            tempDir.removeCallback();
        }
    });

    test('format command with invalid HTML', async function() {
        await vscode.extensions.getExtension('your-publisher-name.html-liquid-preview')?.activate();

        const tempDir = tmp.dirSync();
        const tempFilePath = path.join(tempDir.name, 'test-invalid.liquid');

        try {
            const initialContent = '{% if 1 == 1 %}<h1>Hello World!</td></h1>{% endif %}';
            fs.writeFileSync(tempFilePath, initialContent);

            let document = await vscode.workspace.openTextDocument(tempFilePath);
            document = await vscode.languages.setTextDocumentLanguage(document, 'liquid');
            const editor = await vscode.window.showTextDocument(document);

            await vscode.commands.executeCommand('html-liquid-preview.format');

            const formattedText = editor.document.getText();
            const expectedText = initialContent;

            assert.equal(formattedText, expectedText);

            const diagnostics = vscode.languages.getDiagnostics(document.uri);
            assert.strictEqual(diagnostics.length, 1, 'Expected one diagnostic');
            
            const diagnostic = diagnostics[0];
            assert.equal(diagnostic.message, "Attempting to close HtmlElement 'td' before HtmlElement 'h1' was closed");
        } finally {
            await new Promise(resolve => setTimeout(resolve, 500));
            fs.unlinkSync(tempFilePath);
            tempDir.removeCallback();
        }
    });
});