import stackRaw from "../../content/stack.json";
import guideRaw from "../../content/guide-content.json";
import { validateStackData, validateGuideData } from "./validate";
import type { StackData, GuideData } from "./types";

validateStackData(stackRaw);
validateGuideData(guideRaw);

export const stackData = stackRaw as unknown as StackData;
export const guideData = guideRaw as unknown as GuideData;
