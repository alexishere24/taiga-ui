export abstract class AbstractExampleTuiInteractive {
    readonly pseudoVariants: ReadonlyArray<boolean> = [false, true];

    focusable = true;

    disabled = false;

    pseudoFocused: boolean | null = null;

    pseudoHovered: boolean | null = null;

    pseudoPressed: boolean | null = null;

    pseudoInvalid: boolean | null = null;

    readOnly: boolean | null = null;
}
