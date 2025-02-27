import {
  workspace, window,
  ViewColumn, WebviewPanel, Disposable
} from 'vscode';
import { dirname } from 'path';
import { existsSync, readFileSync } from 'fs';
import renderContent from './renderContent';

const resolveFileOrText = (fileName: string) => {
  console.log(fileName, workspace.textDocuments.map(x => x.fileName));
  let document = workspace.textDocuments.find(e => e.fileName === fileName);

  if (document) {
    return document.getText();
  }
  if (dirname(fileName) && existsSync(fileName)) {
    return readFileSync(fileName, 'utf8');
  }
};

export default class HtmlDocumentContentProvider implements Disposable {
  private webPanel: WebviewPanel | undefined = undefined;
  private _fileName: string | undefined;
  private _dataFileName: string | undefined;

  public show(): void {
    this.webPanel = window.createWebviewPanel(
      'htmlLiquidPreview',
      'HTML Liquid Preview',
      ViewColumn.Two,
      {}
    );

    this.update();
  }

  public async update(): Promise<void> {
    if (this.webPanel) {
      this.webPanel.webview.html = 'Rendering...';
      this.webPanel.webview.html = await this.getHtmlContent();
    }
  }

  public dispose(): void {
    this.webPanel?.dispose();
    this.webPanel = undefined;
  }

  public async getHtmlContent(): Promise<string> {
    let templateSource: string | undefined;
    let dataSource: string | undefined;
    let root: string;

    if (window.activeTextEditor?.document) {
      let currentFileName = window.activeTextEditor.document.fileName;
      let dataFileName: string | undefined;
      let fileName: string | undefined;

      if (currentFileName === this._fileName
        || currentFileName === this._dataFileName) {
        // User swtiched editor to context, just use stored on
        fileName = this._fileName;
        dataFileName = this._dataFileName;
      } else {
        dataFileName = currentFileName + '.json';
        fileName = currentFileName;
      }

      this._fileName = fileName;
      this._dataFileName = dataFileName;
      if (fileName && dataFileName) {
        templateSource = resolveFileOrText(fileName);
        dataSource = resolveFileOrText(dataFileName);
        root = dirname(fileName);

        return renderContent(templateSource ?? '', dataSource ?? '', root);
      }
    }

    return Promise.resolve('');
  }
}
