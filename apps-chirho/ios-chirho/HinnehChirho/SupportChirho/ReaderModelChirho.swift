// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import Foundation
import HinnehCoreChirho
import Observation

/// The reader's state for one passage. Text comes first and alone decides success; scene, word
/// pictures, recordings and Spanish meanings load beside it and may each be unavailable.
@MainActor @Observable
final class ReaderModelChirho {
    enum PhaseChirho: Equatable {
        case loadingChirho
        case readyChirho
        case failedChirho
    }

    private(set) var booksChirho = BookListChirho.bundledChirho()
    private(set) var passageChirho: PassageChirho
    private(set) var phaseChirho = PhaseChirho.loadingChirho
    private(set) var verseChirho: VerseDisplayChirho?
    private(set) var mediaChirho = VerseMediaChirho.emptyChirho
    private(set) var mediaFailedChirho = false
    private(set) var audioChirho = VerseAudioChirho.emptyChirho
    private(set) var spanishChirho: SpanishGlossesChirho?
    /// The Greek pronunciation for playback; it persists independently of the interface language.
    var greekRenditionChirho: GreekRenditionChirho {
        didSet {
            UserDefaults.standard.set(greekRenditionChirho.rawValue, forKey: Self.renditionKeyChirho)
            reselectAudioChirho()
        }
    }
    var localeChirho: LocaleChirho {
        didSet {
            UserDefaults.standard.set(localeChirho.rawValue, forKey: Self.localeKeyChirho)
            if localeChirho == .spanishChirho, spanishChirho == nil { loadSpanishChirho() }
        }
    }

    let remoteChirho: RemoteChirho
    let playerChirho: AudioPlayerChirho
    let artworkChirho: ArtworkStoreChirho
    private let contentChirho: ContentClientChirho
    private let mediaClientChirho: MediaClientChirho
    private let audioClientChirho: AudioClientChirho
    private let glossClientChirho: GlossClientChirho
    private var chapterChirho: VerifiedChapterChirho?
    private var loadTaskChirho: Task<Void, Never>?
    private var spanishTaskChirho: Task<Void, Never>?

    static let localeKeyChirho = "hinneh-locale-chirho"
    static let renditionKeyChirho = "hinneh-greek-rendition-chirho"

    init(passageChirho: PassageChirho = .dailyChirho(), remoteChirho: RemoteChirho = RemoteChirho(
        transportChirho: URLSessionTransportChirho(cacheDirectoryChirho: ReaderModelChirho.cacheDirectoryChirho))) {
        self.passageChirho = passageChirho
        self.remoteChirho = remoteChirho
        let storedChirho = UserDefaults.standard.string(forKey: Self.localeKeyChirho).flatMap(LocaleChirho.init)
        localeChirho = storedChirho ?? .preferredChirho()
        greekRenditionChirho = UserDefaults.standard.string(forKey: Self.renditionKeyChirho)
            .flatMap(GreekRenditionChirho.init) ?? .modernAspiratesChirho
        playerChirho = AudioPlayerChirho(remoteChirho: remoteChirho)
        artworkChirho = ArtworkStoreChirho(remoteChirho: remoteChirho)
        contentChirho = ContentClientChirho(remoteChirho: remoteChirho)
        mediaClientChirho = MediaClientChirho(remoteChirho: remoteChirho)
        audioClientChirho = AudioClientChirho(remoteChirho: remoteChirho)
        glossClientChirho = GlossClientChirho(remoteChirho: remoteChirho)
    }

    private static let cacheDirectoryChirho = FileManager.default
        .urls(for: .cachesDirectory, in: .userDomainMask).first?
        .appendingPathComponent("hinneh-cache-chirho", isDirectory: true)

    var messagesChirho: MessagesChirho { .forChirho(localeChirho) }

    var referenceChirho: String { passageChirho.localizedReferenceChirho(booksChirho, localeChirho) }

    var bookChirho: BookChirho? { booksChirho.bookChirho(passageChirho.bookIdChirho) }

    /// Refreshes the book identities from the public bootstrap, keeping the bundled ones otherwise.
    func refreshBooksChirho() async {
        booksChirho = await BookListChirho.loadChirho(remoteChirho)
    }

    /// Opens a passage, cancelling every request and recording still running for the last one.
    func openChirho(_ nextChirho: PassageChirho) {
        loadTaskChirho?.cancel()
        spanishTaskChirho?.cancel()
        playerChirho.stopChirho()
        passageChirho = nextChirho
        phaseChirho = .loadingChirho
        verseChirho = nil
        mediaChirho = .emptyChirho
        mediaFailedChirho = false
        audioChirho = .emptyChirho
        spanishChirho = nil
        loadTaskChirho = Task { await loadChirho(nextChirho) }
    }

    func retryChirho() { openChirho(passageChirho) }

    /// Current original-language baseline uses one embedded soundtrack/clock. A different selected
    /// reading keeps the still until a separately reviewed replacement pair is available.
    func toggleVerseChirho() {
        if playerChirho.activeIdChirho == "verse" { playerChirho.stopChirho(); return }
        let clipChirho = audioChirho.verseClipChirho
        if let videoChirho = mediaChirho.videoChirho,
           clipChirho.map(videoChirho.carriesChirho) ?? true {
            playerChirho.playVideoChirho(videoChirho)
        } else if let clipChirho { playerChirho.playChirho(clipChirho, idChirho: "verse") }
    }

    func stepChirho(_ stepChirho: StepChirho) async {
        guard let nextChirho = try? await contentChirho.neighbourChirho(passageChirho, stepChirho, booksChirho)
        else { return }
        openChirho(nextChirho)
    }

    /// The verses this edition has in a chapter, for the passage chooser.
    func versesChirho(_ bookChirho: BookChirho, _ chapterChirho: Int) async -> [Int] {
        guard let entriesChirho = try? await contentChirho.chapterEntriesChirho(bookChirho),
              entriesChirho.indices.contains(chapterChirho - 1)
        else { return [] }
        return entriesChirho[chapterChirho - 1].versesChirho
    }

    private func loadChirho(_ targetChirho: PassageChirho) async {
        guard let bookChirho = booksChirho.bookChirho(targetChirho.bookIdChirho) else {
            phaseChirho = .failedChirho
            return
        }
        let verifiedChirho: VerifiedChapterChirho
        let verseValueChirho: VerseDisplayChirho
        do {
            verifiedChirho = try await contentChirho.chapterChirho(bookChirho, targetChirho.chapterChirho)
            verseValueChirho = VerseDisplayChirho(try verifiedChirho.lessonChirho(targetChirho.verseChirho))
        } catch {
            if !Task.isCancelled { phaseChirho = .failedChirho }
            return
        }
        guard !Task.isCancelled else { return }
        chapterChirho = verifiedChirho
        verseChirho = verseValueChirho
        phaseChirho = .readyChirho
        if localeChirho == .spanishChirho { loadSpanishChirho() }
        // Recordings are chosen for the rendition in force now; a later choice re-selects them.
        let renditionChirho = greekRenditionChirho
        async let mediaValueChirho = try? mediaClientChirho.verseMediaChirho(
            bookChirho, targetChirho.chapterChirho, verseValueChirho)
        async let audioValueChirho = try? audioClientChirho.verseAudioChirho(
            verifiedChirho, verseValueChirho, renditionChirho)
        let mediaResultChirho = await mediaValueChirho
        let audioResultChirho = await audioValueChirho
        guard !Task.isCancelled, passageChirho == targetChirho else { return }
        mediaChirho = mediaResultChirho ?? .emptyChirho
        mediaFailedChirho = mediaResultChirho == nil
        if greekRenditionChirho == renditionChirho {
            audioChirho = audioResultChirho ?? .emptyChirho
        }
    }

    /// A new Greek rendition re-selects recordings from the already verified catalogue.
    private func reselectAudioChirho() {
        playerChirho.stopChirho()
        guard let chapterValueChirho = chapterChirho, let verseValueChirho = verseChirho else { return }
        let targetChirho = passageChirho
        let renditionChirho = greekRenditionChirho
        Task {
            let resultChirho = try? await audioClientChirho.verseAudioChirho(
                chapterValueChirho, verseValueChirho, renditionChirho)
            guard passageChirho == targetChirho, greekRenditionChirho == renditionChirho else { return }
            audioChirho = resultChirho ?? .emptyChirho
        }
    }

    private func loadSpanishChirho() {
        guard let chapterValueChirho = chapterChirho, verseChirho != nil else { return }
        spanishTaskChirho?.cancel()
        let targetChirho = passageChirho
        spanishTaskChirho = Task {
            let resultChirho = try? await glossClientChirho.spanishChirho(chapterValueChirho)
            guard !Task.isCancelled, passageChirho == targetChirho else { return }
            spanishChirho = resultChirho ?? .absentChirho
        }
    }
}
