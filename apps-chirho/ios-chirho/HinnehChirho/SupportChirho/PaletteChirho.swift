// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import HinnehCoreChirho
import SwiftUI
import UIKit

/// The website's teaching colours, with darker equivalents so the marks stay legible in Dark Mode.
enum PaletteChirho {
    static func dynamicChirho(_ lightChirho: UInt32, _ darkChirho: UInt32) -> Color {
        Color(UIColor { traitsChirho in
            let valueChirho = traitsChirho.userInterfaceStyle == .dark ? darkChirho : lightChirho
            return UIColor(red: CGFloat((valueChirho >> 16) & 0xFF) / 255,
                           green: CGFloat((valueChirho >> 8) & 0xFF) / 255,
                           blue: CGFloat(valueChirho & 0xFF) / 255, alpha: 1)
        })
    }

    static let masculineChirho = dynamicChirho(0xDFF0FF, 0x1E3A55)
    static let feminineChirho = dynamicChirho(0xFFE4ED, 0x55243A)
    static let neuterChirho = dynamicChirho(0xECEFE9, 0x3A3F37)
    static let pluralChirho = dynamicChirho(0xE9C92D, 0xE9C92D)
    static let dualChirho = dynamicChirho(0x36A36A, 0x4CC283)
    static let nounChirho = dynamicChirho(0x18847D, 0x3DBDB4)
    static let verbChirho = dynamicChirho(0x8152B1, 0xB089E0)
    static let adjectiveChirho = dynamicChirho(0xC57820, 0xE59A45)
    static let particleChirho = dynamicChirho(0x7C8589, 0xA3ABAF)
    static let patternChirho = dynamicChirho(0xDD7B24, 0xF09A4A)
    static let inkChirho = dynamicChirho(0x24302A, 0xF2EFE6)
    static let quietChirho = dynamicChirho(0x526757, 0xA9BBAE)
    static let paperChirho = dynamicChirho(0xFBF8F1, 0x16191A)
    static let cardChirho = dynamicChirho(0xFFFFFF, 0x23282A)
    static let ruleChirho = dynamicChirho(0xD8D1C4, 0x3C4346)

    static func shadeChirho(_ shadeChirho: ShadeChirho?) -> Color {
        switch shadeChirho {
        case .masculineChirho: masculineChirho
        case .feminineChirho: feminineChirho
        case .neuterChirho: neuterChirho
        case nil: .clear
        }
    }

    static func underlineChirho(_ underlineChirho: UnderlineChirho?) -> Color {
        switch underlineChirho {
        case .pluralChirho: pluralChirho
        case .dualChirho: dualChirho
        case nil: .clear
        }
    }

    static func outlineChirho(_ categoryChirho: CategoryChirho) -> Color {
        switch categoryChirho {
        case .nounChirho: nounChirho
        case .verbChirho: verbChirho
        case .adjectiveChirho: adjectiveChirho
        case .particleChirho, .pronounChirho, .articleChirho, .unknownChirho: particleChirho
        }
    }
}
