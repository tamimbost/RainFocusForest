import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell } from 'recharts';
import { Play, Pause, Square, CheckCircle, XCircle, Clock, CalendarDays, BarChart3, Edit, Trash2, Music, NotepadText, PlusCircle } from 'lucide-react'; // Removed Lightbulb, MessageSquare

// Utility function to format date for localStorage key
const getFormattedDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// Utility function to get start of week (Sunday)
const getStartOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay(); // 0 for Sunday, 1 for Monday, etc.
    const diff = d.getDate() - day; // Adjust to Sunday
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
};

// Utility function to get start of month
const getStartOfMonth = (date) => {
    const d = new Date(date);
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
};

// Utility function to extract YouTube video ID
const getYouTubeVideoId = (url) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const match = url.match(regex);
    return match ? match[1] : null;
};

// Utility function to format time for display based on user's locale
const formatTimeForDisplay = (timeString) => {
    try {
        const [hours, minutes] = timeString.split(':').map(Number);
        const date = new Date();
        date.setHours(hours, minutes, 0, 0);
        return date.toLocaleTimeString('bn-BD', { hour: 'numeric', minute: '2-digit', hour12: true });
    } catch (e) {
        console.error("সময় ফরম্যাট করতে ত্রুটি:", timeString, e);
        return timeString; // Return original string on error
    }
};

// Initial routine data (default if no custom routine is set)
const defaultInitialRoutine = [
    { id: 1, startTime: "04:30", endTime: "05:00", activity: "ঘুম থেকে ওঠা + ফজর নামাজ", type: "prayer", durationMinutes: 30 },
    { id: 2, startTime: "05:00", endTime: "06:45", activity: "ফোকাসড কাজ সেশন ১ (১.৪৫ ঘণ্টা)", type: "focus", durationMinutes: 105 }, // 1 hour 45 minutes
    { id: 3, startTime: "06:45", endTime: "07:15", activity: "গোসল + হালকা নাশতা", type: "break", durationMinutes: 30 },
    { id: 4, startTime: "07:15", endTime: "10:45", activity: "ফোকাসড কাজ সেশন ২ (৩.২৫ ঘণ্টা)", type: "focus", durationMinutes: 195 }, // 3 hours 15 minutes
    { id: 5, startTime: "10:45", endTime: "11:30", activity: "বিরতি / বিশ্রাম", type: "break", durationMinutes: 45 },
    { id: 6, startTime: "11:30", endTime: "13:45", activity: "ফোকাসড কাজ সেশন ৩ (২.১৫ ঘণ্টা)", type: "focus", durationMinutes: 135 }, // 2 hours 15 minutes
    { id: 7, startTime: "13:45", endTime: "14:30", activity: "যোহর নামাজ + দুপুরের খাবার", type: "prayer", durationMinutes: 45 },
    { id: 8, startTime: "14:30", endTime: "16:45", activity: "ফোকাসড কাজ সেশন ৪ (২.১৫ ঘণ্টা)", type: "focus", durationMinutes: 135 }, // 2 hours 15 minutes
    { id: 9, startTime: "16:45", endTime: "17:15", activity: "আসর নামাজ + রিফ্রেশ", type: "prayer", durationMinutes: 30 },
    { id: 10, startTime: "17:15", endTime: "19:00", activity: "মাগরিব নামাজ + রাতের খাবার", type: "prayer", durationMinutes: 60 },
    { id: 11, startTime: "19:00", endTime: "20:00", activity: "ফোকাসড কাজ সেশন ৫ (১.৪৫ ঘণ্টা)", type: "focus", durationMinutes: 105 }, // 1 hour 45 minutes
    { id: 12, startTime: "20:00", endTime: "22:00", activity: "ফোকাসড কাজ সেশন ৬ (২ ঘণ্টা)", type: "focus", durationMinutes: 120 },
    { id: 13, startTime: "22:00", endTime: "22:30", activity: "এশা নামাজ + রিল্যাক্স", type: "prayer", durationMinutes: 30 },
    { id: 14, startTime: "22:30", endTime: "00:00", activity: "ফোকাসড কাজ সেশন ৭ (১.৩০ ঘণ্টা)", type: "focus", durationMinutes: 90 }, // 1 hour 30 minutes
    { id: 15, startTime: "00:00", endTime: "04:30", activity: "ঘুম (৪.৩০ ঘণ্টা)", type: "sleep", durationMinutes: 270 }
];

// Font Import Component
const FontImport = () => (
    <style>
        {`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;500;700&display=swap');
        body {
            font-family: 'Noto Sans Bengali', sans-serif;
        }
        `}
    </style>
);

// Header Component
function Header({ currentPage, setCurrentPage }) {
    // RainFocusForest Logo SVG
    const RainFocusForestLogo = () => (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
            <path d="M12 2L5 10H8V18H16V10H19L12 2Z" fill="#34D399"/> {/* Top of the tree */}
            <path d="M10 18H14V22H10V18Z" fill="#4B5563"/> {/* Tree trunk */}
            <circle cx="7" cy="7" r="2" fill="#60A5FA"/> {/* Raindrop 1 */}
            <circle cx="17" cy="5" r="1.5" fill="#60A5FA"/> {/* Raindrop 2 */}
            <circle cx="5" cy="12" r="1.8" fill="#60A5FA"/> {/* Raindrop 3 */}
        </svg>
    );

    return (
        <header className="bg-gray-800 shadow-md p-4 flex justify-between items-center sticky top-0 z-10 rounded-b-xl">
            <div className="flex items-center">
                <RainFocusForestLogo />
                <h1 className="text-2xl font-bold text-blue-400">RainFocusForest</h1>
            </div>
            <nav className="flex space-x-4">
                <button
                    onClick={() => setCurrentPage('dashboard')}
                    className={`p-3 rounded-full transition-all duration-300 ${currentPage === 'dashboard' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-700 text-gray-300 hover:bg-blue-900/40'} hover:scale-105 transform`}
                    title="ড্যাশবোর্ড"
                >
                    <CalendarDays size={24} />
                </button>
                <button
                    onClick={() => setCurrentPage('routine')}
                    className={`p-3 rounded-full transition-all duration-300 ${currentPage === 'routine' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-700 text-gray-300 hover:bg-blue-900/40'} hover:scale-105 transform`}
                    title="রুটিন"
                >
                    <Clock size={24} />
                </button>
                <button
                    onClick={() => setCurrentPage('analytics')}
                    className={`p-3 rounded-full transition-all duration-300 ${currentPage === 'analytics' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-700 text-gray-300 hover:bg-blue-900/40'} hover:scale-105 transform`}
                    title="অ্যানালিটিক্স"
                >
                    <BarChart3 size={24} />
                </button>
                <button
                    onClick={() => setCurrentPage('customize-routine')}
                    className={`p-3 rounded-full transition-all duration-300 ${currentPage === 'customize-routine' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-700 text-gray-300 hover:bg-blue-900/40'} hover:scale-105 transform`}
                    title="রুটিন কাস্টমাইজ করুন"
                >
                    <Edit size={24} />
                </button>
                 <button
                    onClick={() => setCurrentPage('focus-music')}
                    className={`p-3 rounded-full transition-all duration-300 ${currentPage === 'focus-music' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-700 text-gray-300 hover:bg-blue-900/40'} hover:scale-105 transform`}
                    title="ফোকাস মিউজিক"
                >
                    <Music size={24} />
                </button>
                {/* Notes button - now directly linked to dashboard's daily notes */}
                <button
                    onClick={() => setCurrentPage('dashboard')} // Keeping the notes on dashboard
                    className={`p-3 rounded-full transition-all duration-300 ${currentPage === 'dashboard' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-700 text-gray-300 hover:bg-blue-900/40'} hover:scale-105 transform`}
                    title="নোটস"
                >
                    <NotepadText size={24} />
                </button>
            </nav>
        </header>
    );
}

// Dashboard Component
function Dashboard({
    totalFocusHoursToday,
    totalExpectedFocusHours,
    completionPercentage,
    customRoutine,
    todayActivities,
    activeSession,
    handleTimerControl,
    handleActivityToggle,
    handleNoteChange,
    congratulationMessage,
    dailyNotes,
    addDailyNote,
    updateDailyNote,
    deleteDailyNote
}) {
    const [newDailyNoteContent, setNewDailyNoteContent] = useState('');
    const [editingDailyNoteId, setEditingDailyNoteId] = useState(null);
    const [editingDailyNoteContent, setEditingDailyNoteContent] = useState('');

    // Data for activity type pie chart
    const activityTypeData = customRoutine.reduce((acc, item) => {
        const existingType = acc.find(data => data.name === item.type);
        if (existingType) {
            existingType.value += item.durationMinutes;
        } else {
            acc.push({ name: item.type, value: item.durationMinutes });
        }
        return acc;
    }, []);

    const PIE_COLORS = ['#8884d8', '#82ca9d', '#FFBB28', '#FF8042', '#AF19FF', '#00C49F']; // More colors for pie chart

    // Data for actual vs. expected focus hours bar chart
    const focusComparisonData = [
        { name: 'লক্ষ্য', hours: parseFloat(totalExpectedFocusHours) },
        { name: 'সম্পন্ন', hours: parseFloat(totalFocusHoursToday) }
    ];

    const handleAddDailyNote = () => {
        if (newDailyNoteContent.trim()) {
            addDailyNote(newDailyNoteContent.trim());
            setNewDailyNoteContent('');
        }
    };

    const handleStartEditingDailyNote = (note) => {
        setEditingDailyNoteId(note.id);
        setEditingDailyNoteContent(note.content);
    };

    const handleSaveEditingDailyNote = (id) => {
        updateDailyNote(id, editingDailyNoteContent.trim());
        setEditingDailyNoteId(null);
        setEditingDailyNoteContent('');
    };

    const handleCancelEditingDailyNote = () => {
        setEditingDailyNoteId(null);
        setEditingDailyNoteContent('');
    };

    return (
        <div className="p-6">
            <h2 className="text-3xl font-bold mb-6 text-gray-100">ড্যাশবোর্ড</h2>

            {congratulationMessage && (
                <div className="bg-green-600 text-white p-4 rounded-lg shadow-md mb-6 text-center text-xl font-semibold animate-bounce-in">
                    {congratulationMessage}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-700 to-indigo-800 text-white p-6 rounded-xl shadow-lg flex flex-col items-center justify-center transform transition-transform hover:scale-105">
                    <p className="text-lg font-semibold mb-2">আজকের মোট ফোকাস ঘণ্টা</p>
                    <p className="text-5xl font-extrabold">{totalFocusHoursToday} <span className="text-2xl">ঘণ্টা</span></p>
                    <p className="text-sm mt-2">লক্ষ্য: {totalExpectedFocusHours} ঘণ্টা</p>
                </div>
                <div className="bg-gradient-to-br from-green-700 to-teal-800 text-white p-6 rounded-xl shadow-lg flex flex-col items-center justify-center transform transition-transform hover:scale-105">
                    <p className="text-lg font-semibold mb-2">সম্পূর্ণতার শতাংশ</p>
                    <p className="text-5xl font-extrabold">{completionPercentage}%</p>
                    <p className="text-sm mt-2">আজকের রুটিনের</p>
                </div>

                {/* Actual vs. Expected Focus Hours Bar Chart */}
                <div className="bg-gray-800 rounded-xl shadow-lg p-4">
                    <h3 className="text-xl font-semibold mb-4 text-gray-200">ফোকাস ঘণ্টা: লক্ষ্য বনাম সম্পন্ন</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={focusComparisonData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={'#4a4a4a'} />
                            <XAxis dataKey="name" stroke={'#9ca3af'} />
                            <YAxis stroke={'#9ca3af'} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#374151', border: 'none', borderRadius: '8px' }}
                                labelStyle={{ color: '#fff' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Bar dataKey="hours" fill="#8884d8" radius={[10, 10, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Activity Type Pie Chart */}
            <div className="bg-gray-800 rounded-xl shadow-lg p-4 mb-8">
                <h3 className="text-xl font-semibold mb-4 text-gray-200">কার্যকলাপের প্রকারভেদ (মোট সময়)</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={activityTypeData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                            {activityTypeData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ backgroundColor: '#374151', border: 'none', borderRadius: '8px' }}
                            labelStyle={{ color: '#fff' }}
                            itemStyle={{ color: '#fff' }}
                        />
                        <Legend wrapperStyle={{ color: '#fff' }} />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Daily Notes Section */}
            <div className="bg-gray-800 rounded-xl shadow-lg p-4 mb-8">
                <h3 className="text-xl font-semibold mb-3 text-gray-200">আজকের নোটস</h3>
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                    <textarea
                        className="flex-grow p-3 rounded-lg bg-gray-700 text-gray-100 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="2"
                        placeholder="আজকের জন্য একটি নোট যোগ করুন..."
                        value={newDailyNoteContent}
                        onChange={(e) => setNewDailyNoteContent(e.target.value)}
                    ></textarea>
                    <button
                        onClick={handleAddDailyNote}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center sm:w-auto w-full"
                    >
                        <PlusCircle size={20} className="mr-2" /> নোট যোগ করুন
                    </button>
                </div>
                <div className="max-h-48 overflow-y-auto">
                    {dailyNotes.length === 0 ? (
                        <p className="text-center text-gray-400">আজকের জন্য কোনো নোট নেই।</p>
                    ) : (
                        dailyNotes.map(note => (
                            <div key={note.id} className="flex items-center justify-between p-3 mb-2 rounded-lg bg-gray-700 shadow-sm">
                                {editingDailyNoteId === note.id ? (
                                    <div className="flex flex-col w-full">
                                        <textarea
                                            className="flex-grow p-2 rounded-lg bg-gray-600 text-gray-100 border border-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 mb-2"
                                            rows="2"
                                            value={editingDailyNoteContent}
                                            onChange={(e) => setEditingDailyNoteContent(e.target.value)}
                                        ></textarea>
                                        <div className="flex justify-end space-x-2">
                                            <button
                                                onClick={() => handleSaveEditingDailyNote(note.id)}
                                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                                            >
                                                সেভ করুন
                                            </button>
                                            <button
                                                onClick={handleCancelEditingDailyNote}
                                                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200"
                                            >
                                                বাতিল করুন
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <p className="text-gray-100 whitespace-pre-wrap">{note.content}</p>
                                        <div className="flex space-x-2 ml-4">
                                            <button
                                                onClick={() => handleStartEditingDailyNote(note)}
                                                className="p-2 rounded-full bg-yellow-500 text-white hover:bg-yellow-600 transition-colors duration-200"
                                                title="এডিট করুন"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => deleteDailyNote(note.id)}
                                                className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors duration-200"
                                                title="মুছে ফেলুন"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Routine Optimization Section and Motivational Quote Section removed */}


            <h3 className="text-2xl font-semibold mb-4 text-gray-200">আজকের রুটিন স্ট্যাটাস</h3>
            <div className="bg-gray-800 rounded-xl shadow-lg p-4 max-h-96 overflow-y-auto">
                {customRoutine.map((item) => {
                    const activityStatus = todayActivities.find(a => a.id === item.id);
                    const isCompleted = activityStatus?.completed;
                    const isFocusSession = item.type === 'focus';
                    const isActive = activeSession && activeSession.id === item.id;
                    const remainingSeconds = isActive ? activeSession.remainingTime : 0;
                    const minutes = Math.floor(remainingSeconds / 60);
                    const seconds = remainingSeconds % 60;

                    return (
                        <div
                            key={item.id}
                            className={`flex items-center justify-between p-3 mb-2 rounded-lg transition-all duration-300
                                ${isCompleted
                                    ? 'bg-green-900/30' // Completed style
                                    : isActive
                                        ? 'bg-emerald-700 text-white' // Active focus session style
                                        : 'bg-gray-700' // Default incomplete style
                                }
                                ${isActive ? 'border-2 border-blue-400' : ''}
                                shadow-sm`}
                        >
                            <div className="flex items-center flex-grow">
                                {isCompleted ? (
                                    <CheckCircle className="text-green-500 mr-3 flex-shrink-0" size={20} />
                                ) : (
                                    <XCircle className={`${isActive ? 'text-white' : 'text-red-500'} mr-3 flex-shrink-0`} size={20} />
                                )}
                                <div className="flex-grow">
                                    <p className={`font-medium ${isActive ? 'text-white' : 'text-gray-100'}`}>{item.activity}</p>
                                    <p className={`text-sm ${isActive ? 'text-gray-200' : 'text-gray-400'}`}>
                                        {formatTimeForDisplay(item.startTime)} – {formatTimeForDisplay(item.endTime)}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
                                {isFocusSession && (
                                    <>
                                        {isActive ? (
                                            <div className="flex items-center space-x-2">
                                                <span className="font-bold text-2xl text-yellow-400"> {/* Large timer text */}
                                                    {`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`}
                                                </span>
                                                <button
                                                    onClick={() => handleTimerControl(item.id, 'pause')}
                                                    className="p-2 rounded-full bg-yellow-500 text-white hover:bg-yellow-600 transition-colors duration-200 shadow-md"
                                                    title="সেশন বিরতি দিন"
                                                >
                                                    <Pause size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleTimerControl(item.id, 'complete')}
                                                    className="p-2 rounded-md bg-red-500 text-white hover:bg-red-600 transition-colors duration-200 shadow-md" // Square button
                                                    title="সেশন সম্পন্ন করুন"
                                                >
                                                    <Square size={18} />
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleTimerControl(item.id, 'start')}
                                                className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-200 shadow-md"
                                                title="সেশন শুরু করুন"
                                            >
                                                <Play size={18} />
                                            </button>
                                        )}
                                    </>
                                )}
                                {!isFocusSession && ( // For non-focus activities, just toggle completion
                                    <button
                                        onClick={() => handleActivityToggle(item.id)}
                                        className={`p-2 rounded-full ${isCompleted ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white transition-colors duration-200 shadow-md`}
                                        title={isCompleted ? "অসম্পূর্ণ চিহ্নিত করুন" : "সম্পূর্ণ চিহ্নিত করুন"}
                                    >
                                        {isCompleted ? <XCircle size={18} /> : <CheckCircle size={18} />}
                                    </button>
                                )}
                                {isCompleted && (
                                    <button
                                        onClick={() => {
                                            const currentNote = todayActivities.find(a => a.id === item.id)?.notes || '';
                                            const newNote = prompt("সেশনের নোট লিখুন:", currentNote);
                                            if (newNote !== null) {
                                                handleNoteChange(item.id, newNote);
                                            }
                                        }}
                                        className="p-2 rounded-full bg-purple-500 text-white hover:bg-purple-600 transition-colors duration-200 shadow-md"
                                        title="নোট যোগ/সম্পাদনা করুন"
                                    >
                                        <NotepadText size={18} />
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// Routine Component
function Routine({ customRoutine }) {
    return (
        <div className="p-6">
            <h2 className="text-3xl font-bold mb-6 text-gray-100">আমার রুটিন</h2>
            <div className="bg-gray-800 rounded-xl shadow-lg p-4 max-h-[80vh] overflow-y-auto">
                {customRoutine.map((item) => (
                    <div key={item.id} className="flex items-center p-3 mb-2 rounded-lg bg-gray-700 shadow-sm">
                        <Clock className="text-blue-500 mr-3 flex-shrink-0" size={20} />
                        <div>
                            <p className="font-medium text-gray-100">{item.activity}</p>
                            <p className="text-sm text-gray-400">
                                {formatTimeForDisplay(item.startTime)} – {formatTimeForDisplay(item.endTime)}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Analytics Component
function Analytics({ dailyRecords }) {
    // Analytics data preparation
    const getDailyChartData = () => {
        const data = [];
        const todayDate = new Date();
        for (let i = 6; i >= 0; i--) { // Last 7 days
            const date = new Date(todayDate);
            date.setDate(todayDate.getDate() - i);
            const formattedDate = getFormattedDate(date);
            const record = dailyRecords[formattedDate];
            data.push({
                name: date.toLocaleDateString('bn-BD', { weekday: 'short', day: 'numeric' }),
                'ফোকাস ঘণ্টা': record ? (record.totalFocusMinutes / 60).toFixed(2) : 0
            });
        }
        return data;
    };

    const getWeeklyChartData = () => {
        const data = {};
        const todayDate = new Date();
        for (let i = 0; i < 8 * 7; i++) { // Last 8 weeks
            const date = new Date(todayDate);
            date.setDate(todayDate.getDate() - i);
            const startOfWeek = getStartOfWeek(date);
            const weekKey = getFormattedDate(startOfWeek);
            if (!data[weekKey]) {
                data[weekKey] = 0;
            }
            const formattedDate = getFormattedDate(date);
            if (dailyRecords[formattedDate]) {
                data[weekKey] += dailyRecords[formattedDate].totalFocusMinutes;
            }
        }
        // Sort by week start date to ensure correct order
        return Object.keys(data).sort().map(key => ({
            name: new Date(key).toLocaleDateString('bn-BD', { month: 'short', day: 'numeric' }),
            'ফোকাস ঘণ্টা': (data[key] / 60).toFixed(2)
        }));
    };

    const getMonthlyChartData = () => {
        const data = {};
        const todayDate = new Date();
        for (let i = 0; i < 12 * 30; i++) { // Last 12 months (approx)
            const date = new Date(todayDate);
            date.setDate(todayDate.getDate() - i);
            const startOfMonth = getStartOfMonth(date);
            const monthKey = getFormattedDate(startOfMonth).substring(0, 7); //YYYY-MM
            if (!data[monthKey]) {
                data[monthKey] = 0;
            }
            const formattedDate = getFormattedDate(date);
            if (dailyRecords[formattedDate]) {
                data[monthKey] += dailyRecords[formattedDate].totalFocusMinutes;
            }
        }
        // Sort by month and format
        return Object.keys(data).sort().map(key => ({
            name: new Date(key + '-01').toLocaleDateString('bn-BD', { month: 'short', year: '2-digit' }),
            'ফোকাস ঘণ্টা': (data[key] / 60).toFixed(2)
        }));
    };

    const dailyData = getDailyChartData();
    const weeklyData = getWeeklyChartData();
    const monthlyData = getMonthlyChartData();

    return (
        <div className="p-6">
            <h2 className="text-3xl font-bold mb-6 text-gray-100">ডেটা অ্যানালিটিক্স</h2>

            <div className="mb-8 bg-gray-800 rounded-xl shadow-lg p-4">
                <h3 className="text-xl font-semibold mb-4 text-gray-200">দৈনিক ফোকাস ঘণ্টা (গত ৭ দিন)</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dailyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={'#4a4a4a'} />
                        <XAxis dataKey="name" stroke={'#9ca3af'} />
                        <YAxis stroke={'#9ca3af'} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#374151', border: 'none', borderRadius: '8px' }}
                            labelStyle={{ color: '#fff' }}
                            itemStyle={{ color: '#fff' }}
                        />
                        <Bar dataKey="ফোকাস ঘণ্টা" fill="#8884d8" radius={[10, 10, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="mb-8 bg-gray-800 rounded-xl shadow-lg p-4">
                <h3 className="text-xl font-semibold mb-4 text-gray-200">সাপ্তাহিক ফোকাস ঘণ্টা (গত ৮ সপ্তাহ)</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={weeklyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={'#4a4a4a'} />
                        <XAxis dataKey="name" stroke={'#9ca3af'} />
                        <YAxis stroke={'#9ca3af'} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#374151', border: 'none', borderRadius: '8px' }}
                            labelStyle={{ color: '#fff' }}
                            itemStyle={{ color: '#fff' }}
                        />
                        <Line type="monotone" dataKey="ফোকাস ঘণ্টা" stroke="#82ca9d" strokeWidth={3} dot={{ r: 6 }} activeDot={{ r: 8 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div className="mb-8 bg-gray-800 rounded-xl shadow-lg p-4">
                <h3 className="text-xl font-semibold mb-4 text-gray-200">মাসিক ফোকাস ঘণ্টা (গত ১২ মাস)</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={'#4a4a4a'} />
                        <XAxis dataKey="name" stroke={'#9ca3af'} />
                        <YAxis stroke={'#9ca3af'} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#374151', border: 'none', borderRadius: '8px' }}
                            labelStyle={{ color: '#fff' }}
                            itemStyle={{ color: '#fff' }}
                        />
                        <Line type="monotone" dataKey="ফোকাস ঘণ্টা" stroke="#ffc658" strokeWidth={3} dot={{ r: 6 }} activeDot={{ r: 8 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

// Customize Routine Component
function CustomizeRoutine({ customRoutine, addRoutineItem, updateRoutineItem, deleteRoutineItem }) {
    const [newItem, setNewItem] = useState({ startTime: '', endTime: '', activity: '', type: 'focus', durationMinutes: 0 });
    const [editingItem, setEditingItem] = useState(null);

    const handleAddItem = () => {
        if (newItem.activity && newItem.startTime && newItem.endTime) {
            addRoutineItem(newItem);
            setNewItem({ startTime: '', endTime: '', activity: '', type: 'focus', durationMinutes: 0 });
        } else {
            console.log('সময় এবং কার্যকলাপ উভয়ই পূরণ করুন।');
        }
    };

    const handleUpdateItem = () => {
        if (editingItem && editingItem.activity && editingItem.startTime && editingItem.endTime) {
            updateRoutineItem(editingItem.id, editingItem);
            setEditingItem(null);
            setNewItem({ startTime: '', endTime: '', activity: '', type: 'focus', durationMinutes: 0 });
        } else {
            console.log('সময় এবং কার্যকলাপ উভয়ই পূরণ করুন।');
        }
    };

    return (
        <div className="p-6">
            <h2 className="text-3xl font-bold mb-6 text-gray-100">রুটিন কাস্টমাইজ করুন</h2>

            {/* Add/Edit Routine Item Form */}
            <div className="bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
                <h3 className="text-xl font-semibold mb-4 text-gray-200">{editingItem ? 'রুটিন আইটেম এডিট করুন' : 'নতুন রুটিন আইটেম যোগ করুন'}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                        type="time"
                        placeholder="শুরুর সময়"
                        className="p-3 rounded-lg bg-gray-700 text-gray-100 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={editingItem ? editingItem.startTime : newItem.startTime}
                        onChange={(e) => editingItem ? setEditingItem({ ...editingItem, startTime: e.target.value }) : setNewItem({ ...newItem, startTime: e.target.value })}
                    />
                    <input
                        type="time"
                        placeholder="শেষের সময়"
                        className="p-3 rounded-lg bg-gray-700 text-gray-100 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={editingItem ? editingItem.endTime : newItem.endTime}
                        onChange={(e) => editingItem ? setEditingItem({ ...editingItem, endTime: e.target.value }) : setNewItem({ ...newItem, endTime: e.target.value })}
                    />
                    <input
                        type="text"
                        placeholder="কার্যকলাপ (যেমন: ফোকাসড কাজ)"
                        className="p-3 rounded-lg bg-gray-700 text-gray-100 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={editingItem ? editingItem.activity : newItem.activity}
                        onChange={(e) => editingItem ? setEditingItem({ ...editingItem, activity: e.target.value }) : setNewItem({ ...newItem, activity: e.target.value })}
                    />
                    <select
                        className="p-3 rounded-lg bg-gray-700 text-gray-100 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={editingItem ? editingItem.type : newItem.type}
                        onChange={(e) => {
                            const selectedType = e.target.value;
                            if (editingItem) {
                                setEditingItem({ ...editingItem, type: selectedType, durationMinutes: selectedType === 'focus' ? editingItem.durationMinutes : 0 });
                            } else {
                                setNewItem({ ...newItem, type: selectedType, durationMinutes: selectedType === 'focus' ? newItem.durationMinutes : 0 });
                            }
                        }}
                    >
                        <option value="focus">ফোকাসড কাজ</option>
                        <option value="prayer">নামাজ</option>
                        <option value="break">বিরতি</option>
                        <option value="sleep">ঘুম</option>
                        <option value="other">অন্যান্য</option>
                    </select>
                    {(editingItem ? editingItem.type === 'focus' : newItem.type === 'focus') && (
                        <input
                            type="number"
                            placeholder="সময়কাল (মিনিট)"
                            className="p-3 rounded-lg bg-gray-700 text-gray-100 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={editingItem ? editingItem.durationMinutes : newItem.durationMinutes}
                            onChange={(e) => {
                                const value = parseInt(e.target.value);
                                if (editingItem) {
                                    setEditingItem({ ...editingItem, durationMinutes: isNaN(value) ? 0 : value });
                                } else {
                                    setNewItem({ ...newItem, durationMinutes: isNaN(value) ? 0 : value });
                                }
                            }}
                        />
                    )}
                </div>
                <div className="mt-6 flex justify-end space-x-4">
                    {editingItem ? (
                        <>
                            <button
                                onClick={handleUpdateItem}
                                className="px-6 py-3 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition-colors duration-200 flex items-center"
                            >
                                <Edit size={20} className="mr-2" /> আপডেট করুন
                            </button>
                            <button
                                onClick={() => { setEditingItem(null); setNewItem({ startTime: '', endTime: '', activity: '', type: 'focus', durationMinutes: 0 }); }}
                                className="px-6 py-3 bg-gray-500 text-white rounded-lg shadow-md hover:bg-gray-600 transition-colors duration-200"
                            >
                                বাতিল করুন
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={handleAddItem}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-200 flex items-center"
                        >
                            <PlusCircle size={20} className="mr-2" /> যোগ করুন
                        </button>
                    )}
                </div>
            </div>

            {/* Current Custom Routine List */}
            <h3 className="text-2xl font-semibold mb-4 text-gray-200">বর্তমান কাস্টম রুটিন</h3>
            <div className="bg-gray-800 rounded-xl shadow-lg p-4 max-h-[40vh] overflow-y-auto">
                {customRoutine.length === 0 ? (
                    <p className="text-center text-gray-400">কোনো রুটিন আইটেম নেই।</p>
                ) : (
                    customRoutine.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-3 mb-2 rounded-lg bg-gray-700 shadow-sm">
                            <div>
                                <p className="font-medium text-gray-100">{item.activity} ({item.type === 'focus' ? `${item.durationMinutes} মিনিট` : item.type === 'prayer' ? 'নামাজ' : item.type === 'break' ? 'বিরতি' : 'ঘুম'})</p>
                                <p className="text-sm text-gray-400">
                                    {formatTimeForDisplay(item.startTime)} – {formatTimeForDisplay(item.endTime)}
                                </p>
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => setEditingItem(item)}
                                    className="p-2 rounded-full bg-yellow-500 text-white hover:bg-yellow-600 transition-colors duration-200"
                                    title="এডিট করুন"
                                >
                                    <Edit size={18} />
                                </button>
                                <button
                                    onClick={() => deleteRoutineItem(item.id)}
                                    className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors duration-200"
                                    title="মুছে ফেলুন"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

// Focus Music Player Component
function FocusMusicPlayer({ youtubePlaylist, setYoutubePlaylist, currentVideoIndex, setCurrentVideoIndex }) {
    const [newVideoUrl, setNewVideoUrl] = useState('');

    useEffect(() => {
        localStorage.setItem('youtubePlaylist', JSON.stringify(youtubePlaylist));
    }, [youtubePlaylist]);

    useEffect(() => {
        localStorage.setItem('currentVideoIndex', JSON.stringify(currentVideoIndex));
    }, [currentVideoIndex]);

    const handleAddVideo = async () => {
        const videoId = getYouTubeVideoId(newVideoUrl);
        if (videoId) {
            // Optional: Fetch video title from YouTube API if needed for better UX
            // For simplicity, we'll use a generic title or try to extract from URL
            const newVideo = { id: videoId, title: `ভিডিও ${youtubePlaylist.length + 1}` }; // Generic title
            setYoutubePlaylist(prev => [...prev, newVideo]);
            setNewVideoUrl('');
        } else {
            alert('অনুগ্রহ করে একটি বৈধ YouTube URL দিন।');
        }
    };

    const handleRemoveVideo = (indexToRemove) => {
        setYoutubePlaylist(prev => prev.filter((_, index) => index !== indexToRemove));
        if (indexToRemove === currentVideoIndex) {
            setCurrentVideoIndex(0); // Reset to first if current video is removed
        } else if (indexToRemove < currentVideoIndex) {
            setCurrentVideoIndex(prev => Math.max(0, prev - 1)); // Adjust index if previous video is removed
        }
    };

    const handleNextVideo = () => {
        if (youtubePlaylist.length > 0) {
            setCurrentVideoIndex(prev => (prev + 1) % youtubePlaylist.length);
        }
    };

    const handlePrevVideo = () => {
        if (youtubePlaylist.length > 0) {
            setCurrentVideoIndex(prev => (prev - 1 + youtubePlaylist.length) % youtubePlaylist.length);
        }
    };

    const currentVideoId = youtubePlaylist.length > 0 ? youtubePlaylist[currentVideoIndex]?.id : null;

    return (
        <div className="p-6">
            <h2 className="text-3xl font-bold mb-6 text-gray-100">ফোকাস মিউজিক প্লেয়ার</h2>

            <div className="bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
                <h3 className="text-xl font-semibold mb-4 text-gray-200">ভিডিও যোগ করুন</h3>
                <div className="flex space-x-2 mb-4">
                    <input
                        type="text"
                        placeholder="YouTube ভিডিও URL"
                        className="flex-grow p-3 rounded-lg bg-gray-700 text-gray-100 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={newVideoUrl}
                        onChange={(e) => setNewVideoUrl(e.target.value)}
                    />
                    <button
                        onClick={handleAddVideo}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-200"
                    >
                        যোগ করুন
                    </button>
                </div>

                {youtubePlaylist.length > 0 && (
                    <div className="mb-4">
                        <h4 className="text-lg font-medium mb-2 text-gray-200">প্লেলিস্ট</h4>
                        <ul className="max-h-40 overflow-y-auto bg-gray-700 rounded-lg p-2">
                            {youtubePlaylist.map((video, index) => (
                                <li key={video.id + index} className={`flex items-center justify-between p-2 rounded-md mb-1 ${index === currentVideoIndex ? 'bg-blue-900/30' : 'hover:bg-gray-600'}`}>
                                    <span className="text-gray-100 cursor-pointer" onClick={() => setCurrentVideoIndex(index)}>
                                        {video.title}
                                    </span>
                                    <button
                                        onClick={() => handleRemoveVideo(index)}
                                        className="p-1 rounded-full text-red-500 hover:bg-red-900/20"
                                        title="মুছে ফেলুন"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {currentVideoId && (
                    <div className="relative pt-[56.25%] mb-4 rounded-lg overflow-hidden shadow-xl"> {/* 16:9 aspect ratio */}
                        <iframe
                            className="absolute top-0 left-0 w-full h-full"
                            src={`https://www.youtube.com/embed/${currentVideoId}?autoplay=1&rel=0`}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            title="YouTube video player"
                        ></iframe>
                    </div>
                )}

                {youtubePlaylist.length > 1 && (
                    <div className="flex justify-center space-x-4 mt-4">
                        <button
                            onClick={handlePrevVideo}
                            className="px-4 py-2 bg-gray-600 text-gray-100 rounded-lg shadow-md hover:bg-gray-700 transition-colors duration-200"
                        >
                            পূর্ববর্তী
                        </button>
                        <button
                            onClick={handleNextVideo}
                            className="px-4 py-2 bg-gray-600 text-gray-100 rounded-lg shadow-md hover:bg-gray-700 transition-colors duration-200"
                        >
                            পরবর্তী
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

// Main App Component
function App() {
    const [dailyRecords, setDailyRecords] = useState({});
    const [todayActivities, setTodayActivities] = useState([]);
    const [activeSession, setActiveSession] = useState(null);
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [customRoutine, setCustomRoutine] = useState([]);
    const [congratulationMessage, setCongratulationMessage] = useState('');
    const [dailyNotes, setDailyNotes] = useState([]); // State for daily notes

    // Removed states for LLM features: optimizedRoutineSuggestion, loadingOptimization, motivationalQuote, loadingQuote

    const [youtubePlaylist, setYoutubePlaylist] = useState([]);
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

    const timerIntervalRef = useRef(null);

    const totalExpectedFocusMinutes = customRoutine
        .filter(item => item.type === 'focus')
        .reduce((sum, item) => sum + item.durationMinutes, 0);
    const totalExpectedFocusHours = (totalExpectedFocusMinutes / 60).toFixed(2);


    // Load data from localStorage on initial render
    useEffect(() => {
        // Set dark mode permanently
        document.documentElement.classList.add('dark');
        console.log("Initial load - Dark Mode is permanently enabled.");
        console.log("Initial load - document.documentElement.classList:", document.documentElement.classList.value);

        const savedDailyRecords = localStorage.getItem('dailyRecords');
        if (savedDailyRecords) {
            setDailyRecords(JSON.parse(savedDailyRecords));
        }

        // Improved logic for loading custom routine
        const savedCustomRoutine = localStorage.getItem('customRoutine');
        let initialRoutine = defaultInitialRoutine;
        if (savedCustomRoutine) {
            try {
                const parsedRoutine = JSON.parse(savedCustomRoutine);
                // If the loaded routine is an array and has items, use it
                if (Array.isArray(parsedRoutine) && parsedRoutine.length > 0) {
                    initialRoutine = parsedRoutine;
                }
            } catch (e) {
                console.error("Error parsing custom routine:", e);
                // If parsing error, use default routine
            }
        }
        setCustomRoutine(initialRoutine);

        const today = getFormattedDate(new Date());
        const savedTodayActivities = localStorage.getItem(`activities_${today}`);
        if (savedTodayActivities) {
            setTodayActivities(JSON.parse(savedTodayActivities));
        } else {
            // Initialize today's activities based on initialRoutine (which is now either default or loaded custom routine)
            setTodayActivities(initialRoutine.map(item => ({
                id: item.id,
                completed: false,
                notes: '',
                focusTimeLogged: 0
            })));
        }

        const savedActiveSession = localStorage.getItem('activeSession');
        if (savedActiveSession) {
            setActiveSession(JSON.parse(savedActiveSession));
        }

        const savedYoutubePlaylist = localStorage.getItem('youtubePlaylist');
        if (savedYoutubePlaylist) {
            setYoutubePlaylist(JSON.parse(savedYoutubePlaylist));
        }

        const savedCurrentVideoIndex = localStorage.getItem('currentVideoIndex');
        if (savedCurrentVideoIndex !== null) {
            setCurrentVideoIndex(JSON.parse(savedCurrentVideoIndex));
        }

        // Load daily notes for the current day
        const savedDailyNotes = localStorage.getItem(`dailyNotes_${today}`);
        if (savedDailyNotes) {
            setDailyNotes(JSON.parse(savedDailyNotes));
        } else {
            setDailyNotes([]); // Initialize empty for a new day
        }
    }, []); // This useEffect runs only once

    // Request notification permission on app load
    useEffect(() => {
        if (!("Notification" in window)) {
            console.log("This browser does not support desktop notifications");
        } else if (Notification.permission !== "granted" && Notification.permission !== "denied") {
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    console.log("Notification permission granted.");
                } else {
                    console.log("Notification permission denied.");
                }
            });
        }
    }, []);

    // Function to send desktop notifications
    const sendNotification = (title, body) => {
        if (Notification.permission === "granted") {
            new Notification(title, { body });
        } else if (Notification.permission !== "denied") {
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    new Notification(title, { body });
                }
            });
        }
    };


    // Save data to localStorage when state changes
    useEffect(() => {
        localStorage.setItem('dailyRecords', JSON.stringify(dailyRecords));
    }, [dailyRecords]);

    useEffect(() => {
        localStorage.setItem('customRoutine', JSON.stringify(customRoutine));
        // Re-initialize today's activities if custom routine changes
        const today = getFormattedDate(new Date());
        const currentDayActivities = localStorage.getItem(`activities_${today}`);
        // If today's activities length doesn't match custom routine length, re-initialize
        if (!currentDayActivities || JSON.parse(currentDayActivities).length !== customRoutine.length) {
             setTodayActivities(customRoutine.map(item => ({
                id: item.id,
                completed: false,
                notes: '',
                focusTimeLogged: 0
            })));
        }
    }, [customRoutine]);

    useEffect(() => {
        const today = getFormattedDate(new Date());
        localStorage.setItem(`activities_${today}`, JSON.stringify(todayActivities));
    }, [todayActivities]);

    useEffect(() => {
        localStorage.setItem('activeSession', JSON.stringify(activeSession));
        if (activeSession && !activeSession.isPaused) {
            startTimer();
        } else {
            stopTimer();
        }
        return () => stopTimer(); // Cleanup on unmount
    }, [activeSession]);

    // Save daily notes to localStorage when state changes
    useEffect(() => {
        const today = getFormattedDate(new Date());
        localStorage.setItem(`dailyNotes_${today}`, JSON.stringify(dailyNotes));
    }, [dailyNotes]);


    // Timer Logic
    const startTimer = () => {
        if (timerIntervalRef.current) return; // Prevent multiple intervals
        timerIntervalRef.current = setInterval(() => {
            setActiveSession(prev => {
                if (!prev || prev.isPaused || prev.remainingTime <= 0) {
                    stopTimer();
                    if (prev && prev.remainingTime <= 0) {
                        handleSessionComplete(prev.id, prev.originalDurationMinutes);
                    }
                    return prev;
                }
                return { ...prev, remainingTime: prev.remainingTime - 1 };
            });
        }, 1000);
    };

    const stopTimer = () => {
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
        }
    };

    const handleTimerControl = (itemId, type) => {
        const routineItem = customRoutine.find(item => item.id === itemId);
        if (!routineItem || routineItem.type !== 'focus') return;

        if (type === 'start') {
            if (activeSession && activeSession.id !== itemId) {
                // If another session is active, complete it first or warn the user
                handleSessionComplete(activeSession.id, activeSession.originalDurationMinutes - activeSession.remainingTime);
            }
            setActiveSession({
                id: itemId,
                startTime: Date.now(),
                remainingTime: routineItem.durationMinutes * 60, // Convert minutes to seconds
                originalDurationMinutes: routineItem.durationMinutes,
                isPaused: false
            });
            sendNotification('Task Started!', `${routineItem.activity} has started.`);
        } else if (type === 'pause') {
            setActiveSession(prev => prev ? { ...prev, isPaused: true } : null);
            stopTimer();
        } else if (type === 'complete') {
            if (activeSession && activeSession.id === itemId) {
                handleSessionComplete(itemId, activeSession.originalDurationMinutes - activeSession.remainingTime);
            } else {
                // If not active, mark as complete with full duration
                handleSessionComplete(itemId, routineItem.durationMinutes);
            }
        }
    };

    const handleSessionComplete = (itemId, loggedDurationMinutes) => {
        stopTimer();
        setActiveSession(null);

        const routineItem = customRoutine.find(item => item.id === itemId);
        // Show congratulation message
        setCongratulationMessage(`অভিনন্দন! "${routineItem.activity}" টাস্কটি সম্পন্ন হয়েছে!`);
        sendNotification('Task Completed!', `${routineItem.activity} has been completed.`);
        setTimeout(() => setCongratulationMessage(''), 5000); // Remove message after 5 seconds

        const today = getFormattedDate(new Date());
        setDailyRecords(prevRecords => {
            const currentDayRecord = prevRecords[today] || { activities: {}, totalFocusMinutes: 0 };
            const updatedActivitiesRecord = {
                ...currentDayRecord.activities,
                [itemId]: { completed: true, notes: todayActivities.find(a => a.id === itemId)?.notes || '', focusTimeLogged: loggedDurationMinutes }
            };
            const newTotalFocusMinutes = Object.values(updatedActivitiesRecord).reduce((sum, act) => sum + (act.focusTimeLogged || 0), 0);

            return {
                ...prevRecords,
                [today]: {
                    activities: updatedActivitiesRecord,
                    totalFocusMinutes: newTotalFocusMinutes
                }
            };
        });
        setTodayActivities(prevActivities => {
            return prevActivities.map(activity =>
                activity.id === itemId
                    ? { ...activity, completed: true, focusTimeLogged: loggedDurationMinutes }
                    : activity
            );
        });
    };

    const handleActivityToggle = (id) => {
        const today = getFormattedDate(new Date());
        setDailyRecords(prevRecords => {
            const currentDayRecord = prevRecords[today] || { activities: {}, totalFocusMinutes: 0 };
            const routineItem = customRoutine.find(item => item.id === id);
            
            const isCurrentlyCompleted = todayActivities.find(a => a.id === id)?.completed;
            const newCompletedStatus = !isCurrentlyCompleted;

            let newTotalFocusMinutes = currentDayRecord.totalFocusMinutes;
            const updatedActivityRecord = {
                ...currentDayRecord.activities[id],
                completed: newCompletedStatus,
                notes: todayActivities.find(a => a.id === id)?.notes || '',
                focusTimeLogged: (routineItem.type === 'focus' && newCompletedStatus)
                    ? routineItem.durationMinutes
                    : 0
            };

            if (routineItem.type === 'focus') {
                const allActivitiesForToday = { ...currentDayRecord.activities, [id]: updatedActivityRecord };
                newTotalFocusMinutes = Object.values(allActivitiesForToday).reduce((sum, act) => sum + (act.focusTimeLogged || 0), 0);
            }

            return {
                ...prevRecords,
                [today]: {
                    activities: { ...currentDayRecord.activities, [id]: updatedActivityRecord },
                    totalFocusMinutes: newTotalFocusMinutes
                }
            };
        });
        setTodayActivities(prevActivities => {
            return prevActivities.map(activity =>
                activity.id === id
                    ? { ...activity, completed: !activity.completed }
                    : activity
            );
        });
    };

    const handleNoteChange = (id, note) => {
        setTodayActivities(prevActivities =>
            prevActivities.map(activity =>
                activity.id === id ? { ...activity, notes: note } : activity
            )
        );
        // Update dailyRecords immediately for notes
        const today = getFormattedDate(new Date());
        setDailyRecords(prevRecords => {
            const currentDayRecord = prevRecords[today] || { activities: {}, totalFocusMinutes: 0 };
            const updatedActivityRecord = {
                ...currentDayRecord.activities[id],
                notes: note
            };
            return {
                ...prevRecords,
                [today]: {
                    ...currentDayRecord,
                    activities: { ...currentDayRecord.activities, [id]: updatedActivityRecord }
                }
            };
        });
    };

    // Daily Notes functions
    const addDailyNote = (content) => {
        const newNote = {
            id: Date.now(),
            content: content,
            createdAt: new Date().toISOString()
        };
        setDailyNotes(prev => [...prev, newNote]);
    };

    const updateDailyNote = (id, newContent) => {
        setDailyNotes(prev => prev.map(note =>
            note.id === id ? { ...note, content: newContent } : note
        ));
    };

    const deleteDailyNote = (id) => {
        setDailyNotes(prev => prev.filter(note => note.id !== id));
    };

    // Removed LLM Integration functions: generateRoutineOptimization, generateMotivationalQuote


    // Routine Customization Functions
    const addRoutineItem = (item) => {
        setCustomRoutine(prev => [...prev, { ...item, id: prev.length > 0 ? Math.max(...prev.map(r => r.id)) + 1 : 1 }]);
    };

    const updateRoutineItem = (id, updatedItem) => {
        setCustomRoutine(prev => prev.map(item => item.id === id ? { ...item, ...updatedItem } : item));
    };

    const deleteRoutineItem = (id) => {
        setCustomRoutine(prev => prev.filter(item => item.id !== id));
    };

    // Dashboard calculations
    const today = getFormattedDate(new Date());
    const currentDayRecord = dailyRecords[today] || { activities: {}, totalFocusMinutes: 0 };
    const totalFocusHoursToday = (currentDayRecord.totalFocusMinutes / 60).toFixed(2);

    const completedActivitiesCount = todayActivities.filter(activity => activity.completed).length;
    const completionPercentage = customRoutine.length > 0
        ? ((completedActivitiesCount / customRoutine.length) * 100).toFixed(0)
        : 0;

    const renderPage = () => {
        switch (currentPage) {
            case 'dashboard':
                return (
                    <Dashboard
                        totalFocusHoursToday={totalFocusHoursToday}
                        totalExpectedFocusHours={totalExpectedFocusHours}
                        completionPercentage={completionPercentage}
                        customRoutine={customRoutine}
                        todayActivities={todayActivities}
                        activeSession={activeSession}
                        handleTimerControl={handleTimerControl}
                        handleActivityToggle={handleActivityToggle}
                        handleNoteChange={handleNoteChange}
                        congratulationMessage={congratulationMessage}
                        dailyNotes={dailyNotes}
                        addDailyNote={addDailyNote}
                        updateDailyNote={updateDailyNote}
                        deleteDailyNote={deleteDailyNote}
                        // Removed props for LLM features
                    />
                );
            case 'routine':
                return <Routine customRoutine={customRoutine} />;
            case 'analytics':
                return <Analytics dailyRecords={dailyRecords} />;
            case 'customize-routine':
                return (
                    <CustomizeRoutine
                        customRoutine={customRoutine}
                        addRoutineItem={addRoutineItem}
                        updateRoutineItem={updateRoutineItem}
                        deleteRoutineItem={deleteRoutineItem}
                    />
                );
            case 'focus-music':
                return (
                    <FocusMusicPlayer
                        youtubePlaylist={youtubePlaylist}
                        setYoutubePlaylist={setYoutubePlaylist}
                        currentVideoIndex={currentVideoIndex}
                        setCurrentVideoIndex={setCurrentVideoIndex}
                    />
                );
            default: // Default to dashboard if no valid page is found
                return (
                    <Dashboard
                        totalFocusHoursToday={totalFocusHoursToday}
                        totalExpectedFocusHours={totalExpectedFocusHours}
                        completionPercentage={completionPercentage}
                        customRoutine={customRoutine}
                        todayActivities={todayActivities}
                        activeSession={activeSession}
                        handleTimerControl={handleTimerControl}
                        handleActivityToggle={handleActivityToggle}
                        handleNoteChange={handleNoteChange}
                        congratulationMessage={congratulationMessage}
                        dailyNotes={dailyNotes}
                        addDailyNote={addDailyNote}
                        updateDailyNote={updateDailyNote}
                        deleteDailyNote={deleteDailyNote}
                        // Removed props for LLM features
                    />
                );
        }
    };

    return (
        <div className={`min-h-screen flex flex-col font-noto-sans-bengali bg-gray-900 text-gray-100`}>
            <FontImport /> {/* Include the font import component */}
            <Header currentPage={currentPage} setCurrentPage={setCurrentPage} />
            {/* Main Content Area */}
            <main className="flex-grow p-4">
                {renderPage()}
            </main>
        </div>
    );
}

export default App;
