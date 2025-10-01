import { useNavigate } from 'react-router-dom'
import { Construction, ArrowLeft } from 'lucide-react'
import { PageLayout } from '../components/layout'
import Button from '../components/ui/Button'

interface ComingSoonPageProps {
  title: string
  description?: string
}

export default function ComingSoonPage({ title, description }: ComingSoonPageProps) {
  const navigate = useNavigate()

  return (
    <PageLayout>
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-gradient-to-br from-brand-cyan to-brand-blue rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Construction className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">{title}</h1>
          <p className="text-gray-600 mb-8">
            {description || 'This feature is currently under development. Check back soon!'}
          </p>
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    </PageLayout>
  )
}
