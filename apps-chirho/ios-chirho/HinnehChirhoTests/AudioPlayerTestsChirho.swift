// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import Foundation
import HinnehCoreChirho
import Testing
@testable import Hinneh

/// Every player callback presents the identity of the play it was made for. These checks drive
/// that rule directly, as a queued AVPlayer notification or status change would.
@MainActor
struct AudioPlayerTestsChirho {
    let playerChirho = AudioPlayerChirho(remoteChirho: RemoteChirho(transportChirho: GatedTransportChirho([:])))

    @Test func aLateCallbackFromAnEarlierPlayOfTheSameWordChangesNothingChirho() {
        let firstChirho = playerChirho.beginChirho("John.1.1!2")
        playerChirho.stopChirho()
        let secondChirho = playerChirho.beginChirho("John.1.1!2")
        // The first play's failure and end arrive after the same word was played again.
        playerChirho.completeChirho(firstChirho, failedChirho: true)
        playerChirho.completeChirho(firstChirho, failedChirho: false)
        #expect(playerChirho.activeIdChirho == "John.1.1!2", "the replay keeps playing")
        #expect(playerChirho.failedIdChirho == nil, "an old failure is not reported against the replay")
        #expect(playerChirho.playIdChirho == secondChirho)
        playerChirho.completeChirho(secondChirho, failedChirho: false)
        #expect(playerChirho.activeIdChirho == nil, "the replay ends at its own natural end")
        playerChirho.completeChirho(secondChirho, failedChirho: true)
        #expect(playerChirho.failedIdChirho == nil, "a repeated callback after the end changes nothing")
    }

    @Test func stoppingRetiresThePlayIdentityChirho() {
        let playChirho = playerChirho.beginChirho("verse")
        playerChirho.stopChirho()
        #expect(playerChirho.playIdChirho != playChirho)
        playerChirho.completeChirho(playChirho, failedChirho: true)
        #expect(playerChirho.activeIdChirho == nil && playerChirho.failedIdChirho == nil)
    }
}
