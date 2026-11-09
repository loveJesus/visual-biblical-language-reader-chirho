// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import HinnehCoreChirho
import SwiftUI

@main
struct HinnehAppChirho: App {
    @State private var modelChirho = ReaderModelChirho()

    var body: some Scene {
        WindowGroup {
            RootViewChirho(modelChirho: modelChirho)
        }
    }
}

/// Launch preferences apply once per app lifetime; an explicit passage link always wins.
struct RootViewChirho: View {
    let modelChirho: ReaderModelChirho

    var body: some View {
        ReaderViewChirho(modelChirho: modelChirho)
            .task { await modelChirho.launchChirho() }
            .onOpenURL { urlChirho in
                Task { await modelChirho.openLinkChirho(urlChirho) }
            }
    }
}
