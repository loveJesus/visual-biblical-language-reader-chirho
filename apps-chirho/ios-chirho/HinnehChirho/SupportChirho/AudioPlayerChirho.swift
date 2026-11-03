// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import AVFoundation
import Foundation
import HinnehCoreChirho
import Observation

/// Plays one published recording at a time. The MP3 is fully downloaded and its SHA-256 checked
/// before it plays; a word plays complete, untrimmed, to its natural end. Greek plays at the
/// website's 0.88 with its pitch preserved. Navigation stops playback.
@MainActor @Observable
final class AudioPlayerChirho {
    /// The word id (or "verse") now loading or playing.
    private(set) var activeIdChirho: String?
    /// The id whose recording could not be fetched, verified or played.
    private(set) var failedIdChirho: String?

    static let greekRateChirho: Float = 0.88

    @ObservationIgnored private let remoteChirho: RemoteChirho
    /// The identity of the current play. Callbacks carry the identity they were made for, so a
    /// late callback from an earlier play, even of the same word, can never end this one.
    @ObservationIgnored private(set) var playIdChirho = UUID()
    @ObservationIgnored private var playerChirho: AVPlayer?
    @ObservationIgnored private var taskChirho: Task<Void, Never>?
    @ObservationIgnored private var fileChirho: URL?
    @ObservationIgnored private var observersChirho: [any NSObjectProtocol] = []
    @ObservationIgnored private var statusChirho: NSKeyValueObservation?

    init(remoteChirho: RemoteChirho) {
        self.remoteChirho = remoteChirho
    }

    func toggleChirho(_ clipChirho: ClipChirho, idChirho: String) {
        if activeIdChirho == idChirho {
            stopChirho()
        } else {
            playChirho(clipChirho, idChirho: idChirho)
        }
    }

    func playChirho(_ clipChirho: ClipChirho, idChirho: String) {
        stopChirho()
        let playChirho = beginChirho(idChirho)
        let rateChirho: Float = clipChirho.languageChirho == "el" ? Self.greekRateChirho : 1
        taskChirho = Task {
            do {
                let dataChirho = try await remoteChirho.verifiedChirho(
                    clipChirho.assetPathChirho, .audioClipChirho, sha256Chirho: clipChirho.sha256Chirho)
                try Task.checkCancellation()
                guard dataChirho.count == clipChirho.bytesChirho else { throw RemoteErrorChirho.integrityChirho }
                let fileValueChirho = try Self.writeChirho(dataChirho, clipChirho.sha256Chirho, playChirho)
                guard !Task.isCancelled, playChirho == playIdChirho else {
                    try? FileManager.default.removeItem(at: fileValueChirho)
                    return
                }
                fileChirho = fileValueChirho
                try AVAudioSession.sharedInstance().setCategory(.playback, mode: .spokenAudio)
                try AVAudioSession.sharedInstance().setActive(true)
                startChirho(fileValueChirho, rateChirho, playChirho)
            } catch is CancellationError {
                return
            } catch {
                completeChirho(playChirho, failedChirho: true)
            }
        }
    }

    func stopChirho() {
        taskChirho?.cancel()
        taskChirho = nil
        releaseChirho()
        activeIdChirho = nil
        playIdChirho = UUID()
    }

    /// Starts a play for `idChirho` and returns the identity its callbacks must present.
    func beginChirho(_ idChirho: String) -> UUID {
        activeIdChirho = idChirho
        failedIdChirho = nil
        let playChirho = UUID()
        playIdChirho = playChirho
        return playChirho
    }

    /// Ends the play that `playChirho` names; a stale identity changes nothing.
    func completeChirho(_ playChirho: UUID, failedChirho: Bool) {
        guard playChirho == playIdChirho, let activeChirho = activeIdChirho else { return }
        releaseChirho()
        activeIdChirho = nil
        playIdChirho = UUID()
        if failedChirho { failedIdChirho = activeChirho }
    }

    private func startChirho(_ fileValueChirho: URL, _ rateChirho: Float, _ playChirho: UUID) {
        let itemChirho = AVPlayerItem(url: fileValueChirho)
        // Spectral time-pitch keeps the speaker's pitch when the rate is slowed.
        itemChirho.audioTimePitchAlgorithm = .spectral
        let playerValueChirho = AVPlayer(playerItem: itemChirho)
        playerValueChirho.automaticallyWaitsToMinimizeStalling = false
        let centerChirho = NotificationCenter.default
        observersChirho = [
            centerChirho.addObserver(forName: AVPlayerItem.didPlayToEndTimeNotification, object: itemChirho,
                                     queue: .main) { [weak self] _ in
                MainActor.assumeIsolated { self?.completeChirho(playChirho, failedChirho: false) }
            },
            centerChirho.addObserver(forName: AVPlayerItem.failedToPlayToEndTimeNotification, object: itemChirho,
                                     queue: .main) { [weak self] _ in
                MainActor.assumeIsolated { self?.completeChirho(playChirho, failedChirho: true) }
            }
        ]
        statusChirho = itemChirho.observe(\.status, options: [.new]) { [weak self] observedChirho, _ in
            guard observedChirho.status == .failed else { return }
            Task { @MainActor in self?.completeChirho(playChirho, failedChirho: true) }
        }
        playerChirho = playerValueChirho
        playerValueChirho.playImmediately(atRate: rateChirho)
    }

    private func releaseChirho() {
        observersChirho.forEach(NotificationCenter.default.removeObserver)
        observersChirho = []
        statusChirho?.invalidate()
        statusChirho = nil
        playerChirho?.pause()
        playerChirho = nil
        if let fileChirho { try? FileManager.default.removeItem(at: fileChirho) }
        fileChirho = nil
    }

    /// The verified bytes, in a private temporary file that exists only while they play.
    private static func writeChirho(_ dataChirho: Data, _ sha256Chirho: String, _ playChirho: UUID) throws -> URL {
        let folderChirho = FileManager.default.temporaryDirectory
            .appendingPathComponent("hinneh-audio-chirho", isDirectory: true)
        try FileManager.default.createDirectory(at: folderChirho, withIntermediateDirectories: true)
        let fileChirho = folderChirho.appendingPathComponent("\(sha256Chirho)-\(playChirho.uuidString)-chirho.mp3")
        try dataChirho.write(to: fileChirho, options: [.atomic, .completeFileProtection])
        return fileChirho
    }
}
