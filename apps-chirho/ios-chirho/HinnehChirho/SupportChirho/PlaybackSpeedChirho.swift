// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import HinnehCoreChirho

/// One saved speed for word recordings, verse readings and their matching video.
enum PlaybackSpeedChirho: String, CaseIterable, Identifiable {
    case gentleChirho = "gentle_chirho"
    case normalChirho = "normal_chirho"
    case briskChirho = "brisk_chirho"

    var id: String { rawValue }
    var rateChirho: Float {
        switch self {
        case .gentleChirho: 0.85
        case .normalChirho: 1
        case .briskChirho: 1.25
        }
    }

    func labelChirho(_ localeChirho: LocaleChirho) -> String {
        switch self {
        case .gentleChirho: localeChirho == .spanishChirho ? "Suave · 0,85×" : "Gentle · 0.85×"
        case .normalChirho: "Normal · 1×"
        case .briskChirho: localeChirho == .spanishChirho ? "Ágil · 1,25×" : "Brisk · 1.25×"
        }
    }
}
