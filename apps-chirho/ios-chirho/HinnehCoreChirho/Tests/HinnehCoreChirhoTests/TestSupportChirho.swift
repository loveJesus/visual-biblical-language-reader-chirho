// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import Foundation
@testable import HinnehCoreChirho

/// Serves fixed bodies by path and records every request, in order.
actor FakeTransportChirho: TransportChirho {
    private var bodiesChirho: [String: [Data]]
    private(set) var requestedChirho: [String] = []

    init(_ bodiesChirho: [String: [Data]] = [:]) {
        self.bodiesChirho = bodiesChirho
    }

    func setChirho(_ pathChirho: String, _ dataChirho: Data...) {
        bodiesChirho[pathChirho] = dataChirho
    }

    func getChirho(_ urlChirho: URL, limitChirho: Int) async throws -> Data {
        requestedChirho.append(urlChirho.path)
        guard var queueChirho = bodiesChirho[urlChirho.path], !queueChirho.isEmpty else {
            throw RemoteErrorChirho.statusChirho(404)
        }
        // Each body is served once; the last one keeps answering.
        let dataChirho = queueChirho.count > 1 ? queueChirho.removeFirst() : queueChirho[0]
        bodiesChirho[urlChirho.path] = queueChirho
        guard dataChirho.count <= limitChirho else { throw RemoteErrorChirho.tooLargeChirho }
        return dataChirho
    }
}

enum FixtureChirho {
    static func dataChirho(_ nameChirho: String) throws -> Data {
        guard let urlChirho = Bundle.module.url(
            forResource: nameChirho, withExtension: "json", subdirectory: "FixturesChirho")
        else { throw RemoteErrorChirho.invalidChirho("missing fixture \(nameChirho)") }
        return try Data(contentsOf: urlChirho)
    }

    static func objectChirho(_ nameChirho: String) throws -> Any {
        try JSONSerialization.jsonObject(with: dataChirho(nameChirho))
    }

    static func jsonChirho(_ valueChirho: Any) throws -> Data {
        try JSONSerialization.data(withJSONObject: valueChirho, options: [.sortedKeys])
    }

    static let booksChirho = BookListChirho.bundledChirho()

    static func bookChirho(_ idChirho: String) -> BookChirho {
        guard let bookChirho = booksChirho.bookChirho(idChirho) else { preconditionFailure(idChirho) }
        return bookChirho
    }

    /// A one-verse chapter and its manifest, served through the fake transport, as the publisher
    /// would lay them out. Returns the chapter bytes' hash.
    @discardableResult
    static func serveChapterChirho(_ transportChirho: FakeTransportChirho, _ bookIdChirho: String,
                                   _ chapterChirho: Int, _ verseChirho: Any, verseNumberChirho: Int) async throws
        -> String {
        let bookChirho = bookChirho(bookIdChirho)
        let chapterDataChirho = try jsonChirho([
            "book_id_chirho": bookIdChirho, "chapter_chirho": chapterChirho, "verses_chirho": [verseChirho]
        ] as [String: Any])
        let shaChirho = DigestChirho.sha256HexChirho(chapterDataChirho)
        let entriesChirho: [[String: Any]] = (1...bookChirho.chapterCountChirho).map { numberChirho in
            var entryChirho: [String: Any] = [
                "number_chirho": numberChirho, "verse_count_chirho": 1,
                "path_chirho": "/content-chirho/\(bookChirho.slugChirho)/" + bookChirho.chapterFileChirho(numberChirho),
                "sha256_chirho": numberChirho == chapterChirho ? shaChirho : String(repeating: "0", count: 64)
            ]
            if numberChirho == chapterChirho { entryChirho["verse_numbers_chirho"] = [verseNumberChirho] }
            return entryChirho
        }
        await transportChirho.setChirho(bookChirho.manifestPathChirho, try jsonChirho([
            "schema_version_chirho": 1, "book_id_chirho": bookIdChirho,
            "language_chirho": bookChirho.languageChirho, "chapters_chirho": entriesChirho
        ] as [String: Any]))
        await transportChirho.setChirho(
            "/content-chirho/\(bookChirho.slugChirho)/" + bookChirho.chapterFileChirho(chapterChirho), chapterDataChirho)
        return shaChirho
    }

    static func lessonChirho(_ nameChirho: String, _ bookIdChirho: String, _ chapterChirho: Int,
                             _ verseChirho: Int) async throws -> (VerseLessonChirho, VerifiedChapterChirho) {
        let transportChirho = FakeTransportChirho()
        try await serveChapterChirho(transportChirho, bookIdChirho, chapterChirho, objectChirho(nameChirho),
                                     verseNumberChirho: verseChirho)
        let clientChirho = ContentClientChirho(remoteChirho: RemoteChirho(transportChirho: transportChirho))
        let bookChirho = bookChirho(bookIdChirho)
        return (try await clientChirho.lessonChirho(bookChirho, chapterChirho, verseChirho),
                try await clientChirho.chapterChirho(bookChirho, chapterChirho))
    }
}
