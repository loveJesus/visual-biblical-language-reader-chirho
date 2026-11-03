// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

/// A least-recently-used cache with a fixed number of entries, so memory never grows with reading.
struct BoundedCacheChirho<KeyChirho: Hashable, ValueChirho> {
    let capacityChirho: Int
    private var valuesChirho: [KeyChirho: ValueChirho] = [:]
    private var orderChirho: [KeyChirho] = []

    init(capacityChirho: Int) {
        precondition(capacityChirho > 0)
        self.capacityChirho = capacityChirho
    }

    var countChirho: Int { valuesChirho.count }

    mutating func valueChirho(_ keyChirho: KeyChirho) -> ValueChirho? {
        guard let valueChirho = valuesChirho[keyChirho] else { return nil }
        touchChirho(keyChirho)
        return valueChirho
    }

    mutating func insertChirho(_ keyChirho: KeyChirho, _ valueChirho: ValueChirho) {
        valuesChirho[keyChirho] = valueChirho
        touchChirho(keyChirho)
        while orderChirho.count > capacityChirho {
            valuesChirho[orderChirho.removeFirst()] = nil
        }
    }

    mutating func removeChirho(_ keyChirho: KeyChirho) {
        valuesChirho[keyChirho] = nil
        orderChirho.removeAll { $0 == keyChirho }
    }

    private mutating func touchChirho(_ keyChirho: KeyChirho) {
        orderChirho.removeAll { $0 == keyChirho }
        orderChirho.append(keyChirho)
    }
}
