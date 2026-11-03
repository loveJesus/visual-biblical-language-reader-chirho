// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import Foundation

/// Source text helpers that never normalize. Offsets are the publisher's JavaScript UTF-16 code
/// unit offsets, and equality is scalar for scalar (Swift's `==` would accept canonical
/// equivalents, which the source does not).
public enum ExactTextChirho {
    /// The UTF-16 slice [start, end), or nil when the range is outside the text.
    public static func sliceChirho(_ textChirho: String, _ startChirho: Int, _ endChirho: Int)
        -> String? {
        let unitsChirho = textChirho.utf16
        guard startChirho >= 0, startChirho <= endChirho, endChirho <= unitsChirho.count else {
            return nil
        }
        let lowerChirho = unitsChirho.index(unitsChirho.startIndex, offsetBy: startChirho)
        let upperChirho = unitsChirho.index(lowerChirho, offsetBy: endChirho - startChirho)
        return String(decoding: Array(unitsChirho[lowerChirho..<upperChirho]), as: UTF16.self)
    }

    public static func lengthChirho(_ textChirho: String) -> Int { textChirho.utf16.count }

    public static func equalChirho(_ leftChirho: String, _ rightChirho: String) -> Bool {
        leftChirho.unicodeScalars.elementsEqual(rightChirho.unicodeScalars)
    }

    /// True when the text holds a letter or a combining mark: a source word, not punctuation.
    public static func hasWordCharacterChirho(_ textChirho: String) -> Bool {
        textChirho.unicodeScalars.contains { scalarChirho in
            switch scalarChirho.properties.generalCategory {
            case .uppercaseLetter, .lowercaseLetter, .titlecaseLetter, .modifierLetter, .otherLetter,
                 .nonspacingMark, .spacingMark, .enclosingMark:
                true
            default:
                false
            }
        }
    }

    public static func isWhitespaceOnlyChirho(_ textChirho: String) -> Bool {
        textChirho.unicodeScalars.allSatisfy(\.properties.isWhitespace)
    }
}
