import Foundation

/// Handles HTTP/network requests from the mini-program
public final class RequestHandler: Handler {
    public let apiName: String = "dualler.request"

    public func handle(_ message: BridgeMessage) -> String? {
        guard let payload = message.payload,
              let urlString = payload["url"] as? String else {
            return "{\"errMsg\":\"invalid request URL\"}"
        }

        guard let url = URL(string: urlString) else {
            return "{\"errMsg\":\"invalid URL\"}"
        }

        var request = URLRequest(url: url)
        if let method = payload["method"] as? String {
            request.httpMethod = method
        }
        if let data = payload["data"] as? String {
            request.httpBody = data.data(using: .utf8)
        }

        let semaphore = DispatchSemaphore(value: 0)
        var resultJSON: String?
        var errorDesc: String?

        URLSession.shared.dataTask(with: request) { data, response, error in
            if let error = error {
                errorDesc = error.localizedDescription
                semaphore.signal()
                return
            }

            if let httpResponse = response as? HTTPURLResponse {
                let statusCode = httpResponse.statusCode
                let body = (data?.map { String(describing: $0) }) ?? ""
                resultJSON = String(format: "{\"statusCode\":%d,\"data\":\"%s\"}", statusCode, body)
            }
            semaphore.signal()
        }.resume()

        semaphore.wait()

        if let desc = errorDesc {
            return "{\"errMsg\":\"request failed: \(desc)\"}"
        }
        return resultJSON ?? "{\"errMsg\":\"request unknown error\"}"
    }
}
