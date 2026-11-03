// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import Foundation

/// Spanish meanings for one chapter, or the honest reason there are none.
public enum SpanishGlossesChirho: Sendable, Hashable {
    /// Approved glosses by word id; nil where the pinned export has none.
    case readyChirho([String: String?], SourceRecordChirho)
    /// The export has no layer for this chapter.
    case absentChirho
    /// The layer was built from other chapter bytes and is withheld until rebuilt.
    case staleChirho
}

struct GlossManifestEntryChirho: Codable, Sendable {
    let numberChirho: Int
    let pathChirho: String
    let sha256Chirho: String
    let contentPathChirho: String
    let contentSha256Chirho: String
}

struct GlossManifestBookChirho: Codable, Sendable {
    let chaptersChirho: [GlossManifestEntryChirho]
}

struct GlossManifestChirho: Codable, Sendable {
    let schemaVersionChirho: Int
    let languageChirho: String
    let booksChirho: [String: GlossManifestBookChirho]
}

struct GlossLayerChirho: Codable, Sendable {
    let schemaVersionChirho: Int
    let bookIdChirho: String
    let chapterChirho: Int
    let contentPathChirho: String
    let contentSha256Chirho: String
    let languageChirho: String
    let sourceChirho: SourceRecordChirho
    let glossesChirho: [String: String?]
}

/// Hash-checked Spanish layers, bound to the exact chapter bytes on screen and fetched only for
/// that chapter. Mirrors the website's i18n-chirho/spanish-glosses-chirho.ts.
public actor GlossClientChirho {
    private let remoteChirho: RemoteChirho
    private var manifestChirho: GlossManifestChirho?
    private var layersChirho = BoundedCacheChirho<String, SpanishGlossesChirho>(capacityChirho: 4)

    public init(remoteChirho: RemoteChirho) {
        self.remoteChirho = remoteChirho
    }

    public func spanishChirho(_ chapterChirho: VerifiedChapterChirho) async throws -> SpanishGlossesChirho {
        let bookChirho = chapterChirho.bookChirho
        let contentChirho = chapterChirho.entryChirho
        let manifestValueChirho = try await manifestOnceChirho()
        guard let entryChirho = manifestValueChirho.booksChirho[bookChirho.idChirho]?.chaptersChirho
            .first(where: { $0.numberChirho == contentChirho.numberChirho })
        else { return .absentChirho }
        guard entryChirho.contentPathChirho == contentChirho.pathChirho else {
            throw RemoteErrorChirho.invalidChirho("Spanish layer for another chapter")
        }
        guard entryChirho.contentSha256Chirho == contentChirho.sha256Chirho else { return .staleChirho }
        if let cachedChirho = layersChirho.valueChirho(entryChirho.pathChirho) { return cachedChirho }
        let dataChirho = try await remoteChirho.verifiedChirho(
            entryChirho.pathChirho, .glossLayerChirho, sha256Chirho: entryChirho.sha256Chirho)
        let layerChirho = try DecodingChirho.decodeChirho(GlossLayerChirho.self, dataChirho)
        guard layerChirho.schemaVersionChirho == 1, layerChirho.languageChirho == "es",
              layerChirho.bookIdChirho == bookChirho.idChirho, layerChirho.chapterChirho == contentChirho.numberChirho,
              layerChirho.contentPathChirho == contentChirho.pathChirho,
              layerChirho.contentSha256Chirho == contentChirho.sha256Chirho,
              layerChirho.glossesChirho.values.allSatisfy({ glossChirho in
                  glossChirho.map { !$0.trimmingCharacters(in: .whitespaces).isEmpty } ?? true
              }),
              layerChirho.sourceChirho.safeLinkChirho != nil
        else { throw RemoteErrorChirho.invalidChirho("Spanish layer") }
        let resultChirho = SpanishGlossesChirho.readyChirho(layerChirho.glossesChirho, layerChirho.sourceChirho)
        layersChirho.insertChirho(entryChirho.pathChirho, resultChirho)
        return resultChirho
    }

    private func manifestOnceChirho() async throws -> GlossManifestChirho {
        if let manifestChirho { return manifestChirho }
        let valueChirho = try DecodingChirho.decodeChirho(
            GlossManifestChirho.self,
            try await remoteChirho.dataChirho("/glosses-chirho/es-chirho/manifest-chirho.json", .glossManifestChirho))
        guard valueChirho.schemaVersionChirho == 1, valueChirho.languageChirho == "es" else {
            throw RemoteErrorChirho.invalidChirho("Spanish manifest")
        }
        manifestChirho = valueChirho
        return valueChirho
    }
}
