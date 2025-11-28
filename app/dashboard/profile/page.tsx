export default function Profile() {
  const userStats = {
    joined: 'January 2024',
    totalStudyTime: '45 hours',
    flashcardsCreated: 124,
    quizzesCompleted: 18,
    averageScore: '78%'
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Profile Info */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border p-4 sm:p-6">
          <div className="text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto mb-3 sm:mb-4 flex items-center justify-center">
              <span className="text-white text-lg sm:text-xl lg:text-2xl font-bold">U</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">Student User</h2>
            <p className="text-gray-600 text-sm sm:text-base mb-3 sm:mb-4">student@example.com</p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <button className="px-3 sm:px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm sm:text-base">
                Edit Profile
              </button>
              <button className="px-3 sm:px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base">
                Change Photo
              </button>
            </div>
          </div>

          {/* Mobile Quick Stats */}
          <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200 lg:hidden">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 text-center">Quick Stats</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-lg font-bold text-blue-600">{userStats.flashcardsCreated}</div>
                <div className="text-xs text-blue-800">Flashcards</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-lg font-bold text-green-600">{userStats.quizzesCompleted}</div>
                <div className="text-xs text-green-800">Quizzes</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats and Settings */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Learning Statistics */}
          <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Learning Statistics</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              {Object.entries(userStats).map(([key, value]) => (
                <div key={key} className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg">
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-1">{value}</p>
                  <p className="text-xs sm:text-sm text-gray-600 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </p>
                </div>
              ))}
            </div>

            {/* Progress Chart Placeholder */}
            <div className="mt-4 sm:mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
              <h4 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">Weekly Progress</h4>
              <div className="flex items-end justify-between h-20 gap-1">
                {[20, 35, 45, 30, 55, 40, 60].map((height, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-full bg-gradient-to-t from-blue-500 to-purple-500 rounded-t transition-all duration-300"
                      style={{ height: `${height}%` }}
                    ></div>
                    <span className="text-xs text-gray-500 mt-1">
                      {['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Account Settings */}
          <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Account Settings</h3>
            <div className="space-y-3 sm:space-y-4">
              {/* Notification Settings */}
              <div className="p-3 hover:bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm sm:text-base">Email Notifications</p>
                    <p className="text-gray-600 text-xs sm:text-sm">Study reminders and progress updates</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 ml-3">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-10 h-6 sm:w-11 sm:h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              {/* Dark Mode */}
              <div className="p-3 hover:bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm sm:text-base">Dark Mode</p>
                    <p className="text-gray-600 text-xs sm:text-sm">Switch to dark theme</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 ml-3">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-10 h-6 sm:w-11 sm:h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              {/* Study Reminders */}
              <div className="p-3 hover:bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm sm:text-base">Daily Study Reminders</p>
                    <p className="text-gray-600 text-xs sm:text-sm">Get reminded to study every day</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 ml-3">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-10 h-6 sm:w-11 sm:h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button className="py-2 sm:py-3 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm sm:text-base">
                  Change Password
                </button>
                <button className="py-2 sm:py-3 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm sm:text-base">
                  Delete Account
                </button>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {[
                { action: 'Created flashcards', subject: 'Biology Basics', time: '2 hours ago', type: 'flashcards' },
                { action: 'Completed quiz', subject: 'Chemistry Fundamentals', time: '1 day ago', type: 'quiz' },
                { action: 'Studied flashcards', subject: 'History Timeline', time: '2 days ago', type: 'study' },
                { action: 'Generated quiz', subject: 'Python Programming', time: '3 days ago', type: 'quiz' }
              ].map((activity, index) => (
                <div key={index} className="flex items-center p-2 sm:p-3 hover:bg-gray-50 rounded-lg">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0 mr-3 ${
                    activity.type === 'flashcards' ? 'bg-blue-100' : 
                    activity.type === 'quiz' ? 'bg-green-100' : 'bg-purple-100'
                  }`}>
                    <span className="text-sm sm:text-base">
                      {activity.type === 'flashcards' ? '🎴' : 
                       activity.type === 'quiz' ? '🧩' : '📚'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm sm:text-base truncate">{activity.action}</p>
                    <p className="text-gray-600 text-xs sm:text-sm truncate">{activity.subject}</p>
                  </div>
                  <span className="text-gray-500 text-xs flex-shrink-0 ml-2">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}