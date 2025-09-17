const ARGENTINA_COUNTRY_CODE = "54";
const MIN_E164_LENGTH = 10;
const MAX_E164_LENGTH = 15;

const stripNonDigits = (value: string) => value.replace(/[^0-9]/g, "");

export const normalizePhoneNumber = (
  raw: string | undefined | null
): string | null => {
  if (!raw) {
    return null;
  }

  const digitsOnly = stripNonDigits(raw);
  if (
    digitsOnly.length < MIN_E164_LENGTH ||
    digitsOnly.length > MAX_E164_LENGTH
  ) {
    return null;
  }

  if (digitsOnly.startsWith(ARGENTINA_COUNTRY_CODE)) {
    return `+${digitsOnly}`;
  }

  if (digitsOnly.startsWith("0") && digitsOnly.length > MIN_E164_LENGTH) {
    const withoutZero = digitsOnly.slice(1);
    if (
      withoutZero.length >= MIN_E164_LENGTH &&
      withoutZero.length <= MAX_E164_LENGTH
    ) {
      return `+${ARGENTINA_COUNTRY_CODE}${withoutZero}`;
    }
  }

  if (digitsOnly.length === MIN_E164_LENGTH) {
    return `+${ARGENTINA_COUNTRY_CODE}${digitsOnly}`;
  }

  return `+${digitsOnly}`;
};

export const isValidPhoneNumber = (raw: string): boolean => {
  return normalizePhoneNumber(raw) !== null;
};

export const sanitizePhoneInput = (raw: string) => stripNonDigits(raw);
