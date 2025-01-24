export function isNullish(maybeNullish) {
    return maybeNullish == null;
}
export function isNotNullish(maybeNullish) {
    return maybeNullish != null;
}
export function isBoolean(maybeBoolean) {
    return typeof maybeBoolean === "boolean";
}
export function isNotBoolean(maybeBoolean) {
    return typeof maybeBoolean !== "boolean";
}
export function isNumber(maybeNumber) {
    return typeof maybeNumber === "number";
}
export function isNotNumber(maybeNumber) {
    return typeof maybeNumber !== "number";
}
