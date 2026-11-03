// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import Foundation
import HinnehCoreChirho

/// Text tagged with its own language (Hebrew, Greek, English source notes, Spanish meanings), so
/// typesetting and assistive technologies can treat each run as the language it is.
enum TaggedTextChirho {
    static func textChirho(_ valueChirho: String, _ languageChirho: String) -> AttributedString {
        var attributedChirho = AttributedString(valueChirho)
        attributedChirho.languageIdentifier = languageChirho
        return attributedChirho
    }

    static func sourceChirho(_ valueChirho: String, _ scriptChirho: ScriptChirho) -> AttributedString {
        textChirho(valueChirho, scriptChirho == .hebrewChirho ? "he" : "el")
    }
}
