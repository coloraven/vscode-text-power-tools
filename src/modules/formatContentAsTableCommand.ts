import * as vscode from "vscode";
import { NO_ACTIVE_EDITOR } from "../consts";
import { getSelectionLines, getSelectionsOrFullDocument, replaceSelectionsWithLines } from "../helpers/vsCodeHelpers";

export type AskSplitCharacterFromUser = 1;
export const ASK_SPLIT_CHARACTER_FROM_USER = 1;

interface IAlignByCharacterOptions {
	splitChar: string | AskSplitCharacterFromUser;
	padAlignChar: boolean;
}

export async function runFormatContentAsTableCommand(options: IAlignByCharacterOptions) {
	const editor = vscode.window.activeTextEditor;
	if (!editor) {
		vscode.window.showWarningMessage(NO_ACTIVE_EDITOR);
		return;
	}

	if (options.splitChar === ASK_SPLIT_CHARACTER_FROM_USER) {
		askForSplitCharacter(editor, options);
	} else {
		await formatContentAsTableInternal(editor, options.splitChar, options.padAlignChar);
	}
}

async function askForSplitCharacter(editor: vscode.TextEditor, options: IAlignByCharacterOptions) {
	vscode.window.showInputBox({
		prompt: vscode.l10n.t("Please enter the character to split by"),
		value: "1",
	}).then(async (splitChar: string | undefined) => {
		if (typeof splitChar === "undefined") {
			return;
		}

		if (!splitChar) {
			vscode.window.showErrorMessage(vscode.l10n.t("No starting number entered."));
			return;
		}

		await formatContentAsTableInternal(editor, splitChar, options.padAlignChar);
	});
}

async function formatContentAsTableInternal(editor: vscode.TextEditor, alignCharacter: string, padAlignCharacter: boolean) {
	const replacedLinesBySelection: string[][] = [];
	const selections = getSelectionsOrFullDocument(editor);

	for (const selection of selections) {
		replacedLinesBySelection.push([]);
		const maxColumnLengths: number[] = [];
		const splitLineContents: string[][] = [];

		for (const lineContent of getSelectionLines(editor, selection)) {
			const pts = lineContent.split(alignCharacter).map(val => val.trim());
			for (let i = 0; i < pts.length; i++) {
				if (maxColumnLengths.length === i) {
					maxColumnLengths.push(pts[i].length);
				} else if (maxColumnLengths[i] < pts[i].length) {
					maxColumnLengths[i] = pts[i].length;
				}
			}

			splitLineContents.push(pts);
		}

		for (const lineContent of splitLineContents) {
			const line = lineContent
				.map((val, i) => val.padEnd(maxColumnLengths[i], " "))
				.join(padAlignCharacter ? ` ${alignCharacter} ` : alignCharacter)
				.trim();
			replacedLinesBySelection[replacedLinesBySelection.length-1].push(line);
		}
	}

	await replaceSelectionsWithLines(editor, selections, replacedLinesBySelection, /*openInNewEditor:*/ false);
}
