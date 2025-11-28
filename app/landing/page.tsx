export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20">
      <h1 className="text-4xl font-bold">AI-Powered Study Tools</h1>
      <p className="text-lg text-gray-600 mt-4 max-w-xl">
        Generate flashcards, quizzes, summaries and learn faster — all in one place.
      </p>
      <a
        href="/auth/register"
        className="mt-6 px-6 py-3 bg-black text-white rounded-md"
      >
        Get Started
      </a>
    </div>
  )
}
