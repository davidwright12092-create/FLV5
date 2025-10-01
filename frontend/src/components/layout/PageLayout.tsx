import { ReactNode } from 'react'
import Header from './Header'
import Sidebar from './Sidebar'
import Footer from './Footer'

interface PageLayoutProps {
  children: ReactNode
  showSidebar?: boolean
  showFooter?: boolean
}

export default function PageLayout({
  children,
  showSidebar = true,
  showFooter = true
}: PageLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50">
      <Header />

      <div className="flex flex-1 overflow-hidden">
        {showSidebar && <Sidebar />}

        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-6 py-8">
            {children}
          </div>

          {showFooter && <Footer />}
        </main>
      </div>
    </div>
  )
}
