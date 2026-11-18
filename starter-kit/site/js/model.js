// model.js: the physics/maths only (no DOM). Tested by tests/*.test.mjs.
// Example: first-order-plus-dead-time (FOPDT) response to a step of size du at t = 0.
export function fopdtStep({ K, tau, theta, du = 1 }, t) {
  if (!(tau > 0) || t < theta) return 0;
  return K * du * (1 - Math.exp(-(t - theta) / tau));
}
/** Time to reach 63.2 % of the final change: theta + tau. */
export const t63 = ({ tau, theta }) => theta + tau;
export const finalValue = ({ K, du = 1 }) => K * du;
