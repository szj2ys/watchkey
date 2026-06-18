import '@testing-library/jest-dom';
import 'form-request-submit-polyfill';
import { toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);

// JSDOM scrollIntoView polyfill
window.HTMLElement.prototype.scrollIntoView = jest.fn();
