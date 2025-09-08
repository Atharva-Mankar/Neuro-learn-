import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Brain, Clock, Moon, User, LogOut, ChartBarStackedIcon } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

// Circle Progress Component
const CircleProgress = ({ percentage, size = 120, strokeWidth = 8, children }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#3b82f6"
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-300"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
};

// Small Donut Chart Component
const SmallDonutChart = ({ percentage, size = 60 }) => {
  const radius = (size - 8) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={6}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#f59e0b"
          strokeWidth={6}
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-semibold text-gray-700">{percentage}%</span>
      </div>
    </div>
  );
};

// Profile Dropdown Component
const ProfileDropdown = ({ isOpen, onToggle, onLogout }) => {
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-colors"
      >
        <User className="w-6 h-6 text-white" />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50">
          <button
            onClick={onLogout}
            className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      )}
    </div>
  );
};

// Session History Chart Component
const SessionHistoryChart = () => {
  return (
    <div className="h-16 flex items-end justify-center space-x-1">
      <div className="w-2 bg-blue-300 rounded-t transition-all duration-300 hover:bg-blue-400" style={{ height: '20%' }}></div>
      <div className="w-2 bg-blue-400 rounded-t transition-all duration-300 hover:bg-blue-500" style={{ height: '40%' }}></div>
      <div className="w-2 bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600" style={{ height: '60%' }}></div>
      <div className="w-2 bg-blue-600 rounded-t transition-all duration-300 hover:bg-blue-700" style={{ height: '80%' }}></div>
      <div className="w-2 bg-blue-700 rounded-t transition-all duration-300 hover:bg-blue-800" style={{ height: '100%' }}></div>
    </div>
  );
};

export default function Dashboard() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  // Get email from localStorage and extract username
  const email = localStorage.getItem("email") || "";
  const username = email.split("@")[0] || "";

  // Calendar state
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeStartDate, setActiveStartDate] = useState(new Date());

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  // Updated logout: clear specific keys and redirect safely to root (login)
  const handleLogout = () => {
    try {
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("email");
      localStorage.removeItem("token");
      sessionStorage.clear();
    } catch (err) {
      // ignore storage errors
    }
    setDropdownOpen(false);
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700">
      {/* Header */}
      <header className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">NeuroLearn</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-white text-lg">
              {/* Show username from email */}
              Hello, {username}
            </div>
            <ProfileDropdown 
              isOpen={dropdownOpen} 
              onToggle={toggleDropdown} 
              onLogout={handleLogout} 
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="px-6 pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Welcome Back Card */}
          <div className="bg-white rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-shadow duration-300">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Welcome back!</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {/* Study Progress */}
              <div className="text-center">
                <h3 className="text-sm font-medium text-gray-600 mb-3">Study Progress</h3>
                <CircleProgress percentage={80}>
                  <span className="text-2xl font-bold text-gray-800">80%</span>
                </CircleProgress>
              </div>

              {/* Fatigue Level */}
              <div className="text-center">
                <h3 className="text-sm font-medium text-gray-600 mb-3">Fatigue Level</h3>
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center mb-2 shadow-lg">
                    <span className="text-2xl font-bold text-white">25</span>
                  </div>
                  <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">Low</span>
                </div>
              </div>

              {/* Session History Chart */}
              <div className="text-center">
                <h3 className="text-sm font-medium text-gray-600 mb-3">Session History</h3>
                <SessionHistoryChart />
              </div>
            </div>

            {/* Start Session Button */}
            <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
              Start Session
            </button>
          </div>

          {/* AI Scheduler */}
          <div className="bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-shadow duration-300">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800">AI Scheduler</h2>
            </div>

            <div className="p-6 flex flex-col items-center">
              {/* Calendar: single month view with only ← and → navigation */}
              <Calendar
                value={selectedDate}
                onChange={setSelectedDate}
                activeStartDate={activeStartDate}
                onActiveStartDateChange={({ activeStartDate }) => setActiveStartDate(activeStartDate)}
                prev2Label={null}
                next2Label={null}
                showNeighboringMonth={false}
                showFixedNumberOfWeeks={true}
                formatMonthYear={(locale, date) =>
                  date.toLocaleString('default', { month: 'long', year: 'numeric' })
                }
                formatShortWeekday={(locale, date) =>
                  // Ensure short weekday names like Mon, Tue, Wed
                  date.toLocaleDateString('en-US', { weekday: 'short' }).replace('.', '')
                }
                tileClassName={({ date, view }) =>
                  view === 'month' && date.toDateString() === selectedDate.toDateString()
                    ? 'rc-tile--active'
                    : null
                }
                className="react-calendar-custom"
              />
            </div>
          </div>

          {/* Insights */}
          <div className="bg-white rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-shadow duration-300">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Insights</h2>
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Study Recommendations</h3>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-blue-50 transition-colors duration-200">
                <Clock className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Take a 5-minute break after this session</span>
              </div>
              
              <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-blue-50 transition-colors duration-200">
                <Moon className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Try a 20-minute study sprint</span>
              </div>
              
              <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-blue-50 transition-colors duration-200">
                <Clock className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Take a 5-minute break after this session</span>
              </div>
              
              <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-blue-50 transition-colors duration-200">
                <Moon className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Revise yesterday's notes before new topics</span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-shadow duration-300">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Timeline</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                <div>
                  <h3 className="font-semibold text-gray-800">March 29, 2024</h3>
                  <p className="text-sm text-gray-600">Start at 3:00 PM</p>
                  <p className="text-sm text-gray-500">Duration: 45 minutes</p>
                </div>
                <SmallDonutChart percentage={65} />
              </div>
              
              <div className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                <div>
                  <h3 className="font-semibold text-gray-800">March 28, 2024</h3>
                  <p className="text-sm text-gray-600">Start at 2:30 PM</p>
                  <p className="text-sm text-gray-500">Duration: 30 minutes</p>
                </div>
                <SmallDonutChart percentage={45} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}