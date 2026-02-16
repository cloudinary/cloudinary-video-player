const DEFAULT_DPR = 2.0;

const validateDpr = (dpr) => {
  const capped = (typeof dpr === 'number' && !isNaN(dpr) && dpr >= 1.0) ? Math.min(dpr, 2.0) : DEFAULT_DPR;
  return [1, 1.5, 2].reduce((closest, option) => {
    return Math.abs(capped - option) < Math.abs(capped - closest)
      ? option
      : closest;
  });
};

// Test cases
console.log('validateDpr(1.0):', validateDpr(1.0), '- Expected: 1.0');
console.log('validateDpr(1.5):', validateDpr(1.5), '- Expected: 1.5');
console.log('validateDpr(2.0):', validateDpr(2.0), '- Expected: 2.0');
console.log('validateDpr(3.0):', validateDpr(3.0), '- Expected: 2.0 (capped)');
console.log('validateDpr(undefined):', validateDpr(undefined), '- Expected: 2.0 (default)');
console.log('validateDpr(0.5):', validateDpr(0.5), '- Expected: 2.0 (invalid)');
console.log('validateDpr(1.2):', validateDpr(1.2), '- Expected: 1.0 (closest)');
console.log('validateDpr(1.3):', validateDpr(1.3), '- Expected: 1.5 (closest)');
console.log('validateDpr(1.7):', validateDpr(1.7), '- Expected: 1.5 (closest)');
console.log('validateDpr(1.8):', validateDpr(1.8), '- Expected: 2.0 (closest)');
