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
    private let hasReadingKeysChirho: Bool

    enum CodingKeys: String, CodingKey {
        case lessonIdChirho, assetPathChirho, sha256Chirho, bytesChirho, durationChirho
        case widthChirho, heightChirho, sceneSha256Chirho, canonicalSha256Chirho
        case readingLanguageChirho, embeddedReadingChirho, attributionChirho
        case licenseChirho, licenseUrlChirho, reviewChirho
    }

    public init(from decoderChirho: any Decoder) throws {
        let fieldsChirho = try decoderChirho.container(keyedBy: CodingKeys.self)
        lessonIdChirho = try fieldsChirho.decode(String.self, forKey: .lessonIdChirho)
        assetPathChirho = try fieldsChirho.decode(String.self, forKey: .assetPathChirho)
        sha256Chirho = try fieldsChirho.decode(String.self, forKey: .sha256Chirho)
        bytesChirho = try fieldsChirho.decode(Int.self, forKey: .bytesChirho)
        durationChirho = try fieldsChirho.decode(Double.self, forKey: .durationChirho)
        widthChirho = try fieldsChirho.decode(Int.self, forKey: .widthChirho)
        heightChirho = try fieldsChirho.decode(Int.self, forKey: .heightChirho)
        sceneSha256Chirho = try fieldsChirho.decode(String.self, forKey: .sceneSha256Chirho)
        canonicalSha256Chirho = try fieldsChirho.decode(String.self, forKey: .canonicalSha256Chirho)
        readingLanguageChirho = try fieldsChirho.decodeIfPresent(String.self, forKey: .readingLanguageChirho)
        embeddedReadingChirho = try fieldsChirho.decodeIfPresent(HumanReadingSourceChirho.self, forKey: .embeddedReadingChirho)
        attributionChirho = try fieldsChirho.decode(String.self, forKey: .attributionChirho)
        licenseChirho = try fieldsChirho.decode(String.self, forKey: .licenseChirho)
        licenseUrlChirho = try fieldsChirho.decode(String.self, forKey: .licenseUrlChirho)
        reviewChirho = try fieldsChirho.decode(String.self, forKey: .reviewChirho)
        // Missing soundtrack information is not a declaration of silence. Keep the record
        // decodable so refusing its video never removes the valid still or word pictures.
        hasReadingKeysChirho = fieldsChirho.contains(.readingLanguageChirho)
            && fieldsChirho.contains(.embeddedReadingChirho)
    }

    public func encode(to encoderChirho: any Encoder) throws {
        var fieldsChirho = encoderChirho.container(keyedBy: CodingKeys.self)
        try fieldsChirho.encode(lessonIdChirho, forKey: .lessonIdChirho)
        try fieldsChirho.encode(assetPathChirho, forKey: .assetPathChirho)
        try fieldsChirho.encode(sha256Chirho, forKey: .sha256Chirho)
        try fieldsChirho.encode(bytesChirho, forKey: .bytesChirho)
        try fieldsChirho.encode(durationChirho, forKey: .durationChirho)
        try fieldsChirho.encode(widthChirho, forKey: .widthChirho)
        try fieldsChirho.encode(heightChirho, forKey: .heightChirho)
        try fieldsChirho.encode(sceneSha256Chirho, forKey: .sceneSha256Chirho)
        try fieldsChirho.encode(canonicalSha256Chirho, forKey: .canonicalSha256Chirho)
        try fieldsChirho.encode(readingLanguageChirho, forKey: .readingLanguageChirho)
        try fieldsChirho.encode(embeddedReadingChirho, forKey: .embeddedReadingChirho)
        try fieldsChirho.encode(attributionChirho, forKey: .attributionChirho)
        try fieldsChirho.encode(licenseChirho, forKey: .licenseChirho)
        try fieldsChirho.encode(licenseUrlChirho, forKey: .licenseUrlChirho)
        try fieldsChirho.encode(reviewChirho, forKey: .reviewChirho)
    }

    func validChirho(_ verseChirho: VerseDisplayChirho, _ sceneChirho: SceneRecordChirho) -> Bool {
        guard hasReadingKeysChirho, lessonIdChirho == verseChirho.idChirho,
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
