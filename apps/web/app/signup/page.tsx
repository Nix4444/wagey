import { SignupCard } from "../components/SignupCard"
import Image from "next/image"

export default function Signup() {
  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex items-center justify-center p-4 lg:p-8">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-center lg:text-left">Welcome!</h1>
            <p className="text-muted-foreground text-center lg:text-left mt-2">
              Create your account to get started
            </p>
          </div>
          <SignupCard />
        </div>
      </div>
      
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary/10 to-secondary/10 items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="mb-8">
            <Image
              src="/turborepo-dark.svg"
              alt="Logo"
              width={200}
              height={200}
              className="mx-auto mb-6 opacity-80"
            />
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Join our platform
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Experience seamless integration and powerful features designed to help you succeed.
          </p>
        </div>
      </div>
    </div>
  )
}
