// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import HinnehCoreChirho
import SwiftUI

struct ReadingCreditViewChirho: View {
    let attributionChirho: String
    let licenseChirho: String
    let licenseUrlChirho: String
    let localeChirho: LocaleChirho

    var body: some View {
        DisclosureGroup(localeChirho == .spanishChirho ? "Fuente de la lectura" : "Reading source") {
            Text(attributionChirho).foregroundStyle(.secondary)
            if let urlChirho = URL(string: licenseUrlChirho) {
                Link(licenseChirho, destination: urlChirho)
            }
        }
        .font(.caption)
    }
}
