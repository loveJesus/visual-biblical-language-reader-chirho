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

/// A fresh launch opens Proverbs at today's chapter. An explicitly requested passage (the
/// `-hinneh-open-chirho John.3.16` launch argument) or one the reader chose, restored with the
/// scene, takes precedence over the daily default.
struct RootViewChirho: View {
    let modelChirho: ReaderModelChirho
    @SceneStorage("hinneh-passage-chirho") private var savedPassageChirho = ""

    var body: some View {
        ReaderViewChirho(modelChirho: modelChirho)
            .task {
                let booksChirho = modelChirho.booksChirho
                let requestedChirho = UserDefaults.standard.string(forKey: "hinneh-open-chirho")
                    .flatMap { PassageChirho.parseChirho($0, booksChirho) }
                let restoredChirho = PassageChirho.parseChirho(savedPassageChirho, booksChirho)
                modelChirho.openChirho(requestedChirho ?? restoredChirho ?? modelChirho.passageChirho)
                await modelChirho.refreshBooksChirho()
            }
            .onChange(of: modelChirho.passageChirho) { _, passageChirho in
                savedPassageChirho = passageChirho.idChirho
            }
    }
}
