import { Github, LayoutDashboard } from "lucide-react"
import Link from "next/link"
import { Button } from "./ui/button"

export function Footer() {
  return (
    <footer className="border-t bg-background py-4">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-2 mb-2 md:mb-0">
          <span className="font-semibold text-foreground">Wagey</span>
          <div className="mt-1">
          <Link href="https://github.com/Nix4444/wagey" target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <Github className="h-4 w-4" />
            </Button>
          </Link>
          </div>
        </div>

                 <nav className="flex flex-wrap items-center gap-2 md:gap-4 justify-center">
           <Link href="/dashboard" className="flex items-center gap-1 hover:text-foreground transition-colors">
             Dashboard
           </Link>
          <span className="hidden md:inline">|</span>
          <Link href="/dashboard/predictions" className="hover:text-foreground transition-colors">
            Predictions
          </Link>
          <span className="hidden md:inline">|</span>
          <Link href="/dashboard/analytics" className="hover:text-foreground transition-colors">
            Analytics
          </Link>
          <span className="hidden md:inline">|</span>
          <Link href="/dashboard/reports" className="hover:text-foreground transition-colors">
            Reports
          </Link>
        </nav>

      </div>
    </footer>
  )
}
