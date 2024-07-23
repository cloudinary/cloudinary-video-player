// eslint-disable-next-line no-control-regex
export const URL_PATTERN = RegExp('https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\+.~#?&/=]*)');

export const isRawUrl = (value) => URL_PATTERN.test(value);
