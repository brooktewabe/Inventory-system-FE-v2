import { useState } from "react"
import axios from "../axiosInterceptor"
import { toast } from "react-toastify"
import { useNavigate } from "react-router-dom"

const ForgotPassword = () => {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) {
      toast.error("Please enter your email")
      return
    }

    setLoading(true)
    try {
      await axios.post("https://apiv2.cnhtc4.com/forgot-password", { email })
      toast.success("Reset link sent! Check your inbox.")
      navigate('/')
      setEmail("")
    } catch (error) {
      toast.error("Email not found or error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-4 text-center text-blue-600">Forgot Password</h2>
        <p className="mb-6 text-sm text-gray-600 text-center">
          Enter your email and we&apos;ll send you a password reset link.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-700 block mb-1">Email address</label>
            <input
              type="email"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition duration-200"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
      </div>
    </section>
  )
}

export default ForgotPassword
