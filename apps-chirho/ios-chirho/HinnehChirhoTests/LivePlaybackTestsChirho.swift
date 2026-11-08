// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import AVFoundation
import Foundation
import HinnehCoreChirho
import Testing
@testable import Hinneh

/// Read-only native playback against the published contract, with an injected corrupt MP4.
private actor PlaybackTransportChirho: TransportChirho {
    private let liveChirho = URLSessionTransportChirho()
    private var refuseVideoChirho = false
    private(set) var videosChirho = 0
    private(set) var recordingsChirho = 0

    func corruptVideoChirho() { refuseVideoChirho = true }

    func getChirho(_ urlChirho: URL, limitChirho: Int) async throws -> Data {
        if urlChirho.path.hasSuffix(".mp4") {
            videosChirho += 1
            if refuseVideoChirho { return Data([0]) }
        }
        if urlChirho.path.hasSuffix(".mp3") { recordingsChirho += 1 }
        return try await liveChirho.getChirho(urlChirho, limitChirho: limitChirho)
    }
}

@MainActor
struct LivePlaybackTestsChirho {
    private func waitChirho(_ conditionChirho: () async -> Bool) async throws {
        for _ in 0..<1_000 {
            if await conditionChirho() { return }
            try await Task.sleep(for: .milliseconds(30))
        }
        throw RemoteErrorChirho.invalidChirho("native playback condition timed out")
    }

    @Test func nativeVideoUsesOneClockAndAFailedVideoFallsBackOnTheNextPlayChirho() async throws {
        let transportChirho = PlaybackTransportChirho()
        let modelChirho = ReaderModelChirho(
            passageChirho: PassageChirho(bookIdChirho: "Prov", chapterChirho: 1, verseChirho: 1),
            remoteChirho: RemoteChirho(transportChirho: transportChirho))
        let savedSpeedChirho = UserDefaults.standard.object(forKey: ReaderModelChirho.speedKeyChirho)
        defer {
            modelChirho.playerChirho.stopChirho()
            if let savedSpeedChirho {
                UserDefaults.standard.set(savedSpeedChirho, forKey: ReaderModelChirho.speedKeyChirho)
            } else { UserDefaults.standard.removeObject(forKey: ReaderModelChirho.speedKeyChirho) }
        }
        modelChirho.playbackSpeedChirho = .normalChirho
        modelChirho.openChirho(modelChirho.passageChirho)
        try await waitChirho { modelChirho.mediaChirho.videoChirho != nil && modelChirho.audioChirho.verseClipChirho != nil }
        modelChirho.toggleVerseChirho()
        try await waitChirho { (modelChirho.playerChirho.videoPlayerChirho?.currentTime().seconds ?? 0) > 0.1 }
        let videoChirho = try #require(modelChirho.playerChirho.videoPlayerChirho)
        #expect(videoChirho.rate == 1)
        #expect(videoChirho.currentItem?.status == .readyToPlay)
        #expect(await transportChirho.recordingsChirho == 0, "embedded sound is the only reading clock")
        modelChirho.playbackSpeedChirho = .gentleChirho
        #expect(abs(videoChirho.rate - 0.85) < 0.01)
        #expect(videoChirho.currentItem?.audioTimePitchAlgorithm == .spectral)
        modelChirho.playerChirho.stopChirho()
        #expect(modelChirho.playerChirho.videoPlayerChirho == nil)

        await transportChirho.corruptVideoChirho()
        modelChirho.toggleVerseChirho()
        try await waitChirho { modelChirho.playerChirho.failedIdChirho == "verse" }
        #expect(modelChirho.playerChirho.failedVideoShaChirho == modelChirho.mediaChirho.videoChirho?.sha256Chirho)
        let attemptedChirho = await transportChirho.videosChirho
        modelChirho.toggleVerseChirho()
        try await waitChirho { await transportChirho.recordingsChirho > 0 }
        try await waitChirho { modelChirho.playerChirho.activeIdChirho == nil }
        #expect(modelChirho.playerChirho.failedIdChirho == nil)
        #expect(modelChirho.playerChirho.videoPlayerChirho == nil)
        #expect(await transportChirho.videosChirho == attemptedChirho, "an explicit replay uses the verified MP3, not the broken video")
    }
}
