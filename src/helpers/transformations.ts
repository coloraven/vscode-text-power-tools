import * as cc from "change-case";
import { spongeCase } from "sponge-case";
import { swapCase } from "swap-case";
import { camelCase } from "voca";
import { NumeralSystem } from "../interfaces";
import { convertTextualNumber } from "./textualNumberConverter";
import { ITextPowerToolsSettings } from "./tptSettings";

export function removeControlCharacters(text: string) {
	// eslint-disable-next-line no-control-regex
	return text.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "");
}

export function runTransformations(
	text: string,
	transformations: string[],
	settings: ITextPowerToolsSettings
): string {
	if (!transformations || transformations.length === 0) {
		return text;
	}

	for (const tranformation of transformations) {
		switch (tranformation) {
			case "removeControlCharacters":
				text = removeControlCharacters(text);
				break;
			case "camelCase":
				text = camelCase(text);
				break;
			case "pascalCase":
				text = cc.pascalCase(text);
				break;
			case "snakeCase":
				text = cc.snakeCase(text);
				break;
			case "dashCase":
				text = cc.paramCase(text);
				break;
			case "constantCase":
				text = cc.constantCase(text);
				break;
			case "dotCase":
				text = cc.dotCase(text);
				break;
			case "swapCase":
				text = swapCase(text);
				break;
			case "spongeCase":
				text = spongeCase(text);
				break;
			case "toDecimal":
				text = convertTextualNumber(text, NumeralSystem.Decimal, settings).result;
				break;
			case "toHex":
				text = convertTextualNumber(text, NumeralSystem.Hexadecimal, settings).result;
				break;
		}
	}

	return text;
}
