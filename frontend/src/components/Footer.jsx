export default function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
          {/* Brand column */}
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-md bg-blue-600 flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-sm font-semibold text-gray-900">SnapLink</span>
            </div>
            <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
              Efficient, secure and accessible URL shortening. We turn long links into short, powerful experiences.
            </p>
          </div>

          {/* Features */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Features</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>Link Shortener</li>
              <li>Custom Aliases</li>
              <li>QR Code Generator</li>
              <li>Password Protection</li>
              <li>Link Expiration</li>
            </ul>
          </div>

          {/* Security */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Security</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>SSL Encryption</li>
              <li>Secure Password Hashing</li>
              <li>JWT Authentication</li>
              <li>Encrypted Database</li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-gray-500">© 2026 SnapLink. All rights reserved.</p>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            System Operational
          </div>
        </div>
      </div>
    </footer>
  );
}