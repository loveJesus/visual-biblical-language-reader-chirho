// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: hosting-chirho/native-readers-chirho.md. Offline contract check through the real client.
import Foundation
import Testing
@testable import HinnehCoreChirho

private struct CorpusTransportChirho: TransportChirho {
    let rootChirho: URL

    func getChirho(_ urlChirho: URL, limitChirho: Int) async throws -> Data {
        try Task.checkCancellation()
        let fileChirho = rootChirho.appendingPathComponent(String(urlChirho.path.dropFirst()))
            .standardizedFileURL
        guard fileChirho.path.hasPrefix(rootChirho.standardizedFileURL.path + "/") else {
            throw RemoteErrorChirho.untrustedPathChirho
        }
        let dataChirho = try Data(contentsOf: fileChirho)
        guard dataChirho.count <= limitChirho else { throw RemoteErrorChirho.tooLargeChirho }
        return dataChirho
    }
}

/// Set HINNEH_STATIC_ROOT_CHIRHO to the repository's static directory. This never uses the network,
/// rewrites source files, or infers verse presence from a count rather than the edition's manifest.
@Suite(.enabled(if: ProcessInfo.processInfo.environment["HINNEH_STATIC_ROOT_CHIRHO"] != nil))
struct CorpusTestsChirho {
    @Test func everyPublishedVerseValidatesAndPreservesItsVisibleSourceChirho() async throws {
        let pathChirho = try #require(ProcessInfo.processInfo.environment["HINNEH_STATIC_ROOT_CHIRHO"])
        let rootChirho = URL(fileURLWithPath: pathChirho, isDirectory: true).standardizedFileURL
        let clientChirho = ContentClientChirho(remoteChirho: RemoteChirho(
            transportChirho: CorpusTransportChirho(rootChirho: rootChirho)))
        var expectedChirho = 0
        var checkedChirho = 0
        var failuresChirho: [String] = []
        let booksChirho = BookListChirho.bundledChirho().booksChirho
        for bookChirho in booksChirho {
            let entriesChirho = try await clientChirho.chapterEntriesChirho(bookChirho)
            for entryChirho in entriesChirho {
                expectedChirho += entryChirho.versesChirho.count
                do {
                    let chapterChirho = try await clientChirho.chapterChirho(bookChirho, entryChirho.numberChirho)
                    for numberChirho in entryChirho.versesChirho {
                        let idChirho = "\(bookChirho.idChirho).\(entryChirho.numberChirho).\(numberChirho)"
                        do {
                            let verseChirho = VerseDisplayChirho(try chapterChirho.lessonChirho(numberChirho))
                            let shownChirho = verseChirho.wordsChirho.map(\.surfaceChirho).joined()
                            let originalChirho = verseChirho.canonicalTextChirho.unicodeScalars
                                .filter { !$0.properties.isWhitespace }
                            let visibleChirho = shownChirho.unicodeScalars
                                .filter { !$0.properties.isWhitespace }
                            guard !verseChirho.wordsChirho.isEmpty,
                                  originalChirho.elementsEqual(visibleChirho) else {
                                throw RemoteErrorChirho.invalidChirho("visible source order")
                            }
                            checkedChirho += 1
                        } catch {
                            failuresChirho.append("\(idChirho): \(error)")
                        }
                    }
                } catch {
                    failuresChirho.append("\(bookChirho.idChirho).\(entryChirho.numberChirho): \(error)")
                }
            }
        }
        print("iOS corpus contract: \(booksChirho.count) books; \(checkedChirho)/\(expectedChirho) verses; \(failuresChirho.count) failures")
        #expect(failuresChirho.isEmpty, "\(failuresChirho.prefix(12).joined(separator: "\n"))")
        #expect(checkedChirho == expectedChirho && expectedChirho > 0)
    }
}
