import { Locator, Page } from '@playwright/test';

/**
 * Base component constructor interface
 *
 * selector is optional in order to allow default selector usage.
 * For example:
 *
 * constructor(dataProps: IBaseComponent) {
 *     const baseComponentProps: IBaseComponent = dataProps;
 *     baseComponentProps.selector = dataProps?.selector ??  "//*<SOME DEFAULT SELECTOR>";
 *     super(baseComponentProps);
 *     ...
 *   }
 */
export interface IBaseComponent {
    page: Page;
    selector: string;
    parentSelector?: string;
    iframeSelector?: string;
}
/**
 * Base class for an POM component class
 * such as buttons, dropList, etc
 */
export class BaseComponent {
    get locator(): Locator {
        return this._locator;
    }

    get props(): IBaseComponent {
        return this._props;
    }

    private readonly _locator: Locator;
    private readonly _props: IBaseComponent;

    constructor(basePageProps: IBaseComponent) {
        if (!basePageProps.selector) {
            throw Error(`Missing selector in basePageProps`);
        }
        const elementSelector: string = basePageProps.parentSelector ? `${basePageProps.parentSelector}${basePageProps.selector}` : basePageProps.selector;

        this._props = basePageProps;
        this._locator = basePageProps.iframeSelector ? basePageProps.page.frameLocator(basePageProps.iframeSelector).locator(elementSelector) : basePageProps.page.locator(elementSelector);
    }
}
