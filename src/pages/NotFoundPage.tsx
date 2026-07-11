import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Home } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
      <p className="text-8xl font-bold text-primary">404</p>
      <h1 className="mt-4 text-xl font-semibold text-slate-800 dark:text-slate-100">Page not found</h1>
      <p className="mt-2 text-sm text-slate-500">The page you're looking for doesn't exist.</p>
      <Link to="/" className="mt-6">
        <Button>
          <Home className="h-4 w-4" /> Back to Dashboard
        </Button>
      </Link>
    </div>
  )
}
