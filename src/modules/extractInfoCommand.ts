import * as vscode from "vscode";
import { NO_ACTIVE_EDITOR } from "../consts";
import { getExtensionSettings } from "../helpers/tptSettings";
import { getSelectionLines, getSelectionsOrFullDocument, replaceSelectionsWithLines, showHistoryQuickPick } from "../helpers/vsCodeHelpers";

interface IExtractInfoCommandOptions {
	inNewEditor: boolean;
}

export async function runExtractInfoCommand(context: vscode.ExtensionContext, options: IExtractInfoCommandOptions) {
	const settings = getExtensionSettings();

	const editor = vscode.window.activeTextEditor;
	if (!editor) {
		vscode.window.showErrorMessage(NO_ACTIVE_EDITOR);
		return;
	}

	showHistoryQuickPick({
		context: context,
		title: "Please enter the filter text",
		historyStateKey: "extractInfo-filter",
		onDidAccept: async (filter: string) => {
			if (!filter) {
				return;
			}

			if (settings.caseSensitiveFiltering === false) {
				filter = filter.toLocaleLowerCase();
			}

			const regexObject = new RegExp("^.*?" + filter + ".*?$", settings.caseSensitiveFiltering === false ? "i" : undefined);

			showHistoryQuickPick({
				context: context,
				title: "Please enter the replacement rule",
				historyStateKey: "extractInfo-replacement",
				onDidAccept: async (replacement: string) => {
					if (typeof replacement === "undefined") {
						return;
					}

					if (!replacement) {
						vscode.window.showErrorMessage("No replacement entered.");
						return;
					}

					replacement = replacement.replace(/\\n/g, "\n");

					const matchingLinesBySelection: string[][] = [];
					const selections = getSelectionsOrFullDocument(editor);

					for (const selection of selections) {
						matchingLinesBySelection.push([]);

						for (const lineContent of getSelectionLines(editor, selection)) {
							let matched: boolean = regexObject.test(lineContent);

							if (matched) {
								matchingLinesBySelection[matchingLinesBySelection.length - 1].push(lineContent.replace(regexObject, replacement));
							}
						}
					}

					await replaceSelectionsWithLines(editor, selections, matchingLinesBySelection, options.inNewEditor);
				}
			});
		}
	});
}
