import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSignIn, useSignUp } from "@/features/auth/hooks/use-auth";
import {
    signInSchema,
    signUpSchema,
    type SignInInput,
    type SignUpInput,
} from "@/features/auth/types/schema";

export function LoginPage() {
    const [mode, setMode] = useState<"signin" | "signup">("signin");

    return (
        <div className="flex min-h-screen items-center justify-center p-4 sm:p-8">
            <div className="w-full max-w-sm">
                <h1 className="font-display text-3xl font-semibold">
                    {mode === "signin"
                        ? "Sign in to Pathwise"
                        : "Create your account"}
                </h1>

                {mode === "signin" ? <SignInForm /> : <SignUpForm />}

                <button
                    type="button"
                    onClick={() =>
                        setMode(mode === "signin" ? "signup" : "signin")
                    }
                    className="mt-4 text-sm text-muted-foreground hover:underline">
                    {mode === "signin"
                        ? "Don't have an account? Sign up"
                        : "Already have an account? Sign in"}
                </button>
            </div>
        </div>
    );
}

function SignInForm() {
    const navigate = useNavigate();
    const signIn = useSignIn();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SignInInput>({ resolver: zodResolver(signInSchema) });

    const onSubmit = (values: SignInInput) => {
        signIn.mutate(values, {
            onSuccess: () => {
                toast.success("Welcome back");
                navigate("/", { replace: true });
            },
            onError: (err) => toast.error(err.message),
        });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register("email")} />
                {errors.email && (
                    <p className="text-xs text-red-500">
                        {errors.email.message}
                    </p>
                )}
            </div>
            <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                    id="password"
                    type="password"
                    {...register("password")}
                />
                {errors.password && (
                    <p className="text-xs text-red-500">
                        {errors.password.message}
                    </p>
                )}
            </div>
            <Button
                type="submit"
                className="w-full"
                isLoading={signIn.isPending}>
                Sign in
            </Button>
        </form>
    );
}

function SignUpForm() {
    const signUp = useSignUp();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SignUpInput>({ resolver: zodResolver(signUpSchema) });

    const onSubmit = (values: SignUpInput) => {
        signUp.mutate(values, {
            onSuccess: () => {
                toast.success("Check your email to confirm your account");
            },
            onError: (err) => toast.error(err.message),
        });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register("email")} />
                {errors.email && (
                    <p className="text-xs text-red-500">
                        {errors.email.message}
                    </p>
                )}
            </div>
            <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                    id="password"
                    type="password"
                    {...register("password")}
                />
                {errors.password && (
                    <p className="text-xs text-red-500">
                        {errors.password.message}
                    </p>
                )}
            </div>
            <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <Input
                    id="confirmPassword"
                    type="password"
                    {...register("confirmPassword")}
                />
                {errors.confirmPassword && (
                    <p className="text-xs text-red-500">
                        {errors.confirmPassword.message}
                    </p>
                )}
            </div>
            <Button
                type="submit"
                className="w-full"
                isLoading={signUp.isPending}>
                Sign up
            </Button>
        </form>
    );
}
