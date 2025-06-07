"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export function SigninCard() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const isDisabled = username.trim() === "" || password.trim() === ""
  
  async function handleSignIn(e: React.FormEvent){
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
      })
      
      if (result?.error) {
        toast.error("Invalid username or password")
      } else if (result?.ok) {
        toast.success("Login successful, redirecting...")
        router.push("/dashboard")
      }
    } catch (error) {
      toast.error("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Login to your account</CardTitle>
        <CardDescription>
          Enter your username below to login to your account
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSignIn}>
        <CardContent>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="username"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input 
                id="password" 
                type="password" 
                placeholder="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-2 pt-6">
          <Button type="submit" className="w-full cursor-pointer" disabled={isDisabled || isLoading}>
            {isLoading ? "Logging in..." : "Login"}
          </Button>
          <CardAction>
            <Button variant="link">Don't have an account? Sign Up</Button>
          </CardAction>
        </CardFooter>
      </form>
    </Card>
  )
}
  