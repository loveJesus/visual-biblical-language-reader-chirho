// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
package us.hinneh.readerchirho.contentchirho

/**
 * JavaScript's `\s`, spelled out for use inside a character class. Android's ICU regex engine and
 * the JVM disagree on `\s` and `\d` (Unicode on Android, ASCII on the JVM) and ICU rejects `(?U)`,
 * so patterns use this class and `[0-9]` to match the website identically on both.
 */
const val WHITESPACE_CLASS_CHIRHO = "\\t\\n\\u000B\\f\\r \\u00A0\\u1680\\u2000-\\u200A\\u2028\\u2029\\u202F\\u205F\\u3000\\uFEFF"
