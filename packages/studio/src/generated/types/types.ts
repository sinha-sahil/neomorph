import { isJSON, decodeString, decodeArray, decodeNumber } from 'type-decoder';

/**
 * @type { CssVariableKind }
 */
export type CssVariableKind =
  | 'color'
  | 'spacing'
  | 'dimension'
  | 'font-size'
  | 'font-family'
  | 'font-weight'
  | 'line-height'
  | 'radius'
  | 'border-width'
  | 'shadow'
  | 'duration'
  | 'z-index'
  | 'opacity'
  | 'number'
  | 'length'
  | 'alias'
  | 'unknown';

export function decodeCssVariableKind(rawInput: unknown): CssVariableKind | null {
  switch (rawInput) {
    case 'color':
    case 'spacing':
    case 'dimension':
    case 'font-size':
    case 'font-family':
    case 'font-weight':
    case 'line-height':
    case 'radius':
    case 'border-width':
    case 'shadow':
    case 'duration':
    case 'z-index':
    case 'opacity':
    case 'number':
    case 'length':
    case 'alias':
    case 'unknown':
      return rawInput;
  }
  return null;
}

/**
 * @type { DefinedVariable }
 */
export type DefinedVariable = {
  /**
   * @type { string }
   * @memberof DefinedVariable
   */
  name: string;
  /**
   * @type { string }
   * @memberof DefinedVariable
   */
  value: string;
  /**
   * @type { string }
   * @memberof DefinedVariable
   */
  resolvedValue: string;
  /**
   * @type { string[] }
   * @memberof DefinedVariable
   */
  definedIn: string[];
  /**
   * @type { string[] }
   * @memberof DefinedVariable
   */
  consumedBy: string[];
  /**
   * @type { CssVariableKind }
   * @memberof DefinedVariable
   */
  kind: CssVariableKind;
};

export function decodeDefinedVariable(rawInput: unknown): DefinedVariable | null {
  if (isJSON(rawInput)) {
    const decodedName = decodeString(rawInput['name']);
    const decodedValue = decodeString(rawInput['value']);
    const decodedResolvedValue = decodeString(rawInput['resolvedValue']);
    const decodedDefinedIn = decodeArray(rawInput['definedIn'], decodeString);
    const decodedConsumedBy = decodeArray(rawInput['consumedBy'], decodeString);
    const decodedKind = decodeCssVariableKind(rawInput['kind']);

    if (
      decodedName === null ||
      decodedValue === null ||
      decodedResolvedValue === null ||
      decodedDefinedIn === null ||
      decodedConsumedBy === null ||
      decodedKind === null
    ) {
      return null;
    }

    return {
      name: decodedName,
      value: decodedValue,
      resolvedValue: decodedResolvedValue,
      definedIn: decodedDefinedIn,
      consumedBy: decodedConsumedBy,
      kind: decodedKind
    };
  }
  return null;
}

/**
 * @type { ScrapedHost }
 */
export type ScrapedHost = {
  /**
   * @type { DefinedVariable[] }
   * @memberof ScrapedHost
   */
  variables: DefinedVariable[];
};

export function decodeScrapedHost(rawInput: unknown): ScrapedHost | null {
  if (isJSON(rawInput)) {
    const decodedVariables = decodeArray(rawInput['variables'], decodeDefinedVariable);

    if (decodedVariables === null) {
      return null;
    }

    return {
      variables: decodedVariables
    };
  }
  return null;
}

/**
 * @type { ScrapedResult }
 */
export type ScrapedResult = Record<string, ScrapedHost>;

export function decodeScrapedResult(rawInput: unknown): ScrapedResult | null {
  if (isJSON(rawInput)) {
    const decodedAdditionalProperties: ScrapedResult = {};
    for (const key in rawInput) {
      const decodedValue = decodeScrapedHost(rawInput[key]);
      if (decodedValue === null) {
        return null;
      }
      decodedAdditionalProperties[key] = decodedValue;
    }
    return decodedAdditionalProperties;
  }
  return null;
}

/**
 * @type { ElementRect }
 */
export type ElementRect = {
  /**
   * @type { number }
   * @memberof ElementRect
   */
  top: number;
  /**
   * @type { number }
   * @memberof ElementRect
   */
  left: number;
  /**
   * @type { number }
   * @memberof ElementRect
   */
  width: number;
  /**
   * @type { number }
   * @memberof ElementRect
   */
  height: number;
};

export function decodeElementRect(rawInput: unknown): ElementRect | null {
  if (isJSON(rawInput)) {
    const decodedTop = decodeNumber(rawInput['top']);
    const decodedLeft = decodeNumber(rawInput['left']);
    const decodedWidth = decodeNumber(rawInput['width']);
    const decodedHeight = decodeNumber(rawInput['height']);

    if (
      decodedTop === null ||
      decodedLeft === null ||
      decodedWidth === null ||
      decodedHeight === null
    ) {
      return null;
    }

    return {
      top: decodedTop,
      left: decodedLeft,
      width: decodedWidth,
      height: decodedHeight
    };
  }
  return null;
}

/**
 * @type { RelevantVariable }
 */
export type RelevantVariable = {
  /**
   * @type { string }
   * @memberof RelevantVariable
   */
  varName: string;
  /**
   * @type { string }
   * @memberof RelevantVariable
   */
  property: string;
  /**
   * @type { string }
   * @memberof RelevantVariable
   */
  resolvedValue: string;
};

export function decodeRelevantVariable(rawInput: unknown): RelevantVariable | null {
  if (isJSON(rawInput)) {
    const decodedVarName = decodeString(rawInput['varName']);
    const decodedProperty = decodeString(rawInput['property']);
    const decodedResolvedValue = decodeString(rawInput['resolvedValue']);

    if (decodedVarName === null || decodedProperty === null || decodedResolvedValue === null) {
      return null;
    }

    return {
      varName: decodedVarName,
      property: decodedProperty,
      resolvedValue: decodedResolvedValue
    };
  }
  return null;
}

/**
 * @type { SelectedElement }
 */
export type SelectedElement = {
  /**
   * @type { string }
   * @memberof SelectedElement
   */
  elementId: string;
  /**
   * @type { string }
   * @memberof SelectedElement
   */
  tagName: string;
  /**
   * @type { string }
   * @memberof SelectedElement
   */
  id: string;
  /**
   * @type { string[] }
   * @memberof SelectedElement
   */
  classNames: string[];
  /**
   * @type { ElementRect }
   * @memberof SelectedElement
   */
  rect: ElementRect;
  /**
   * @type { string }
   * @memberof SelectedElement
   */
  hostName: string;
  /**
   * @type { SelectedElementComputedStyles }
   * @memberof SelectedElement
   */
  computedStyles: SelectedElementComputedStyles;
  /**
   * @type { RelevantVariable[] }
   * @memberof SelectedElement
   */
  relevantVariables: RelevantVariable[];
};

export function decodeSelectedElement(rawInput: unknown): SelectedElement | null {
  if (isJSON(rawInput)) {
    const decodedElementId = decodeString(rawInput['elementId']);
    const decodedTagName = decodeString(rawInput['tagName']);
    const decodedId = decodeString(rawInput['id']);
    const decodedClassNames = decodeArray(rawInput['classNames'], decodeString);
    const decodedRect = decodeElementRect(rawInput['rect']);
    const decodedHostName = decodeString(rawInput['hostName']);
    const decodedComputedStyles = decodeSelectedElementComputedStyles(rawInput['computedStyles']);
    const decodedRelevantVariables = decodeArray(
      rawInput['relevantVariables'],
      decodeRelevantVariable
    );

    if (
      decodedElementId === null ||
      decodedTagName === null ||
      decodedId === null ||
      decodedClassNames === null ||
      decodedRect === null ||
      decodedHostName === null ||
      decodedComputedStyles === null ||
      decodedRelevantVariables === null
    ) {
      return null;
    }

    return {
      elementId: decodedElementId,
      tagName: decodedTagName,
      id: decodedId,
      classNames: decodedClassNames,
      rect: decodedRect,
      hostName: decodedHostName,
      computedStyles: decodedComputedStyles,
      relevantVariables: decodedRelevantVariables
    };
  }
  return null;
}

/**
 * @type { SelectedElementComputedStyles }
 */
export type SelectedElementComputedStyles = Record<string, string>;

export function decodeSelectedElementComputedStyles(
  rawInput: unknown
): SelectedElementComputedStyles | null {
  if (isJSON(rawInput)) {
    const decodedAdditionalProperties: SelectedElementComputedStyles = {};
    for (const key in rawInput) {
      const decodedValue = decodeString(rawInput[key]);
      if (decodedValue === null) {
        return null;
      }
      decodedAdditionalProperties[key] = decodedValue;
    }
    return decodedAdditionalProperties;
  }
  return null;
}
