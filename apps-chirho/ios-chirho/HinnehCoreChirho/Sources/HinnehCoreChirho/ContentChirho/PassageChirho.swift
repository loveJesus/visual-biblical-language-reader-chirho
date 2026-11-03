// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import Foundation

/// A passage in the publisher's identity form, for example "Prov.26.1".
public struct PassageChirho: Hashable, Codable, Sendable {
    public let bookIdChirho: String
    public let chapterChirho: Int
    public let verseChirho: Int

    public init(bookIdChirho: String, chapterChirho: Int, verseChirho: Int) {
        self.bookIdChirho = bookIdChirho
        self.chapterChirho = chapterChirho
        self.verseChirho = verseChirho
    }

    public var idChirho: String { "\(bookIdChirho).\(chapterChirho).\(verseChirho)" }

    /// A fresh visit opens Proverbs at the chapter matching the reader's local day of the month.
    public static func dailyChirho(_ dateChirho: Date = Date(), calendarChirho: Calendar = .current)
        -> PassageChirho {
        PassageChirho(bookIdChirho: "Prov", chapterChirho: calendarChirho.component(.day, from: dateChirho),
                      verseChirho: 1)
    }

    /// A passage id such as "John.3.16", only for a known book and chapter.
    public static func parseChirho(_ textChirho: String, _ booksChirho: BookListChirho) -> PassageChirho? {
        let partsChirho = textChirho.split(separator: ".", omittingEmptySubsequences: false)
        guard partsChirho.count == 3, let bookChirho = booksChirho.bookChirho(String(partsChirho[0])),
              let chapterChirho = Int(partsChirho[1]), let verseChirho = Int(partsChirho[2]),
              (1...bookChirho.chapterCountChirho).contains(chapterChirho), (1...200).contains(verseChirho),
              String(chapterChirho) == partsChirho[1], String(verseChirho) == partsChirho[2]
        else { return nil }
        return PassageChirho(bookIdChirho: bookChirho.idChirho, chapterChirho: chapterChirho, verseChirho: verseChirho)
    }

    public func localizedReferenceChirho(_ booksChirho: BookListChirho, _ localeChirho: LocaleChirho) -> String {
        let labelChirho = booksChirho.bookChirho(bookIdChirho)?.labelChirho(localeChirho) ?? bookIdChirho
        return "\(labelChirho) \(chapterChirho):\(verseChirho)"
    }
}

/// Previous and next verse across chapter and book boundaries, honoring each edition's own
/// verse numbering (gaps are skipped, never invented).
public enum StepChirho: Sendable {
    case previousChirho
    case nextChirho
}

public extension ContentClientChirho {
    func neighbourChirho(_ passageChirho: PassageChirho, _ stepChirho: StepChirho, _ booksChirho: BookListChirho)
        async throws -> PassageChirho? {
        guard let bookChirho = booksChirho.bookChirho(passageChirho.bookIdChirho),
              let bookIndexChirho = booksChirho.booksChirho.firstIndex(of: bookChirho)
        else { return nil }
        let entriesChirho = try await chapterEntriesChirho(bookChirho)
        guard passageChirho.chapterChirho >= 1, passageChirho.chapterChirho <= entriesChirho.count else { return nil }
        let versesChirho = entriesChirho[passageChirho.chapterChirho - 1].versesChirho
        let positionChirho = versesChirho.firstIndex(of: passageChirho.verseChirho)
        switch stepChirho {
        case .nextChirho:
            if let positionChirho, positionChirho + 1 < versesChirho.count {
                return PassageChirho(bookIdChirho: bookChirho.idChirho, chapterChirho: passageChirho.chapterChirho,
                                     verseChirho: versesChirho[positionChirho + 1])
            }
            if passageChirho.chapterChirho < entriesChirho.count {
                return PassageChirho(bookIdChirho: bookChirho.idChirho, chapterChirho: passageChirho.chapterChirho + 1,
                                     verseChirho: entriesChirho[passageChirho.chapterChirho].versesChirho.first ?? 1)
            }
            guard bookIndexChirho + 1 < booksChirho.booksChirho.count else { return nil }
            let nextBookChirho = booksChirho.booksChirho[bookIndexChirho + 1]
            let firstChirho = try await chapterEntriesChirho(nextBookChirho).first?.versesChirho.first ?? 1
            return PassageChirho(bookIdChirho: nextBookChirho.idChirho, chapterChirho: 1, verseChirho: firstChirho)
        case .previousChirho:
            if let positionChirho, positionChirho > 0 {
                return PassageChirho(bookIdChirho: bookChirho.idChirho, chapterChirho: passageChirho.chapterChirho,
                                     verseChirho: versesChirho[positionChirho - 1])
            }
            if passageChirho.chapterChirho > 1 {
                let previousChirho = passageChirho.chapterChirho - 1
                return PassageChirho(bookIdChirho: bookChirho.idChirho, chapterChirho: previousChirho,
                                     verseChirho: entriesChirho[previousChirho - 1].versesChirho.last ?? 1)
            }
            guard bookIndexChirho > 0 else { return nil }
            let previousBookChirho = booksChirho.booksChirho[bookIndexChirho - 1]
            let previousEntriesChirho = try await chapterEntriesChirho(previousBookChirho)
            return PassageChirho(bookIdChirho: previousBookChirho.idChirho, chapterChirho: previousEntriesChirho.count,
                                 verseChirho: previousEntriesChirho.last?.versesChirho.last ?? 1)
        }
    }
}
