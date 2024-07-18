import { ConsoleMessage, expect } from '@playwright/test';

/**
 * Validating that the expected error is part of the console errors
 */
export function validatePageErrors(consoleErrors: ConsoleMessage[], expectedErrorMessages: string[], ignoreErrorMessages: string[]): void {
    /**
     * Filters console messages to exclude ignored messages
     */
    const relevantMessages = consoleErrors.filter((consoleError) => !ignoreErrorMessages.some((ignoreError) => consoleError.text().includes(ignoreError)));

    /**
     * Filters expected error messages that are not found in relevant console messages
     */
    const missingExpectedErrors = expectedErrorMessages.filter((expectedErrorMessage) => !relevantMessages.some((relevantError) => relevantError.text().includes(expectedErrorMessage)));

    expect(missingExpectedErrors.length, `The following expected console errors were not found: ${JSON.stringify(missingExpectedErrors)}`).toBe(0);

    /**
     * Filters relevant console messages that are not part of the expected error messages
     */
    const unexpectedErrors = relevantMessages.filter((relevantError) => !expectedErrorMessages.some((expectedErrorMessage) => relevantError.text().includes(expectedErrorMessage)));

    expect(unexpectedErrors.length, `The following unexpected console errors were found: ${JSON.stringify(unexpectedErrors)}`).toBe(0);
}
