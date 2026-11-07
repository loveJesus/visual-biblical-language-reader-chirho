// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import Foundation

/// One published visual, separately bound to its scene, canonical verse and embedded reading.
public struct VerseVideoChirho: Codable, Sendable, Hashable {
    public let lessonIdChirho: String
    public let assetPathChirho: String
    public let sha256Chirho: String
    public let bytesChirho: Int
    public let durationChirho: Double
    public let widthChirho: Int
    public let heightChirho: Int
    public let sceneSha256Chirho: String
    public let canonicalSha256Chirho: String
    public let readingLanguageChirho: String?
    public let embeddedReadingChirho: HumanReadingSourceChirho?
    public let attributionChirho: String
    public let licenseChirho: String
    public let licenseUrlChirho: String
    public let reviewChirho: String

    func validChirho(_ verseChirho: VerseDisplayChirho, _ sceneChirho: SceneRecordChirho) -> Bool {
        guard lessonIdChirho == verseChirho.idChirho,
              canonicalSha256Chirho == DigestChirho.sha256HexChirho(verseChirho.canonicalTextChirho),
              sceneSha256Chirho == sceneChirho.sha256Chirho,
              DigestChirho.isHexChirho(sha256Chirho),
              assetPathChirho == "/video-chirho/sha256-chirho/\(sha256Chirho)-chirho.mp4",
              OriginChirho.urlChirho(assetPathChirho, .videoClipChirho) != nil,
              (1...ResourceKindChirho.videoClipChirho.limitChirho).contains(bytesChirho),
              durationChirho.isFinite, durationChirho > 0, durationChirho <= 120,
              (1...4096).contains(widthChirho), (1...4096).contains(heightChirho),
              ["pending", "approved"].contains(reviewChirho),
              !attributionChirho.trimmingCharacters(in: .whitespaces).isEmpty, attributionChirho.count <= 1000
        else { return false }
        guard let sourceChirho = embeddedReadingChirho else {
            return readingLanguageChirho == nil && licenseChirho == "CC0"
                && licenseUrlChirho == "https://creativecommons.org/publicdomain/zero/1.0/"
        }
        return sourceChirho.validSourceChirho(lessonIdChirho) && readingLanguageChirho == "he"
            && abs(durationChirho - (sourceChirho.endChirho - sourceChirho.startChirho)) <= 0.3
            && licenseChirho == "CC BY-SA 3.0" && licenseUrlChirho == HumanReadingSourceChirho.beeriLicenseUrlChirho
    }

    public func carriesChirho(_ clipChirho: ClipChirho) -> Bool {
        guard let embeddedChirho = embeddedReadingChirho, let sourceChirho = clipChirho.readingSourceChirho,
              sourceChirho.validChirho(clipChirho), lessonIdChirho == clipChirho.lessonIdChirho,
              canonicalSha256Chirho == clipChirho.canonicalSha256Chirho
        else { return false }
        return embeddedChirho.readerIdChirho == sourceChirho.readerIdChirho
            && embeddedChirho.gbtIdChirho == sourceChirho.gbtIdChirho
            && embeddedChirho.packageSha256Chirho == sourceChirho.packageSha256Chirho
            && embeddedChirho.chapterSha256Chirho == sourceChirho.chapterSha256Chirho
            && embeddedChirho.timingsSha256Chirho == sourceChirho.timingsSha256Chirho
            && abs(embeddedChirho.startChirho - sourceChirho.startChirho) <= 0.3
            && abs(embeddedChirho.endChirho - sourceChirho.endChirho) <= 0.3
    }
}
