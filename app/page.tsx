import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Navigation */}
      <nav className="w-full h-16 flex items-center justify-between px-6 border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            StudySaaS
          </span>
        </div>
        
        <div className="flex items-center space-x-4">
          <Link 
            href="/auth/login" 
            className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            Sign In
          </Link>
          <Link 
            href="/auth/register" 
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center">
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-6">
            🚀 Trusted by 10,000+ students worldwide
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Master Any Subject with
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI-Powered Learning
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Transform your study sessions with intelligent flashcards, personalized quizzes, 
            and progress tracking. Study smarter, not harder with our AI-driven platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link 
              href="/auth/register" 
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-xl transition-all duration-200 text-lg"
            >
              Start Learning Free
            </Link>
            <Link 
              href="/dashboard" 
              className="px-8 py-4 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:border-blue-500 hover:text-blue-600 transition-colors text-lg"
            >
              Try Live Demo
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
            {[
              { number: "50K+", label: "Flashcards Created" },
              { number: "15K+", label: "Quizzes Generated" },
              { number: "95%", label: "User Satisfaction" },
              { number: "2.5x", label: "Faster Learning" }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-gray-900">{stat.number}</div>
                <div className="text-gray-600 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful AI tools designed to accelerate your learning and boost retention
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: "🎴",
                title: "AI Flashcard Generator",
                description: "Convert notes, textbooks, or any content into optimized flashcards instantly. Our AI understands context and creates effective learning cards.",
                features: ["Smart content parsing", "Spaced repetition", "Multi-format support"]
              },
              {
                icon: "🧩",
                title: "Smart Quiz Generator",
                description: "Generate custom quizzes with multiple question types. Perfect for exam preparation and knowledge testing.",
                features: ["Multiple choice", "True/False questions", "Short answer format"]
              },
              {
                icon: "📊",
                title: "Progress Analytics",
                description: "Track your learning journey with detailed insights and personalized recommendations for improvement.",
                features: ["Performance metrics", "Study patterns", "Weakness identification"]
              },
              {
                icon: "⏱️",
                title: "Study Sessions",
                description: "Timed study sessions with focus mode to maximize concentration and learning efficiency.",
                features: ["Pomodoro timer", "Focus mode", "Session history"]
              },
              {
                icon: "👥",
                title: "Collaborative Learning",
                description: "Study with friends, share flashcard sets, and compete on leaderboards to stay motivated.",
                features: ["Group study", "Set sharing", "Progress comparison"]
              },
              {
                icon: "📱",
                title: "Mobile Friendly",
                description: "Study anywhere, anytime with our fully responsive design that works perfectly on all devices.",
                features: ["Offline mode", "Sync across devices", "Mobile app"]
              }
            ].map((feature, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-all duration-300 border border-gray-100">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 mb-4">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.features.map((item, idx) => (
                    <li key={idx} className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gradient-to-br from-blue-600 to-purple-600 py-20 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How StudySaaS Works</h2>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Get started in minutes and transform your learning experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "Sign Up & Choose Plan",
                description: "Create your account and select the perfect plan for your learning needs"
              },
              {
                step: "02",
                title: "Upload Your Materials",
                description: "Paste notes, upload documents, or enter topics you want to study"
              },
              {
                step: "03",
                title: "AI Generates Content",
                description: "Our AI instantly creates flashcards and quizzes from your materials"
              },
              {
                step: "04",
                title: "Study & Track Progress",
                description: "Learn with smart tools and monitor your improvement over time"
              }
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold mb-4 mx-auto">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="opacity-90">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose the plan that works best for you. All plans include core features.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: "Free",
                price: "$0",
                description: "Perfect for getting started",
                features: [
                  "100 flashcards per month",
                  "10 quiz generations",
                  "Basic progress tracking",
                  "Community support"
                ],
                cta: "Get Started Free",
                popular: false
              },
              {
                name: "Pro",
                price: "$9",
                description: "Most popular for serious learners",
                features: [
                  "Unlimited flashcards",
                  "Unlimited quiz generations",
                  "Advanced analytics",
                  "Priority support",
                  "Export capabilities",
                  "Custom study plans"
                ],
                cta: "Start Pro Trial",
                popular: true
              },
              {
                name: "Team",
                price: "$25",
                description: "For classrooms and study groups",
                features: [
                  "Everything in Pro",
                  "Up to 10 team members",
                  "Collaborative study sets",
                  "Teacher dashboard",
                  "Bulk user management",
                  "Dedicated support"
                ],
                cta: "Contact Sales",
                popular: false
              }
            ].map((plan, index) => (
              <div key={index} className={`rounded-2xl p-8 border-2 ${
                plan.popular 
                  ? 'border-blue-500 bg-blue-50 relative' 
                  : 'border-gray-200'
              }`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <p className="text-gray-600 mb-6">{plan.description}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-gray-700">
                      <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link 
                  href="/auth/register" 
                  className={`w-full block text-center py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Loved by Students & Teachers
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              See what our community has to say about their learning transformation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Chen",
                role: "Medical Student",
                avatar: "👩‍⚕️",
                text: "StudySaaS cut my study time in half. The AI-generated flashcards are incredibly accurate and save me hours of manual work.",
                rating: 5
              },
              {
                name: "Dr. Michael Torres",
                role: "University Professor",
                avatar: "👨‍🏫",
                text: "I use StudySaaS to create practice quizzes for my students. The platform understands complex concepts and generates perfect questions.",
                rating: 5
              },
              {
                name: "Alex Johnson",
                role: "Language Learner",
                avatar: "👨‍💻",
                text: "As someone learning Spanish, the spaced repetition and quiz features have dramatically improved my vocabulary retention.",
                rating: 5
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xl mr-4">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-gray-600 text-sm">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-600 italic">"{testimonial.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-white py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to know about StudySaaS
            </p>
          </div>

          <div className="space-y-6">
            {[
              {
                question: "How does the AI generate flashcards and quizzes?",
                answer: "Our AI analyzes your input text, identifies key concepts and relationships, and creates optimized learning materials using natural language processing and educational best practices."
              },
              {
                question: "Can I use StudySaaS for any subject?",
                answer: "Absolutely! StudySaaS works with any academic subject, professional certification, language learning, or personal interest topic. From medicine to music theory, our AI adapts to your needs."
              },
              {
                question: "Is my data secure and private?",
                answer: "Yes, we take data privacy seriously. All your study materials are encrypted and we never share your personal information with third parties."
              },
              {
                question: "Can I study offline?",
                answer: "Yes, with our mobile app you can download your study sets and access them offline. Your progress syncs when you're back online."
              },
              {
                question: "What's included in the free plan?",
                answer: "The free plan includes 100 flashcard generations, 10 quiz generations per month, basic progress tracking, and access to all core features to get you started."
              }
            ].map((faq, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-6 hover:border-blue-500 transition-colors">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Transform Your Learning?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of students and teachers already accelerating their learning with StudySaaS
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/auth/register" 
              className="px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:shadow-xl transition-all duration-200 text-lg"
            >
              Start Free Today
            </Link>
            <Link 
              href="/dashboard" 
              className="px-8 py-4 border border-white text-white rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors text-lg"
            >
              Explore Demo
            </Link>
          </div>
          <p className="text-blue-100 mt-4 text-sm">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">S</span>
                </div>
                <span className="text-xl font-bold">StudySaaS</span>
              </div>
              <p className="text-gray-400">
                AI-powered learning platform helping students and teachers achieve more.
              </p>
            </div>
            
            {[
              {
                title: "Product",
                links: ["Features", "Pricing", "Use Cases", "Demo"]
              },
              {
                title: "Resources",
                links: ["Documentation", "Blog", "Tutorials", "Support"]
              },
              {
                title: "Company",
                links: ["About", "Careers", "Contact", "Privacy"]
              }
            ].map((column, index) => (
              <div key={index}>
                <h4 className="font-semibold mb-4">{column.title}</h4>
                <ul className="space-y-2">
                  {column.links.map((link, idx) => (
                    <li key={idx}>
                      <a href="#" className="text-gray-400 hover:text-white transition-colors">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 StudySaaS. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}