'use strict';

import { LanguageClient, LanguageClientOptions, ServerOptions } from 'vscode-languageclient/node'
import * as path from 'path';
import * as vscode from 'vscode';
import { commands, window, workspace, TextDocument } from 'vscode';
import { LoggingService } from './logging-service';
import { RestartLS } from './commands';


export const clients: Map<string, LanguageClient> = new Map();

  export class LpythClient {
  constructor(private logger: LoggingService, private context?: vscode.ExtensionContext) {
    this.logger.logInfo('LPython Language Server');

    // if context is present
    if (this.context !== undefined) {
      // Register Language Server Commands
      this.context.subscriptions.push(
        vscode.commands.registerCommand(RestartLS, this.restartLS, this)
      );
    }
  }

  private client: LanguageClient | undefined;
  private readonly name: string = "LPython Language Server";

  public async activate() {
    // workspace.onDidOpenTextDocument(this.didOpenTextDocument, this);
    workspace.onDidSaveTextDocument(this.didSaveTextDocument, this);
    return;
  }

  public async deactivate(): Promise<void> {
    const promises: Thenable<void>[] = [];
    for (const [key, client] of clients.entries()) {
      promises.push(client.stop()); // stop the language server
      clients.delete(key); // delete the URI from the map
    }
    await Promise.all(promises);
    return undefined;
  }

  private async didSaveTextDocument(
    document: TextDocument
  ): Promise<void> {
    const args = [
        // You cannot pass a uri object 
      document.uri.toString()
    ];
    const executablePath = "lpyth";

    const serverOptions: ServerOptions = {
      command: executablePath,
      args: args,
    };

    // Assuming we are in a standalone file...
    const fileRoot: string = path.dirname(document.uri.fsPath);
 
    const clientOptions: LanguageClientOptions = {
      documentSelector: [{ scheme: 'file', language: 'LPython' }],
      outputChannel: this.logger.getOutputChannel(),
    };

    this.client = new LanguageClient(
      "lpyth", this.name, serverOptions, clientOptions
    );
    this.client.start();
    clients.set(fileRoot, this.client);
    return;
  }

  private async restartLS(): Promise<void> {
    this.logger.logInfo('Restarting language server...');
    vscode.window.showInformationMessage('Restarting language server...');
    await this.deactivate();
    await this.activate();
  }
}
