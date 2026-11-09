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
    private(set) var previousPassageChirho: PassageChirho?
    private(set) var nextPassageChirho: PassageChirho?
    var playbackSpeedChirho: PlaybackSpeedChirho {
        didSet {
            defaultsChirho.set(playbackSpeedChirho.rawValue, forKey: Self.speedKeyChirho)
            playerChirho.speedChirho = playbackSpeedChirho
        }
    }
    /// The Greek pronunciation for playback; it persists independently of the interface language.
    var greekRenditionChirho: GreekRenditionChirho {
        didSet {
            if selectingAutomaticallyChirho { return }
            hasRenditionPreferenceChirho = true
            defaultsChirho.set(greekRenditionChirho.rawValue, forKey: Self.renditionKeyChirho)
            reselectAudioChirho()
        }
    }
    var localeChirho: LocaleChirho {
        didSet {
            defaultsChirho.set(localeChirho.rawValue, forKey: Self.localeKeyChirho)
            if localeChirho == .spanishChirho, spanishChirho == nil { loadSpanishChirho() }
        }
    }

    let sessionChirho: ReaderSessionChirho
    @ObservationIgnored private let defaultsChirho: UserDefaults
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
    private var navigationTaskChirho: Task<Void, Never>?
    private var audioTaskChirho: Task<Void, Never>?
    private var audioSelectionIdChirho = UUID()
    private var selectingAutomaticallyChirho = false
    private var hasRenditionPreferenceChirho: Bool

    static let localeKeyChirho = "hinneh-locale-chirho"
    static let renditionKeyChirho = "hinneh-greek-rendition-chirho"
    static let speedKeyChirho = "hinneh-playback-speed-chirho"

    init(passageChirho: PassageChirho = .dailyChirho(), remoteChirho: RemoteChirho = RemoteChirho(
        transportChirho: URLSessionTransportChirho(cacheDirectoryChirho: ReaderModelChirho.cacheDirectoryChirho)),
         defaultsChirho: UserDefaults = .standard) {
        self.passageChirho = passageChirho
        self.remoteChirho = remoteChirho
        self.defaultsChirho = defaultsChirho
        sessionChirho = ReaderSessionChirho(defaultsChirho: defaultsChirho)
        let storedChirho = defaultsChirho.string(forKey: Self.localeKeyChirho).flatMap(LocaleChirho.init)
        localeChirho = storedChirho ?? .preferredChirho()
        let renditionChirho = defaultsChirho.string(forKey: Self.renditionKeyChirho)
            .flatMap(GreekRenditionChirho.init)
        greekRenditionChirho = renditionChirho ?? .modernAspiratesChirho
        hasRenditionPreferenceChirho = renditionChirho != nil
        playbackSpeedChirho = defaultsChirho.string(forKey: Self.speedKeyChirho)
            .flatMap(PlaybackSpeedChirho.init) ?? .normalChirho
        playerChirho = AudioPlayerChirho(remoteChirho: remoteChirho)
        artworkChirho = ArtworkStoreChirho(remoteChirho: remoteChirho)
        contentChirho = ContentClientChirho(remoteChirho: remoteChirho)
        mediaClientChirho = MediaClientChirho(remoteChirho: remoteChirho)
        audioClientChirho = AudioClientChirho(remoteChirho: remoteChirho)
        glossClientChirho = GlossClientChirho(remoteChirho: remoteChirho)
        playerChirho.speedChirho = playbackSpeedChirho
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

    /// A single cold launch chooses its passage before loading. Foreground activation never calls it again.
    func launchChirho(requestedChirho: String? = nil,
                      versionChirho: String = Bundle.main.object(forInfoDictionaryKey: "CFBundleShortVersionString") as? String ?? "") async {
        let requestedPassageChirho = (requestedChirho ?? defaultsChirho.string(forKey: "hinneh-open-chirho"))
            .flatMap { PassageChirho.parseChirho($0, booksChirho) }
        guard let launchPassageChirho = sessionChirho.launchChirho(
            requestedChirho: requestedPassageChirho, booksChirho: booksChirho, versionChirho: versionChirho)
        else { return }
        openChirho(launchPassageChirho, reasonChirho: .launchChirho)
        await refreshBooksChirho()
    }

    func openLinkChirho(_ urlChirho: URL) async {
        guard let linkedChirho = ReaderSessionChirho.linkedPassageChirho(urlChirho, booksChirho: booksChirho)
        else { return }
        if !sessionChirho.startedChirho { await launchChirho(requestedChirho: linkedChirho.idChirho) }
        else { openChirho(linkedChirho, reasonChirho: .deepLinkChirho) }
    }

    func pauseChirho() {
        sessionChirho.cancelAutoplayChirho()
        playerChirho.stopChirho()
    }

    /// Opens a passage, cancelling every request and recording still running for the last one.
    func openChirho(_ nextChirho: PassageChirho, reasonChirho: PassageOpenReasonChirho = .navigationChirho) {
        let intentChirho = sessionChirho.beginOpenChirho(reasonChirho, changedChirho: passageChirho != nextChirho)
        loadTaskChirho?.cancel()
        spanishTaskChirho?.cancel()
        navigationTaskChirho?.cancel()
        audioTaskChirho?.cancel()
        audioSelectionIdChirho = UUID()
        playerChirho.stopChirho()
        playerChirho.clearFailureChirho()
        passageChirho = nextChirho
        phaseChirho = .loadingChirho
        verseChirho = nil
        mediaChirho = .emptyChirho
        mediaFailedChirho = false
        audioChirho = .emptyChirho
        spanishChirho = nil
        chapterChirho = nil
        previousPassageChirho = nil
        nextPassageChirho = nil
        navigationTaskChirho = Task {
            async let previousChirho = try? contentChirho.neighbourChirho(nextChirho, .previousChirho, booksChirho)
            async let followingChirho = try? contentChirho.neighbourChirho(nextChirho, .nextChirho, booksChirho)
            let neighboursChirho = await (previousChirho, followingChirho)
            guard !Task.isCancelled, passageChirho == nextChirho else { return }
            previousPassageChirho = neighboursChirho.0
            nextPassageChirho = neighboursChirho.1
        }
        loadTaskChirho = Task { await loadChirho(nextChirho, intentChirho: intentChirho) }
    }

    func retryChirho() { openChirho(passageChirho, reasonChirho: .retryChirho) }

    /// Current original-language baseline uses one embedded soundtrack/clock. A different selected
    /// reading keeps the still until a separately reviewed replacement pair is available.
    func toggleVerseChirho() {
        sessionChirho.cancelAutoplayChirho()
        if playerChirho.activeIdChirho == "verse" { playerChirho.stopChirho(); return }
        playPreferredVerseChirho()
    }

    /// The displayed Play label and actual player share this verified, failure-aware choice.
    var preferredVerseVideoChirho: VerseVideoChirho? {
        guard let videoChirho = mediaChirho.videoChirho,
              playerChirho.failedVideoShaChirho != videoChirho.sha256Chirho,
              audioChirho.verseClipChirho.map(videoChirho.carriesChirho) ?? true else { return nil }
        return videoChirho
    }

    var versePlayLabelChirho: String {
        preferredVerseVideoChirho != nil ? messagesChirho.playVerseVideoChirho : messagesChirho.playVerseChirho
    }

    /// Manual and opted-in navigation playback share the same verified clip/video choice.
    private func playPreferredVerseChirho() {
        if let videoChirho = preferredVerseVideoChirho { playerChirho.playVideoChirho(videoChirho) }
        else if let clipChirho = audioChirho.verseClipChirho { playerChirho.playChirho(clipChirho, idChirho: "verse") }
    }

    func stepChirho(_ stepChirho: StepChirho) async {
        let nextChirho: PassageChirho?
        switch stepChirho {
        case .previousChirho: nextChirho = previousPassageChirho
        case .nextChirho: nextChirho = nextPassageChirho
        }
        guard let nextChirho else { return }
        openChirho(nextChirho)
    }

    /// The verses this edition has in a chapter, for the passage chooser.
    func versesChirho(_ bookChirho: BookChirho, _ chapterChirho: Int) async -> [Int] {
        guard let entriesChirho = try? await contentChirho.chapterEntriesChirho(bookChirho),
              entriesChirho.indices.contains(chapterChirho - 1)
        else { return [] }
        return entriesChirho[chapterChirho - 1].versesChirho
    }

    private func loadChirho(_ targetChirho: PassageChirho, intentChirho: UUID) async {
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
        sessionChirho.rememberChirho(targetChirho)
        phaseChirho = .readyChirho
        if localeChirho == .spanishChirho { loadSpanishChirho() }
        // Recordings are chosen for the rendition in force now; a later choice re-selects them.
        let initialRenditionChirho = greekRenditionChirho
        let selectionIdChirho = audioSelectionIdChirho
        let automaticChirho = !hasRenditionPreferenceChirho
        let renditionChirho = automaticChirho ? .modernAspiratesChirho : greekRenditionChirho
        async let mediaValueChirho = try? mediaClientChirho.verseMediaChirho(
            bookChirho, targetChirho.chapterChirho, verseValueChirho)
        async let audioValueChirho = try? audioClientChirho.verseAudioChirho(
            verifiedChirho, verseValueChirho, renditionChirho)
        let mediaResultChirho = await mediaValueChirho
        var audioResultChirho = await audioValueChirho
        var chosenRenditionChirho = renditionChirho
        if automaticChirho, verseValueChirho.scriptChirho == .greekChirho,
           audioResultChirho?.verseClipChirho == nil {
            let modernChirho = try? await audioClientChirho.verseAudioChirho(
                verifiedChirho, verseValueChirho, .modernChirho)
            if modernChirho?.verseClipChirho != nil {
                audioResultChirho = modernChirho
                chosenRenditionChirho = .modernChirho
            }
        }
        guard !Task.isCancelled, passageChirho == targetChirho else { return }
        mediaChirho = mediaResultChirho ?? .emptyChirho
        mediaFailedChirho = mediaResultChirho == nil
        if audioSelectionIdChirho == selectionIdChirho,
           greekRenditionChirho == initialRenditionChirho,
           !automaticChirho || !hasRenditionPreferenceChirho {
            selectingAutomaticallyChirho = true
            greekRenditionChirho = chosenRenditionChirho
            selectingAutomaticallyChirho = false
            audioChirho = audioResultChirho ?? .emptyChirho
            if sessionChirho.consumeAutoplayChirho(intentChirho) { playPreferredVerseChirho() }
        }
    }

    /// A new Greek rendition re-selects recordings from the already verified catalogue.
    private func reselectAudioChirho() {
        sessionChirho.cancelAutoplayChirho()
        playerChirho.stopChirho()
        audioTaskChirho?.cancel()
        let selectionIdChirho = UUID()
        audioSelectionIdChirho = selectionIdChirho
        audioChirho = .emptyChirho
        guard let chapterValueChirho = chapterChirho, let verseValueChirho = verseChirho else { return }
        let targetChirho = passageChirho
        let renditionChirho = greekRenditionChirho
        audioTaskChirho = Task {
            let resultChirho = try? await audioClientChirho.verseAudioChirho(
                chapterValueChirho, verseValueChirho, renditionChirho)
            guard !Task.isCancelled, audioSelectionIdChirho == selectionIdChirho,
                  passageChirho == targetChirho, greekRenditionChirho == renditionChirho else { return }
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
