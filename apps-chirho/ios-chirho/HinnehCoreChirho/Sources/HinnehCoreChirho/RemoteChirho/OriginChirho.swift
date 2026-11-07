// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import Foundation

/// The kinds of public resource the reader may request. Each kind has one path shape and one
/// size limit; a path that does not match is never turned into a request.
public enum ResourceKindChirho: Sendable, CaseIterable {
    case bookListChirho
    case contentManifestChirho
    case contentChapterChirho
    case mediaSummaryChirho
    case mediaChapterChirho
    case artworkChirho
    case audioManifestChirho
    case audioChapterChirho
    case audioClipChirho
    case videoClipChirho
    case glossManifestChirho
    case glossLayerChirho

    /// Upper bound on a response body, matching the website's own client limits.
    public var limitChirho: Int {
        switch self {
        case .bookListChirho: 64 * 1024
        case .contentManifestChirho: 128 * 1024
        case .contentChapterChirho: 4 * 1024 * 1024
        case .mediaSummaryChirho, .mediaChapterChirho: 2 * 1024 * 1024
        case .artworkChirho: 4 * 1024 * 1024
        case .audioManifestChirho: 2 * 1024 * 1024
        case .audioChapterChirho: 2 * 1024 * 1024
        case .audioClipChirho: 4_000_000
        case .videoClipChirho: 16 * 1024 * 1024
        case .glossManifestChirho: 512 * 1024
        case .glossLayerChirho: 2_000_000
        }
    }

    func matchesChirho(_ pathChirho: String) -> Bool {
        let slugChirho = "[a-z0-9]+(?:-[a-z0-9]+)*-chirho"
        let chapterChirho = "chapter-[0-9]{2,3}-chirho\\.json"
        let patternChirho: String
        switch self {
        case .bookListChirho: patternChirho = "/library-chirho/books-chirho\\.json"
        case .contentManifestChirho: patternChirho = "/content-chirho/\(slugChirho)/manifest-chirho\\.json"
        case .contentChapterChirho: patternChirho = "/content-chirho/\(slugChirho)/\(chapterChirho)"
        case .mediaSummaryChirho: patternChirho = "/media-chirho/\(slugChirho)/summary-chirho\\.json"
        case .mediaChapterChirho: patternChirho = "/media-chirho/\(slugChirho)/\(chapterChirho)"
        // The website's own artwork rule; no dot can appear before the extension.
        case .artworkChirho: patternChirho = "/assets-chirho/[a-z0-9/-]+\\.webp"
        case .audioManifestChirho: patternChirho = "/audio-chirho/manifest-chirho\\.json"
        case .audioChapterChirho: patternChirho = "/audio-chirho/\(slugChirho)/\(chapterChirho)"
        case .audioClipChirho: patternChirho = "/audio-chirho/sha256-chirho/[a-f0-9]{64}-chirho\\.mp3"
        case .videoClipChirho: patternChirho = "/video-chirho/sha256-chirho/[a-f0-9]{64}-chirho\\.mp4"
        case .glossManifestChirho: patternChirho = "/glosses-chirho/es-chirho/manifest-chirho\\.json"
        case .glossLayerChirho: patternChirho = "/glosses-chirho/es-chirho/\(slugChirho)/\(chapterChirho)"
        }
        guard !pathChirho.contains("//"),
              let regexChirho = try? Regex("^\(patternChirho)$") else { return false }
        return pathChirho.wholeMatch(of: regexChirho) != nil
    }
}

/// The single trusted origin. Relative resource paths resolve only against it.
public enum OriginChirho {
    public static let baseChirho = "https://hinneh.us"

    /// An absolute URL for a root-relative path of the given kind, or nil when the path is not
    /// one the reader trusts (another host, a scheme, traversal, an unexpected shape).
    public static func urlChirho(_ pathChirho: String, _ kindChirho: ResourceKindChirho) -> URL? {
        guard pathChirho.unicodeScalars.allSatisfy(\.isASCII), kindChirho.matchesChirho(pathChirho),
              let urlChirho = URL(string: baseChirho + pathChirho),
              urlChirho.scheme == "https", urlChirho.host == "hinneh.us",
              urlChirho.path == pathChirho, urlChirho.query == nil, urlChirho.fragment == nil
        else { return nil }
        return urlChirho
    }
}
