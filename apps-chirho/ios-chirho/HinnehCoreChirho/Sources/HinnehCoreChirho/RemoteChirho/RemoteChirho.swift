// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import CryptoKit
import Foundation

/// Why a remote resource was refused. Every case leaves the reader on its last good passage.
public enum RemoteErrorChirho: Error, Equatable, Sendable {
    case untrustedPathChirho
    case statusChirho(Int)
    case tooLargeChirho
    case integrityChirho
    case invalidChirho(String)
    case transportChirho
}

/// One GET whose body is bounded and whose redirects are refused.
public protocol TransportChirho: Sendable {
    func getChirho(_ urlChirho: URL, limitChirho: Int) async throws -> Data
}

/// URLSession transport. Redirects are refused, so a response can only come from the URL asked.
public final class URLSessionTransportChirho: NSObject, TransportChirho, URLSessionTaskDelegate,
    @unchecked Sendable {
    // Immutable after init; URLSession is thread-safe.
    private let sessionChirho: URLSession

    public init(cacheDirectoryChirho: URL? = nil) {
        let configurationChirho = URLSessionConfiguration.default
        configurationChirho.urlCache = URLCache(
            memoryCapacity: 8 * 1024 * 1024,
            diskCapacity: 96 * 1024 * 1024,
            directory: cacheDirectoryChirho
        )
        configurationChirho.requestCachePolicy = .useProtocolCachePolicy
        configurationChirho.timeoutIntervalForRequest = 20
        sessionChirho = URLSession(configuration: configurationChirho)
    }

    public func getChirho(_ urlChirho: URL, limitChirho: Int) async throws -> Data {
        var requestChirho = URLRequest(url: urlChirho)
        requestChirho.httpMethod = "GET"
        let bytesChirho: URLSession.AsyncBytes
        let responseChirho: URLResponse
        do {
            (bytesChirho, responseChirho) = try await sessionChirho.bytes(
                for: requestChirho, delegate: self)
        } catch is CancellationError {
            throw CancellationError()
        } catch let errorChirho as URLError where errorChirho.code == .cancelled {
            throw CancellationError()
        } catch {
            throw RemoteErrorChirho.transportChirho
        }
        guard let httpChirho = responseChirho as? HTTPURLResponse,
              httpChirho.url?.host == urlChirho.host
        else { throw RemoteErrorChirho.transportChirho }
        guard httpChirho.statusCode == 200 else {
            throw RemoteErrorChirho.statusChirho(httpChirho.statusCode)
        }
        if httpChirho.expectedContentLength > Int64(limitChirho) {
            throw RemoteErrorChirho.tooLargeChirho
        }
        var dataChirho = Data()
        dataChirho.reserveCapacity(Int(max(0, min(httpChirho.expectedContentLength, Int64(limitChirho)))))
        do {
            for try await byteChirho in bytesChirho {
                dataChirho.append(byteChirho)
                if dataChirho.count > limitChirho { throw RemoteErrorChirho.tooLargeChirho }
            }
        } catch let errorChirho as RemoteErrorChirho {
            throw errorChirho
        } catch is CancellationError {
            throw CancellationError()
        } catch {
            if Task.isCancelled { throw CancellationError() }
            throw RemoteErrorChirho.transportChirho
        }
        try Task.checkCancellation()
        return dataChirho
    }

    public func urlSession(
        _ sessionChirho: URLSession,
        task taskChirho: URLSessionTask,
        willPerformHTTPRedirection responseChirho: HTTPURLResponse,
        newRequest requestChirho: URLRequest
    ) async -> URLRequest? {
        nil
    }
}

/// The reader's only way to reach the network: trusted paths, bounded bodies, verified bytes.
public struct RemoteChirho: Sendable {
    public let transportChirho: any TransportChirho

    public init(transportChirho: any TransportChirho) {
        self.transportChirho = transportChirho
    }

    public func dataChirho(_ pathChirho: String, _ kindChirho: ResourceKindChirho) async throws
        -> Data {
        guard let urlChirho = OriginChirho.urlChirho(pathChirho, kindChirho) else {
            throw RemoteErrorChirho.untrustedPathChirho
        }
        return try await transportChirho.getChirho(urlChirho, limitChirho: kindChirho.limitChirho)
    }

    /// Bytes whose SHA-256 equals the hash the catalogue recorded for them.
    public func verifiedChirho(
        _ pathChirho: String, _ kindChirho: ResourceKindChirho, sha256Chirho: String
    ) async throws -> Data {
        guard DigestChirho.isHexChirho(sha256Chirho) else { throw RemoteErrorChirho.integrityChirho }
        let dataChirho = try await dataChirho(pathChirho, kindChirho)
        guard DigestChirho.sha256HexChirho(dataChirho) == sha256Chirho else {
            throw RemoteErrorChirho.integrityChirho
        }
        return dataChirho
    }
}

public enum DigestChirho {
    public static func sha256HexChirho(_ dataChirho: Data) -> String {
        SHA256.hash(data: dataChirho).map { byteChirho in
            let hexChirho = String(byteChirho, radix: 16)
            return byteChirho < 16 ? "0" + hexChirho : hexChirho
        }.joined()
    }

    public static func sha256HexChirho(_ textChirho: String) -> String {
        sha256HexChirho(Data(textChirho.utf8))
    }

    public static func isHexChirho(_ valueChirho: String) -> Bool {
        valueChirho.utf8.count == 64
            && valueChirho.utf8.allSatisfy { (48...57).contains($0) || (97...102).contains($0) }
    }
}

/// Decodes the public JSON contract: snake_case fields map to the Swift names, Unicode text is
/// kept exactly as published.
public enum DecodingChirho {
    public static func decodeChirho<ValueChirho: Decodable>(
        _ typeChirho: ValueChirho.Type, _ dataChirho: Data
    ) throws -> ValueChirho {
        let decoderChirho = JSONDecoder()
        decoderChirho.keyDecodingStrategy = .convertFromSnakeCase
        do {
            return try decoderChirho.decode(typeChirho, from: dataChirho)
        } catch {
            throw RemoteErrorChirho.invalidChirho(String(describing: typeChirho))
        }
    }
}
