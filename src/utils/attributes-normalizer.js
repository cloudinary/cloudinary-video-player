import { camelize } from './string';

const CLD_ATTR_REGEX = /^(data-cld-)(\w+)/;

const normalizers = {};

function coerce(string) {
  let val = null;

  // Boolean
  if (string === '') {
    return true;
  }

  // Complex object
  try {
    val = JSON.parse(string);
  } catch (e) {
    // Continue execution in case str is not parsable
  }
  if (val) {
    return val;
  }

  // Number
  val = Number(string);
  if (val) {
    return val;
  }

  // TODO: Parse date?
  //
  return string;
}

const normalizeDefault = (value) => coerce(value);

const normalizeAttributes = (elem) => {
  const obj = {};

  if (elem && elem.attributes && elem.attributes.length > 0) {
    const attrs = elem.attributes;

    for (let i = attrs.length - 1; i >= 0; i--) {
      let attrName = attrs[i].name;
      let attrVal = attrs[i].value;

      if (attrName.match(CLD_ATTR_REGEX)) {
        attrName = camelize(attrName.replace(CLD_ATTR_REGEX, '$2'));
      }

      // check for known booleans
      // the matching element property will return a value for typeof
      // if (typeof elem[attrName] === 'boolean' || KNOWN_BOOLEANS[attrName]) {
      if (typeof elem[attrName] === 'boolean') {
        // the value of an included boolean attribute is typically an empty
        // string ('') which would equal false if we just check for a false value.
        // we also don't want support bad code like autoplay='false'
        attrVal = (attrVal !== null);
      } else {
        const normalizer = normalizers[attrName] || normalizeDefault;
        attrVal = normalizer(attrVal);
      }

      obj[attrName] = attrVal;
    }
  }

  return obj;
};

export { normalizeAttributes };
