// Negative case: breaks isolatedDeclarations (exported function, no return type).
export function inferred(value: number) {
  return value * 2;
}
