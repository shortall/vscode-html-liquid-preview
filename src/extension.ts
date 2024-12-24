// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import {
	workspace, window, commands,
	ExtensionContext, TextEditorSelectionChangeEvent,
	TextDocumentChangeEvent,
	Range,
} from 'vscode';
import PreviewContentProvider from './PreviewContentProvider';
import * as prettier from 'prettier';
import LiquidPrettierPlugin from '@shopify/prettier-plugin-liquid';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {

	let provider = new PreviewContentProvider();

	context.subscriptions.push(
		// Global handlers
		window.onDidChangeTextEditorSelection((e: TextEditorSelectionChangeEvent) => {
			if (e.textEditor === window.activeTextEditor) {
				provider.update();
			}
		}),

		workspace.onDidChangeTextDocument((e: TextDocumentChangeEvent) => {
			if (e.document === window.activeTextEditor?.document) {
				provider.update();
			}
		})
	);

	// Commands
	commands.registerCommand('html-liquid-preview.preview', () => { provider.show(); });

	commands.registerCommand('html-liquid-preview.format', async () => {
		const { activeTextEditor } = window;
		console.log('activeTextEditor?.document.languageId');
		console.log(activeTextEditor?.document.languageId);
		if (activeTextEditor && activeTextEditor.document.languageId === 'liquid') {
			const { document } = activeTextEditor;

			const text = document.getText();
            try {
                const formatted = await prettier.format(text, {
                    parser: 'liquid-html',
                    plugins: [LiquidPrettierPlugin]
                });

                const fullRange = new Range(
                    document.positionAt(0),
                    document.positionAt(text.length)
                );

                activeTextEditor.edit(editBuilder => {
                    editBuilder.replace(fullRange, formatted);
                });
            } catch (error) {
                console.error('Formatting failed: ', error);
            }
		}
	});
}

// This method is called when your extension is deactivated
export function deactivate() { 
	console.log('html-liquid-preview extension deactivated');
}
