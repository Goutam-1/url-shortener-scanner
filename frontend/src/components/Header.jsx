import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useRef, useEffect } from "react";
import {
    ChevronDown,
    LayoutDashboard,
    Shield,
    LogOut,
} from "lucide-react";








export default function Header() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);

    function handleLogout() {
        logout();
        navigate('/');
    }



    useEffect(() => {
        function handleClickOutside(e) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);

        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);













    return (
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center transition-transform group-hover:scale-105">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <span className="text-lg font-bold text-gray-900 tracking-tight">LinkHub</span>
                </Link>
                {user ?
                    (<div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setOpen(!open)}
                            className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-100 transition"
                        >
                            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
                                {user?.name?.charAt(0).toUpperCase()}
                            </div>

                            <div className="hidden sm:block text-left">
                                <p className="text-sm font-semibold text-gray-900">
                                    {user?.name}
                                </p>
                            </div>

                            <ChevronDown
                                size={18}
                                className={`transition ${open ? "rotate-180" : ""
                                    }`}
                            />
                        </button>

                        {open && (
                            <div className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">

                                {/* User Info */}
                                <button
                                    onClick={() => {
                                        navigate("/dashboard");
                                        setOpen(false);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-4 hover:bg-gray-50"
                                >
                                    <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-lg">
                                        {user?.name?.charAt(0).toUpperCase()}        </div>

                                    <div className="text-left">
                                        <p className="font-semibold text-gray-900">
                                            {user?.name}
                                        </p>

                                        <p className="text-sm text-gray-500">
                                            {user?.email}
                                        </p>
                                    </div>
                                </button>

                                <div className="border-t" />

                                <button
                                    onClick={() => {
                                        navigate("/dashboard");
                                        setOpen(false);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50"
                                >
                                    <LayoutDashboard size={18} />
                                    Dashboard
                                </button>

                                {user.role === "admin" && (
                                    <button
                                        onClick={() => {
                                            navigate("/admin");
                                            setOpen(false);
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50"
                                    >
                                        <Shield size={18} />
                                        Admin Panel
                                    </button>
                                )}

                                <div className="border-t" />

                                <button
                                    onClick={() => {
                                        handleLogout();
                                        setOpen(false);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50"
                                >
                                    <LogOut size={18} />
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>) : (

                        <div>

                            <Link to="/login" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200" > Login </Link>
                            <Link to="/signup" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all duration-200 hover:shadow-md hover:shadow-blue-200" > Sign Up </Link>
                        </div>





                    )






                }

            </div>
        </header>
    );
}