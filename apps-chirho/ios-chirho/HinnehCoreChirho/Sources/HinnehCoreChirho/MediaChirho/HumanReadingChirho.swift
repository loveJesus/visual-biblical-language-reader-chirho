// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import Foundation

/// Original recording provenance stays independent of the scene or any future translated track.
public struct HumanReadingSourceChirho: Codable, Sendable, Hashable {
    public let kindChirho: String
    public let readerIdChirho: String
    public let gbtIdChirho: String
    public let packageSha256Chirho: String
    public let chapterSha256Chirho: String
    public let timingsSha256Chirho: String
    public let startChirho: Double
    public let endChirho: Double
    public let chapterDurationChirho: Double
    public let attributionChirho: String
    public let licenseChirho: String
    public let licenseUrlChirho: String

    public static let beeriAttributionChirho = "Hebrew reading by Rabbi Dan Be'eri (CC BY-SA 3.0), compiled at archive.org; chapter files and verse timings from Global Bible Tools"
    public static let beeriLicenseUrlChirho = "https://creativecommons.org/licenses/by-sa/3.0/"
    private static let bookIdsChirho = [
        "Gen": "Gen", "Exod": "Exo", "Lev": "Lev", "Num": "Num", "Deut": "Deu",
        "Josh": "Jos", "Judg": "Jdg", "Ruth": "Rut", "1Sam": "1Sa", "2Sam": "2Sa",
        "1Kgs": "1Ki", "2Kgs": "2Ki", "Ezra": "Ezr", "Esth": "Est", "Job": "Job",
        "Ps": "Psa", "Prov": "Pro", "Eccl": "Ecc", "Song": "Sng", "Isa": "Isa",
        "Lam": "Lam", "Dan": "Dan", "Obad": "Oba", "Jonah": "Jon", "Nah": "Nam",
        "Hab": "Hab", "Zeph": "Zep", "Hag": "Hag", "Zech": "Zec", "Mal": "Mal"
    ]

    func validSourceChirho(_ lessonIdChirho: String) -> Bool {
        let bookChirho = String(lessonIdChirho.split(separator: ".").first ?? "")
        guard let sourceBookChirho = Self.bookIdsChirho[bookChirho] else { return false }
        return kindChirho == "human" && readerIdChirho == "rdb-chirho"
            && gbtIdChirho == "OT/RDB/\(sourceBookChirho)"
            && [packageSha256Chirho, chapterSha256Chirho, timingsSha256Chirho].allSatisfy(DigestChirho.isHexChirho)
            && startChirho.isFinite && endChirho.isFinite && chapterDurationChirho.isFinite
            && startChirho >= 0 && startChirho < endChirho && endChirho <= chapterDurationChirho
            && endChirho - startChirho <= 120 && chapterDurationChirho <= 7200
            && attributionChirho == Self.beeriAttributionChirho && licenseChirho == "CC BY-SA 3.0"
            && licenseUrlChirho == Self.beeriLicenseUrlChirho
    }

    func validChirho(_ clipChirho: ClipChirho) -> Bool {
        validSourceChirho(clipChirho.lessonIdChirho)
            && abs(clipChirho.durationChirho - (endChirho - startChirho)) <= 0.15
            && clipChirho.tokenIdChirho == nil && clipChirho.languageChirho == "he"
            && clipChirho.pronunciationChirho == "israeli_hebrew" && clipChirho.voiceNameChirho == "Rabbi Dan Be'eri"
            && clipChirho.recipeIdChirho == nil && clipChirho.ipaChirho == nil && clipChirho.synthesisTextChirho == nil
            && clipChirho.startOffsetChirho == nil && clipChirho.endOffsetChirho == nil
    }
}
