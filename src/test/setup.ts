import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

// @testing-library/react auto-cleanup requires afterEach to be a global.
// Since vitest globals are disabled, we register it explicitly here.
afterEach(cleanup);
