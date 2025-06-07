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
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function SignupCard() {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    const isDisabled = username.trim() === "" || password.trim() === ""
    async function handleCreateAccount(){
        if (username.trim() === "" || password.trim() === ""){
            toast.error("Username and password are required")
            return;
        }
        setIsLoading(true)
        try{
            const response = await fetch("/api/user/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, password }),
            })
            const data = await response.json()
            if (!response.ok) {
                if (response.status === 409) {
                    toast.error("Username already exists")
                    setUsername("")
                    setPassword("")
                } else {
                    toast.error(data.reason || "Error creating account")
                    setUsername("")
                    setPassword("")
                }
                return
            }
            
            toast.success("Account created successfully!")
            router.push("/signin")
        } catch (error) {
            toast.error("Network error. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Create your account</CardTitle>
          <CardDescription>
            Enter your username below to create your account
          </CardDescription>

        </CardHeader>
        <CardContent>
          <form>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="username"
                  placeholder="Username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input id="password" type="password" placeholder="Password" required value={password} onChange={(e)=>setPassword(e.target.value)}/>
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button type="submit" className="w-full cursor-pointer" disabled={isDisabled || isLoading} onClick={handleCreateAccount}>
            {isLoading ? "Creating account..." : "Create Account"}
          </Button>
          <CardAction>
            <Button variant="link">Already have an account? Sign In</Button>
          </CardAction>
        </CardFooter>
      </Card>
    )
  }
  