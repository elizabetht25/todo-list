"use client";
import { useAuthActions } from "@convex-dev/auth/react";
import { Button } from "./ui/button";
import { Authenticated, Unauthenticated } from "convex/react";
import { User } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
 
export function SignIn() {
  const { signIn } = useAuthActions();
  const { signOut } = useAuthActions();
  const handleSignOut = () => {
    void signOut();
  }
  return (<div>
    <Unauthenticated>
    <Button onClick={() => void signIn("github")} variant="secondary">Sign in with GitHub</Button>
    </Unauthenticated>
    <Authenticated>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" className="w-10 h-10 rounded-full">
            <User className="w-10 h-10" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="bg-primary text-primary-foreground p-2 mt-2 rounded-xl hover:cursor-pointer">
          <DropdownMenuItem onClick={handleSignOut}>
            Sign out
          </DropdownMenuItem>
          </DropdownMenuContent>
      </DropdownMenu>
    </Authenticated>
</div>
  );
}