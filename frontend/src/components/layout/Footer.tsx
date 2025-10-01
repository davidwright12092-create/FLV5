import { Heart, Github, Twitter, Linkedin } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="mt-auto border-t border-gray-200 bg-white/50 backdrop-blur-sm">
      <div className="container mx-auto px-6 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left: Copyright */}
          <div className="flex items-center space-x-1 text-sm text-gray-600">
            <span>© {currentYear} FieldLink v5. Built with</span>
            <Heart className="w-4 h-4 text-error-500 fill-current" />
            <span>for trades professionals</span>
          </div>

          {/* Center: Links */}
          <div className="flex items-center space-x-6 text-sm">
            <a href="#" className="text-gray-600 hover:text-primary-600 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-600 hover:text-primary-600 transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-gray-600 hover:text-primary-600 transition-colors">
              Documentation
            </a>
            <a href="#" className="text-gray-600 hover:text-primary-600 transition-colors">
              Support
            </a>
          </div>

          {/* Right: Social */}
          <div className="flex items-center space-x-3">
            <a
              href="#"
              className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Twitter"
            >
              <Twitter className="w-5 h-5" />
            </a>
            <a
              href="#"
              className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-5 h-5" />
            </a>
            <a
              href="#"
              className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="GitHub"
            >
              <Github className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
