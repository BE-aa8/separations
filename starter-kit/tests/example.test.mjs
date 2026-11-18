// Pattern for hand-calc tests: numbers worked out by hand (or by an independent script) BEFORE the
// build, checked against the model with a tolerance. Run with: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fopdtStep, t63, finalValue } from '../site/js/model.js';

const near = (a, b, rel = 1e-3) => assert.ok(Math.abs(a - b) <= rel * Math.max(1, Math.abs(b)), `${a} vs ${b}`);
const p = { K: 1.5, tau: 5, theta: 2 };

test('nothing happens during the dead time', () => { assert.equal(fopdtStep(p, 1.9), 0); });
test('63.2 % of the final change one time constant after the dead time', () => { near(fopdtStep(p, 7), 1.5 * (1 - Math.exp(-1))); });
test('t63 = theta + tau', () => { near(t63(p), 7); });
test('final value = K * du', () => { near(finalValue(p), 1.5); near(fopdtStep(p, 200), 1.5); });
