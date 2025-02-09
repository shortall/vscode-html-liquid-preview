import {
    workspace, window, commands,
    ExtensionContext, TextEditorSelectionChangeEvent,
    TextDocumentChangeEvent,
    Range,
    Position,
    TextEditorRevealType,
    Diagnostic,
    DiagnosticSeverity,
    DiagnosticCollection,
	languages
} from 'vscode';
import PreviewContentProvider from './PreviewContentProvider';
import * as prettier from 'prettier';
import LiquidPrettierPlugin from '@shopify/prettier-plugin-liquid';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {

    let provider = new PreviewContentProvider();
    const diagnosticCollection: DiagnosticCollection = languages.createDiagnosticCollection('html-liquid-preview');

    context.subscriptions.push(
        diagnosticCollection,
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

                diagnosticCollection.clear();
            } catch (error: any) {
                console.error('Formatting failed: ', error);

                if (isLiquidHTMLParsingError(error)) {
                    const description = error.message.split('\n')[0];
                    const { start, end } = error.loc;
                    const errorRange = new Range(
                        new Position(start.line - 1, start.column - 1),
                        new Position(end.line - 1, end.column - 1)
                    );

                    const diagnostic = new Diagnostic(errorRange, description, DiagnosticSeverity.Error);
                    diagnosticCollection.set(document.uri, [diagnostic]);

					activeTextEditor.revealRange(errorRange, TextEditorRevealType.InCenter);
                }
            }
        }
    });
}

export function deactivate() {
    console.log('html-liquid-preview extension deactivated');
}

interface LiquidHTMLParsingError {
    name: string;
    message: string;
    loc: {
        start: { line: number; column: number };
        end: { line: number; column: number };
    };
}

function isLiquidHTMLParsingError(error: any): error is LiquidHTMLParsingError {
    return error?.name === 'LiquidHTMLParsingError' && error?.loc?.start?.line && error.loc?.end?.line;
}