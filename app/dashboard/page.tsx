export default function Dashboard() {
  const stats = [
    { name: 'Total Flashcards', value: '124', change: '+12' },
    { name: 'Quizzes Taken', value: '18', change: '+3' },
    { name: 'Study Sessions', value: '24', change: '+5' },
    { name: 'Mastery Level', value: '78%', change: '+8%' },
  ]

  const recentActivity = [
    { type: 'Flashcards', name: 'Biology Basics', date: '2 hours ago' },
    { type: 'Quiz', name: 'Chemistry Fundamentals', date: '1 day ago' },
    { type: 'Flashcards', name: 'History Timeline', date: '2 days ago' },
  ]

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Welcome Header */}
      <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Welcome back, Student! 👋</h1>
        <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">Ready to continue your learning journey?</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-xl shadow-sm border p-3 sm:p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">{stat.name}</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mt-1 truncate">{stat.value}</p>
              </div>
              <div className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full flex-shrink-0 ml-2">
                {stat.change}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <button className="p-3 sm:p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center">
              <div className="text-xl sm:text-2xl mb-1 sm:mb-2">🎴</div>
              <p className="text-xs sm:text-sm  text-gray-600 font-medium">New Flashcards</p>
            </button>
            <button className="p-3 sm:p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-center">
              <div className="text-xl sm:text-2xl mb-1 sm:mb-2">🧩</div>
              <p className="text-xs sm:text-sm text-gray-600 font-medium">Generate Quiz</p>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Recent Activity</h2>
          <div className="space-y-3 sm:space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-2 sm:p-3 hover:bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    activity.type === 'Flashcards' ? 'bg-blue-100' : 'bg-green-100'
                  }`}>
                    <span className="text-sm sm:text-lg">
                      {activity.type === 'Flashcards' ? '🎴' : '🧩'}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 text-sm sm:text-base truncate">{activity.name}</p>
                    <p className="text-xs sm:text-sm text-gray-500 truncate">{activity.type}</p>
                  </div>
                </div>
                <span className="text-xs sm:text-sm text-gray-500 flex-shrink-0 ml-2 sm:ml-4">
                  {activity.date}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Quick Stats - Alternative layout for very small screens */}
      <div className="lg:hidden bg-white rounded-xl shadow-sm border p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Today's Progress</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">30</div>
            <div className="text-xs text-blue-800 mt-1">Mins Studied</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">12</div>
            <div className="text-xs text-green-800 mt-1">Cards Mastered</div>
          </div>
        </div>
      </div>
    </div>
  )
}