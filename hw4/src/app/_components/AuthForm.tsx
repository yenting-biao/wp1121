"use client";

import { useEffect, useState } from "react";

import { signIn } from "next-auth/react";
//import { useRouter } from "next/navigation";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { publicEnv } from "@/lib/env/public";

import AuthInput from "./AuthInput";

export default function AuthForm() {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const router = useRouter();

  const [confirmPasswordErr, setConfirmPasswordErr] = useState<boolean>(false);
  const [passwordLenErr, setPasswordLenErr] = useState<boolean>(false);

  useEffect(() => {
    if (isSignUp && password !== confirmPassword) {
      setConfirmPasswordErr(true);
    } else {
      setConfirmPasswordErr(false);
    }

    if (isSignUp && password.length > 0 && password.length < 8) {
      setPasswordLenErr(true);
    } else {
      setPasswordLenErr(false);
    }
  }, [isSignUp, password, confirmPassword]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: sign in logic
    if (isSignUp && password !== confirmPassword) {
      alert("Password and confirm password do not match.");
      return;
    }
    if (isSignUp && password.length < 8) {
      alert("The password must be at least 8 characters long.");
      return;
    }

    signIn("credentials", {
      username,
      password,
      redirect: false,
      //callbackUrl: `${publicEnv.NEXT_PUBLIC_BASE_URL}/chatrooms`,
    }).then((callback) => {
      if (callback?.error) {
        if (isSignUp) {
          alert("The username is already taken. Please try another one.");
        } else {
          alert("Wrong password!");
        }
      } else if (callback?.ok) {
        router.push(`${publicEnv.NEXT_PUBLIC_BASE_URL}/chatrooms`);
      }
    });
  };

  return (
    <Card className="min-w-[300px]">
      <CardHeader className="flex flex-row items-center text-xl font-bold">
        <div className="flex items-center gap-1">
          <Image
            src="/messenger.png"
            alt="messenger icon"
            width={25}
            height={25}
            className="mr-1 inline-block"
          />
          <div className="ml-1">Sign {isSignUp ? "Up" : "In"}</div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
          <AuthInput
            label="Username"
            type="text"
            value={username}
            setValue={setUsername}
          />
          <AuthInput
            label="Password"
            type="password"
            value={password}
            setValue={setPassword}
          />
          {isSignUp && passwordLenErr && (
            <p className="text-red-500">
              The length of password should be <br /> at least 8 characters
              long.
            </p>
          )}

          {isSignUp && (
            <AuthInput
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              setValue={setConfirmPassword}
            />
          )}
          {isSignUp && confirmPasswordErr && (
            <p className="text-red-500">Passwords do not match.</p>
          )}
          <div className="text-sm text-gray-500">
            {isSignUp ? (
              <span>
                Already have an account?{" "}
                <a
                  className="cursor-pointer hover:underline"
                  onClick={() => setIsSignUp(false)}
                >
                  Sign In
                </a>
              </span>
            ) : (
              <span>
                Do not have an account?{" "}
                <a
                  className="cursor-pointer hover:underline"
                  onClick={() => setIsSignUp(true)}
                >
                  Sign Up
                </a>
              </span>
            )}
          </div>

          <Button type="submit" className="w-full">
            Sign {isSignUp ? "Up" : "In"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
