import * as path from 'path';
import * as cp from 'child_process';
 
import * as vscode from 'vscode';
import internal = require('assert');

import { LpythClient } from './client';
import { LoggingService } from './logging-service';
 
const loggingService = new LoggingService();

// called when vs code is activated
export function activate(context: vscode.ExtensionContext) {
	new LpythClient(loggingService, context).activate();
	return context;
}