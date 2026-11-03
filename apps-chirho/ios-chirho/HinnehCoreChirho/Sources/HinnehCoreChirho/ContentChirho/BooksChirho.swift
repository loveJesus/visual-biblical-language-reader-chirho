// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import Foundation

public enum ScriptChirho: String, Sendable, Codable {
    case hebrewChirho = "he"
    case greekChirho = "grc"
}

/// One book's identity in the public registry. No text is bundled; only the identities are.
public struct BookChirho: Codable, Sendable, Hashable, Identifiable {
    public let idChirho: String
    public let labelChirho: String
    public let spanishLabelChirho: String
    public let slugChirho: String
    public let languageChirho: String
    public let testamentChirho: String
    public let chapterCountChirho: Int
    public let featuredChirho: Bool

    public var id: String { idChirho }
    public var scriptChirho: ScriptChirho { languageChirho == "grc" ? .greekChirho : .hebrewChirho }
    public var isNewTestamentChirho: Bool { testamentChirho == "new" }

    public func labelChirho(_ localeChirho: LocaleChirho) -> String {
        localeChirho == .spanishChirho ? spanishLabelChirho : labelChirho
    }

    var manifestPathChirho: String { "/content-chirho/\(slugChirho)/manifest-chirho.json" }

    func chapterFileChirho(_ numberChirho: Int) -> String {
        "chapter-\(numberChirho < 10 ? "0" : "")\(numberChirho)-chirho.json"
    }
}

struct BookListPayloadChirho: Decodable {
    let schemaVersionChirho: Int
    let booksChirho: [BookChirho]
}

/// The verified book list: the public bootstrap when it validates, else the bundled identities.
public struct BookListChirho: Sendable {
    public let booksChirho: [BookChirho]
    private let indexChirho: [String: BookChirho]

    init(validatingChirho payloadChirho: BookListPayloadChirho) throws {
        guard payloadChirho.schemaVersionChirho == 1, (1...100).contains(payloadChirho.booksChirho.count)
        else { throw RemoteErrorChirho.invalidChirho("book list") }
        var idsChirho = Set<String>()
        var slugsChirho = Set<String>()
        for bookChirho in payloadChirho.booksChirho {
            guard bookChirho.idChirho.wholeMatch(of: /[1-3]?[A-Za-z]+/) != nil,
                  bookChirho.slugChirho.wholeMatch(of: /[a-z0-9]+(?:-[a-z0-9]+)*-chirho/) != nil,
                  ["he", "grc"].contains(bookChirho.languageChirho),
                  ["old", "new"].contains(bookChirho.testamentChirho),
                  (1...150).contains(bookChirho.chapterCountChirho),
                  !bookChirho.labelChirho.trimmingCharacters(in: .whitespaces).isEmpty,
                  !bookChirho.spanishLabelChirho.trimmingCharacters(in: .whitespaces).isEmpty,
                  idsChirho.insert(bookChirho.idChirho).inserted,
                  slugsChirho.insert(bookChirho.slugChirho).inserted
            else { throw RemoteErrorChirho.invalidChirho("book identity") }
        }
        booksChirho = payloadChirho.booksChirho
        indexChirho = Dictionary(uniqueKeysWithValues: booksChirho.map { ($0.idChirho, $0) })
    }

    public func bookChirho(_ idChirho: String) -> BookChirho? { indexChirho[idChirho] }

    /// The identities shipped with the app, copied from the website registry.
    public static func bundledChirho() -> BookListChirho {
        guard let urlChirho = Bundle.module.url(
            forResource: "books-fallback-chirho", withExtension: "json"),
              let dataChirho = try? Data(contentsOf: urlChirho),
              let payloadChirho = try? DecodingChirho.decodeChirho(BookListPayloadChirho.self, dataChirho),
              let listChirho = try? BookListChirho(validatingChirho: payloadChirho)
        else { preconditionFailure("The bundled book identities are part of the app build.") }
        return listChirho
    }

    /// The live bootstrap when it is published and valid; otherwise the bundled identities.
    public static func loadChirho(_ remoteChirho: RemoteChirho) async -> BookListChirho {
        do {
            let dataChirho = try await remoteChirho.dataChirho(
                "/library-chirho/books-chirho.json", .bookListChirho)
            return try BookListChirho(
                validatingChirho: DecodingChirho.decodeChirho(BookListPayloadChirho.self, dataChirho))
        } catch {
            return bundledChirho()
        }
    }
}
