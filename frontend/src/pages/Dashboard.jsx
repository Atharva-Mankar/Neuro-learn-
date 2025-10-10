import React, { useState, useEffect } from "react";
import { Brain, Clock, Moon, User, LogOut } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { api } from "../services/api";

// --- Circle Progress Component ---
const CircleProgress = ({ percentage, size = 120, strokeWidth = 8, children }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e5e7eb" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#3b82f6"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-300"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  );
};

const SmallDonutChart = ({ percentage, size = 60 }) => {
  const radius = (size - 8) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e5e7eb" strokeWidth={6} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#f59e0b"
          strokeWidth={6}
          strokeDasharray={circumference}
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

// --- Profile Dropdown ---
const ProfileDropdown = ({ isOpen, onToggle, onLogout }) => (
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

const SessionHistoryChart = () => (
  <div className="h-16 flex items-end justify-center space-x-1">
    {[20, 40, 60, 80, 100].map((h, i) => (
      <div
        key={i}
        className="w-2 bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600"
        style={{ height: `${h}%` }}
      ></div>
    ))}
  </div>
);

// --- Dashboard Main Component ---
export default function Dashboard() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeStartDate, setActiveStartDate] = useState(new Date());
  const [isSessionActive, setIsSessionActive] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/", { replace: true });
  };

  useEffect(() => {
    const fetchMyInfo = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        handleLogout();
        return;
      }
      try {
        const myInfo = await api.getCurrentUser(token);
        setUser(myInfo);
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
        handleLogout();
      } finally {
        setIsLoading(false);
      }
    };
    fetchMyInfo();
  }, []);

  // --- Start session (Camera On) ---
  const handleStartSession = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const videoElement = document.createElement("video");
      videoElement.srcObject = stream;
      videoElement.autoplay = true;
      videoElement.style.width = "100%";
      videoElement.style.borderRadius = "15px";
      videoElement.style.marginTop = "10px";

      const container = document.getElementById("video-container");
      if (container) {
        container.innerHTML = "";
        container.appendChild(videoElement);
      }

      setIsSessionActive(true);
      console.log("🎥 Camera started for session");
    } catch (err) {
      console.error("Camera access denied:", err);
      alert("Please allow camera access to start your session.");
    }
  };

  // --- End session (Camera Off) ---
  const handleEndSession = () => {
    const video = document.querySelector("video");
    if (video && video.srcObject) {
      const tracks = video.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
      video.srcObject = null;
    }
    const container = document.getElementById("video-container");
    if (container) container.innerHTML = "";
    setIsSessionActive(false);
    console.log("🛑 Camera stopped");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-blue-900 flex items-center justify-center">
        <span className="text-white text-xl animate-pulse">Loading Dashboard...</span>
      </div>
    );
  }

  // --- Dashboard UI ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700">
      <header className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">NeuroLearn</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-white text-lg">Hello, {user?.username}</div>
            <ProfileDropdown
              isOpen={dropdownOpen}
              onToggle={() => setDropdownOpen(!dropdownOpen)}
              onLogout={handleLogout}
            />
          </div>
        </div>
      </header>

      <div className="px-6 pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* --- Welcome Section --- */}
          <div className="bg-white rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-shadow duration-300">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Welcome back!</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center">
                <h3 className="text-sm font-medium text-gray-600 mb-3">Study Progress</h3>
                <CircleProgress percentage={80}>
                  <span className="text-2xl font-bold text-gray-800">80%</span>
                </CircleProgress>
              </div>
              <div className="text-center">
                <h3 className="text-sm font-medium text-gray-600 mb-3">Fatigue Level</h3>
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center mb-2 shadow-lg">
                    <span className="text-2xl font-bold text-white">25</span>
                  </div>
                  <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">Low</span>
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-sm font-medium text-gray-600 mb-3">Session History</h3>
                <SessionHistoryChart />
              </div>
            </div>

            {!isSessionActive ? (
              <button
                onClick={handleStartSession}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Start Session
              </button>
            ) : (
              <button
                onClick={handleEndSession}
                className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-4 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                End Session
              </button>
            )}

            <div id="video-container" className="mt-4 rounded-lg overflow-hidden"></div>
          </div>

          {/* --- AI Scheduler --- */}
          <div className="bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-shadow duration-300">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800">AI Scheduler</h2>
            </div>
            <div className="p-6 flex flex-col items-center">
              <Calendar
                value={selectedDate}
                onChange={setSelectedDate}
                activeStartDate={activeStartDate}
                onActiveStartDateChange={({ activeStartDate }) => setActiveStartDate(activeStartDate)}
                prev2Label={null}
                next2Label={null}
                showNeighboringMonth={false}
                showFixedNumberOfWeeks={true}
                formatMonthYear={(locale, date) => date.toLocaleString("default", { month: "long", year: "numeric" })}
                formatShortWeekday={(locale, date) => date.toLocaleDateString("en-US", { weekday: "short" }).replace(".", "")}
                className="react-calendar-custom"
              />
            </div>
          </div>

          {/* --- Insights --- */}
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
                <span className="text-gray-700">Revise yesterday's notes before new topics</span>
              </div>
            </div>
          </div>

          {/* --- Timeline --- */}
          <div className="bg-white rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-shadow duration-300">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Timeline</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                <div>
                  <h3 className="font-semibold text-gray-800">Oct 9, 2025</h3>
                  <p className="text-sm text-gray-600">Start at 3:00 PM</p>
                  <p className="text-sm text-gray-500">Duration: 45 minutes</p>
                </div>
                <SmallDonutChart percentage={65} />
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                <div>
                  <h3 className="font-semibold text-gray-800">Oct 8, 2025</h3>
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
