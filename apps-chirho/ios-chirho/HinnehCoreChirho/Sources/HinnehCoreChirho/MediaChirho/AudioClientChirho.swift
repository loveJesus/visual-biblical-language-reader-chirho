// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import Foundation

/// One published recording, exactly as the chapter catalogue lists it.
public struct ClipChirho: Codable, Sendable, Hashable {
    public let lessonIdChirho: String
    public let tokenIdChirho: String?
    public let languageChirho: String
    public let textChirho: String
    public let canonicalSha256Chirho: String
    public let synthesisTextChirho: String?
    public let ipaChirho: String?
    public let recipeIdChirho: String?
    public let pronunciationChirho: String
    public let voiceNameChirho: String
    public let assetPathChirho: String
    public let sha256Chirho: String
    public let bytesChirho: Int
    public let durationChirho: Double
    public let startOffsetChirho: Double?
    public let endOffsetChirho: Double?
    public let reviewChirho: String
    public var readingSourceChirho: HumanReadingSourceChirho? = nil

    public var isApprovedChirho: Bool { reviewChirho == "approved" }
}

struct AudioManifestEntryChirho: Codable, Sendable {
    let numberChirho: Int
    let pathChirho: String
    let sha256Chirho: String
}

struct AudioManifestBookChirho: Codable, Sendable {
    let chaptersChirho: [AudioManifestEntryChirho]
}

struct AudioManifestChirho: Codable, Sendable {
    let schemaVersionChirho: Int
    let booksChirho: [String: AudioManifestBookChirho]
}

struct AudioChapterChirho: Codable, Sendable {
    let schemaVersionChirho: Int
    let bookIdChirho: String
    let chapterChirho: Int
    let contentPathChirho: String
    let contentSha256Chirho: String
    let clipsChirho: [ClipChirho]
    var readingsChirho: [ClipChirho]? = nil
}

/// How Greek is pronounced for playback. Modern with aspirates is the default; the website's
/// speech-controls-chirho.ts applies the same acceptance rules.
public enum GreekRenditionChirho: String, Sendable, CaseIterable, Identifiable {
    case modernAspiratesChirho = "modern_aspirates"
    case modernChirho = "modern"
    case erasmianChirho = "erasmian"

    public var id: String { rawValue }

    /// Whether a recording with this pronunciation profile may speak this text. A bulk modern
    /// recording (no /h/) can stand in for the aspirated rendition only when the text has no
    /// rough breathing; the check reads a decomposed copy, never the source itself.
    public func acceptsChirho(_ pronunciationChirho: String, _ spokenChirho: String) -> Bool {
        switch self {
        case .modernChirho: pronunciationChirho == "modern_greek"
        case .erasmianChirho: pronunciationChirho == "erasmian_greek"
        case .modernAspiratesChirho:
            pronunciationChirho == "modern_greek_aspirates"
                || (pronunciationChirho == "modern_greek" && !Self.hasRoughBreathingChirho(spokenChirho))
        }
    }

    public static func hasRoughBreathingChirho(_ textChirho: String) -> Bool {
        textChirho.decomposedStringWithCanonicalMapping.unicodeScalars.contains("\u{0314}")
    }

    /// The profile this rendition records natively, preferred over a compatible stand-in.
    var nativeProfileChirho: String {
        switch self {
        case .modernChirho: "modern_greek"
        case .erasmianChirho: "erasmian_greek"
        case .modernAspiratesChirho: "modern_greek_aspirates"
        }
    }
}

/// The recordings that may play for one verse: at most one per word, and one natural reading.
public struct VerseAudioChirho: Sendable, Hashable {
    public let wordClipsChirho: [String: ClipChirho]
    public let verseClipChirho: ClipChirho?

    public static let emptyChirho = VerseAudioChirho(wordClipsChirho: [:], verseClipChirho: nil)
}

/// Finds the selected chapter in the global audio manifest, verifies its catalogue and binding to
/// the exact content chapter, and keeps only recordings of this verse's exact words.
public actor AudioClientChirho {
    private let remoteChirho: RemoteChirho
    private var manifestChirho: (AudioManifestChirho, Date)?
    private var chaptersChirho = BoundedCacheChirho<String, AudioChapterChirho>(capacityChirho: 4)

    public init(remoteChirho: RemoteChirho) {
        self.remoteChirho = remoteChirho
    }

    public func verseAudioChirho(_ chapterChirho: VerifiedChapterChirho, _ verseChirho: VerseDisplayChirho,
                                 _ renditionChirho: GreekRenditionChirho) async throws -> VerseAudioChirho {
        guard let catalogueChirho = try await catalogueChirho(chapterChirho) else { return .emptyChirho }
        let readingsChirho = (catalogueChirho.readingsChirho ?? []).filter { $0.readingSourceChirho?.validChirho($0) == true }
        return AudioRulesChirho.selectChirho(catalogueChirho.clipsChirho + readingsChirho, verseChirho, renditionChirho)
    }

    private func catalogueChirho(_ chapterChirho: VerifiedChapterChirho) async throws -> AudioChapterChirho? {
        let bookChirho = chapterChirho.bookChirho
        let numberChirho = chapterChirho.entryChirho.numberChirho
        let manifestValueChirho = try await manifestOnceChirho()
        guard let entryChirho = manifestValueChirho.booksChirho[bookChirho.idChirho]?.chaptersChirho
            .first(where: { $0.numberChirho == numberChirho })
        else { return nil }
        guard entryChirho.pathChirho == "/audio-chirho/\(bookChirho.slugChirho)/"
            + bookChirho.chapterFileChirho(numberChirho)
        else { throw RemoteErrorChirho.invalidChirho("audio chapter path") }
        let keyChirho = "\(bookChirho.idChirho).\(numberChirho).\(entryChirho.sha256Chirho)"
        if let cachedChirho = chaptersChirho.valueChirho(keyChirho) { return cachedChirho }
        let dataChirho = try await remoteChirho.verifiedChirho(
            entryChirho.pathChirho, .audioChapterChirho, sha256Chirho: entryChirho.sha256Chirho)
        let catalogueChirho = try DecodingChirho.decodeChirho(AudioChapterChirho.self, dataChirho)
        guard catalogueChirho.schemaVersionChirho == 1, catalogueChirho.bookIdChirho == bookChirho.idChirho,
              catalogueChirho.chapterChirho == numberChirho,
              catalogueChirho.clipsChirho.count + (catalogueChirho.readingsChirho?.count ?? 0) <= 2000,
              catalogueChirho.contentPathChirho == chapterChirho.entryChirho.pathChirho,
              catalogueChirho.contentSha256Chirho == chapterChirho.entryChirho.sha256Chirho
        else { throw RemoteErrorChirho.invalidChirho("audio chapter binding") }
        chaptersChirho.insertChirho(keyChirho, catalogueChirho)
        return catalogueChirho
    }

    /// The global manifest is re-read at most once a minute, like the website.
    private func manifestOnceChirho() async throws -> AudioManifestChirho {
        if let (valueChirho, readAtChirho) = manifestChirho, Date().timeIntervalSince(readAtChirho) < 60 {
            return valueChirho
        }
        let valueChirho = try DecodingChirho.decodeChirho(
            AudioManifestChirho.self,
            try await remoteChirho.dataChirho("/audio-chirho/manifest-chirho.json", .audioManifestChirho))
        guard valueChirho.schemaVersionChirho == 1 else { throw RemoteErrorChirho.invalidChirho("audio manifest") }
        manifestChirho = (valueChirho, Date())
        return valueChirho
    }
}

enum AudioRulesChirho {
    /// Exact recordings that must never play again, mirrored from the website's audio reviews.
    static let rejectedChirho: Set<String> = [
        "6a404d94c40e869718b48a3aa3c2083cb42ecd1596d720465fb2d7dac9d8975e"
    ]
    static let connectedRecipeChirho = "israeli-ipa-connected-v2-chirho"

    static func selectChirho(_ clipsChirho: [ClipChirho], _ verseChirho: VerseDisplayChirho,
                             _ renditionChirho: GreekRenditionChirho = .modernAspiratesChirho) -> VerseAudioChirho {
        let greekChirho = verseChirho.scriptChirho == .greekChirho
        let canonicalShaChirho = DigestChirho.sha256HexChirho(verseChirho.canonicalTextChirho)
        let wordsChirho = Dictionary(uniqueKeysWithValues: verseChirho.wordsChirho.map { ($0.idChirho, $0) })
        let usableChirho = clipsChirho.filter {
            validShapeChirho($0, greekChirho: greekChirho)
                && $0.lessonIdChirho == verseChirho.idChirho && $0.canonicalSha256Chirho == canonicalShaChirho
        }
        var wordClipsChirho: [String: ClipChirho] = [:]
        for clipChirho in usableChirho {
            guard let tokenIdChirho = clipChirho.tokenIdChirho, let wordChirho = wordsChirho[tokenIdChirho],
                  !wordChirho.isAramaicChirho,
                  profileFitsChirho(clipChirho, wordChirho.spokenTextChirho, greekChirho, renditionChirho),
                  ExactTextChirho.equalChirho(clipChirho.textChirho, wordChirho.spokenTextChirho)
            else { continue }
            if let currentChirho = wordClipsChirho[tokenIdChirho],
               rankChirho(currentChirho, renditionChirho) >= rankChirho(clipChirho, renditionChirho) { continue }
            wordClipsChirho[tokenIdChirho] = clipChirho
        }
        let spokenVerseChirho = spokenVerseTextChirho(verseChirho)
        let verseClipChirho = usableChirho
            .filter { clipChirho in
                clipChirho.tokenIdChirho == nil
                    // Only the already-validated human source may read an Aramaic/mixed verse.
                    && (!verseChirho.hasAramaicChirho || clipChirho.readingSourceChirho != nil)
                    && profileFitsChirho(clipChirho, spokenVerseChirho, greekChirho, renditionChirho)
                    && ExactTextChirho.equalChirho(clipChirho.textChirho, spokenVerseChirho)
            }
            .max { rankChirho($0, renditionChirho) < rankChirho($1, renditionChirho) }
        return VerseAudioChirho(wordClipsChirho: wordClipsChirho, verseClipChirho: verseClipChirho)
    }

    static func profileFitsChirho(_ clipChirho: ClipChirho, _ spokenChirho: String, _ greekChirho: Bool,
                                  _ renditionChirho: GreekRenditionChirho) -> Bool {
        greekChirho ? renditionChirho.acceptsChirho(clipChirho.pronunciationChirho, spokenChirho)
            : clipChirho.pronunciationChirho == "israeli_hebrew"
    }

    /// Preference among equally valid recordings: the rendition's own profile, then reviewed,
    /// then connected phrasing, then a published recipe, then an IPA-controlled reading.
    static func rankChirho(_ clipChirho: ClipChirho, _ renditionChirho: GreekRenditionChirho) -> Int {
        (clipChirho.readingSourceChirho == nil ? 0 : 32)
            + (clipChirho.pronunciationChirho == renditionChirho.nativeProfileChirho ? 16 : 0)
            + (clipChirho.isApprovedChirho ? 8 : 0) + (clipChirho.recipeIdChirho == connectedRecipeChirho ? 4 : 0)
            + (clipChirho.recipeIdChirho == nil ? 0 : 2) + (clipChirho.ipaChirho == nil ? 0 : 1)
    }

    /// The publisher's recording shape; anything else is withheld rather than played.
    static func validShapeChirho(_ clipChirho: ClipChirho, greekChirho: Bool) -> Bool {
        guard !rejectedChirho.contains(clipChirho.sha256Chirho), DigestChirho.isHexChirho(clipChirho.sha256Chirho),
              clipChirho.assetPathChirho == "/audio-chirho/sha256-chirho/\(clipChirho.sha256Chirho)-chirho.mp3",
              clipChirho.languageChirho == (greekChirho ? "el" : "he"),
              ["audition", "approved"].contains(clipChirho.reviewChirho),
              !clipChirho.voiceNameChirho.trimmingCharacters(in: .whitespaces).isEmpty,
              (1...4_000_000).contains(clipChirho.bytesChirho),
              clipChirho.durationChirho > 0, clipChirho.durationChirho <= 120,
              validWindowChirho(clipChirho)
        else { return false }
        if let sourceChirho = clipChirho.readingSourceChirho { return sourceChirho.validChirho(clipChirho) }
        if let recipeChirho = clipChirho.recipeIdChirho {
            return recipeChirho.wholeMatch(of: /[a-z0-9]+(?:-[a-z0-9]+)*-chirho/) != nil
                && clipChirho.synthesisTextChirho != nil
        }
        guard let ipaChirho = clipChirho.ipaChirho else { return clipChirho.synthesisTextChirho == nil }
        return clipChirho.synthesisTextChirho == "\"/\(ipaChirho)/\""
    }

    static func validWindowChirho(_ clipChirho: ClipChirho) -> Bool {
        switch (clipChirho.startOffsetChirho, clipChirho.endOffsetChirho) {
        case (nil, nil): true
        case let (startChirho?, endChirho?):
            startChirho >= 0 && startChirho < endChirho && endChirho <= clipChirho.durationChirho
        default: false
        }
    }

    /// The verse as read aloud: each written word with a read form (qere) is spoken as that form.
    static func spokenVerseTextChirho(_ verseChirho: VerseDisplayChirho) -> String {
        verseChirho.spokenTextChirho
    }
}
