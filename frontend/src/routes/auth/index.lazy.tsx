import { createLazyFileRoute } from "@tanstack/react-router"
import { useNavigate } from "@tanstack/react-router"
import { PasskeyAuth } from "@/components/passkey-auth"

export const Route = createLazyFileRoute("/auth/")({
  component: AuthPage,
})

function AuthPage() {
  const navigate = useNavigate()

  const handleAuthSuccess = (token: string) => {
    // トークンを保存
    localStorage.setItem("token", token)
    // ホームページにリダイレクト
    navigate({ to: "/" })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Welcome Back</h1>
          <p className="mt-2 text-gray-600">
            オンラインジャッジシステムにログイン
          </p>
        </div>
        <PasskeyAuth onAuthenticationSuccess={handleAuthSuccess} />
      </div>
    </div>
  )
}
