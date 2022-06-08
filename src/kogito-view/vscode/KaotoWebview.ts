import { IKaotoChannelApi, IKaotoEnvelopeApi } from '../api';
import { EnvelopeServer } from '@kie-tools-core/envelope-bus/dist/channel';
import * as vscode from 'vscode';
import { Uri, ViewColumn } from 'vscode';

/**
 * This is a convenience class for VS Code Extensions to create a Kaoto View inside a Webview
 *
 * It abstracts the complexity of instancing an EnvelopeServer and starting it properly.
 * The lifecycle of the Webview is also controlled by this class.
 *
 * Calling `open` will open a new tab in VS Code containing the Kaoto View.
 */
export class KaotoWebview {
  constructor(
    private readonly context: vscode.ExtensionContext,
    private readonly envelopeLocator: {
      targetOrigin: string;
      title: string;
      envelopePath: string;
    },
    private readonly apiImpl: IKaotoChannelApi
  ) {}

  public open(pageId: string, opts: { onClose: () => void }) {
    // Creates a Webview instance. This will open a new tab on VS Code.
    const webviewPanel = vscode.window.createWebviewPanel(
      pageId,
      this.envelopeLocator.title,
      ViewColumn.Beside,
      {
        retainContextWhenHidden: true,
        enableCommandUris: true,
        enableScripts: true,
        localResourceRoots: [vscode.Uri.file(this.context.extensionPath)],
      }
    );

    // Creates an absolute path for the script that the Webview needs to load.
    const scriptSrc = webviewPanel.webview
      .asWebviewUri(Uri.file(this.context.asAbsolutePath(this.envelopeLocator.envelopePath)))
      .toString();

    // The HTML of the Webview
    webviewPanel.webview.html = `<!DOCTYPE html>
        <html lang="en">
        <head>
          <style>
            html, body, div#envelope-app {
                margin: 0;
                border: 0;
                padding: 10px;
            }
          </style>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        </head>
        <body>
        <div id="envelope-app" />
        <script src="${scriptSrc}"></script>
        </body>
        </html>`;

    const envelopeServer: EnvelopeServer<IKaotoChannelApi, IKaotoEnvelopeApi> = new EnvelopeServer(
      //Bus implementation. Tells this instance of EnvelopeServer how to send messages to the Webview's iframe
      { postMessage: (message: any) => webviewPanel.webview.postMessage(message) },

      //The origin to which the Envelope must send messages
      this.envelopeLocator.targetOrigin,

      //This is the pollInit parameter. Used to connect the Envelope with this instance of EnvelopeServer.
      () =>
        envelopeServer.manager.clientApi.requests.todoList__init(
          { origin: envelopeServer.origin, envelopeServerId: envelopeServer.id }, //Association
          { steps: [], views: [], yaml: '' } //Init args. This can be extracted as a parameter.
        )
    );

    // Configures how the messages coming from the Envelope are received by the EnvelopeServer
    this.context.subscriptions.push(
      webviewPanel.webview.onDidReceiveMessage(
        (msg: any) => envelopeServer.receive(msg, this.apiImpl),
        webviewPanel.webview,
        this.context.subscriptions
      )
    );

    // Cleans up when the Webview is closed
    webviewPanel.onDidDispose(
      () => {
        envelopeServer.stopInitPolling();
        opts.onClose();
      },
      webviewPanel.webview,
      this.context.subscriptions
    );

    // Starts polling using the initPolling method so that the Envelope can connect with the EnvelopeServer
    envelopeServer.startInitPolling(this.apiImpl);

    // Returns the MessageBusClient instance so that the containing VS Code Extension can communicate with the Envelope.
    return envelopeServer.manager.clientApi;
  }
}
