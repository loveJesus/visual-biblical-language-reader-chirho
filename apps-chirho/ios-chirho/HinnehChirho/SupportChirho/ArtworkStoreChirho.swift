// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import HinnehCoreChirho
import SwiftUI
import UIKit

/// Verified artwork: bytes are shown only when their SHA-256 matches the catalogue, and a
/// bounded memory cache keeps recently seen pictures.
@MainActor
final class ArtworkStoreChirho {
    private let remoteChirho: RemoteChirho
    private let cacheChirho = NSCache<NSString, UIImage>()

    init(remoteChirho: RemoteChirho) {
        self.remoteChirho = remoteChirho
        cacheChirho.countLimit = 160
        cacheChirho.totalCostLimit = 48 * 1024 * 1024
    }

    func cachedChirho(_ sha256Chirho: String) -> UIImage? {
        cacheChirho.object(forKey: sha256Chirho as NSString)
    }

    func imageChirho(_ pathChirho: String, sha256Chirho: String) async throws -> UIImage {
        if let cachedChirho = cachedChirho(sha256Chirho) { return cachedChirho }
        let dataChirho = try await remoteChirho.verifiedChirho(pathChirho, .artworkChirho, sha256Chirho: sha256Chirho)
        guard let imageChirho = UIImage(data: dataChirho) else { throw RemoteErrorChirho.invalidChirho("image") }
        let preparedChirho = await imageChirho.byPreparingForDisplay() ?? imageChirho
        cacheChirho.setObject(preparedChirho, forKey: sha256Chirho as NSString, cost: dataChirho.count)
        return preparedChirho
    }
}

/// A verified remote picture with a stated fallback; the alternative text is always available.
struct VerifiedImageChirho<FallbackChirho: View>: View {
    let pathChirho: String
    let sha256Chirho: String
    let altChirho: String
    let storeChirho: ArtworkStoreChirho
    @ViewBuilder var fallbackChirho: (Bool) -> FallbackChirho

    @State private var imageChirho: UIImage?
    @State private var failedChirho = false

    var body: some View {
        Group {
            if let imageChirho {
                Image(uiImage: imageChirho)
                    .resizable()
                    .scaledToFit()
                    .accessibilityLabel(Text(altChirho))
                    .accessibilityAddTraits(.isImage)
            } else {
                fallbackChirho(failedChirho)
            }
        }
        .task(id: sha256Chirho) {
            imageChirho = storeChirho.cachedChirho(sha256Chirho)
            failedChirho = false
            guard imageChirho == nil else { return }
            do {
                imageChirho = try await storeChirho.imageChirho(pathChirho, sha256Chirho: sha256Chirho)
            } catch {
                if !Task.isCancelled { failedChirho = true }
            }
        }
    }
}
