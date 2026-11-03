// swift-tools-version: 6.0
// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import PackageDescription

let package = Package(
    name: "HinnehCoreChirho",
    defaultLocalization: "en",
    platforms: [.iOS(.v18), .macOS(.v15)],
    products: [
        .library(name: "HinnehCoreChirho", targets: ["HinnehCoreChirho"])
    ],
    targets: [
        .target(
            name: "HinnehCoreChirho",
            resources: [.process("ResourcesChirho")]
        ),
        .testTarget(
            name: "HinnehCoreChirhoTests",
            dependencies: ["HinnehCoreChirho"],
            resources: [.copy("FixturesChirho")]
        )
    ]
)
