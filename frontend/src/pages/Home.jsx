import React from "react";
import { Link } from "react-router-dom";
import {
  Leaf,
  Trophy,
  Map,
  BookOpen,
  Users,
  TrendingUp,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Home = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: Trophy,
      title: "Gamified Rewards",
      description:
        "Earn points and badges for proper waste disposal and recycling activities.",
      color: "bg-yellow-100 text-yellow-700",
    },
    {
      icon: Map,
      title: "Find Recyclers",
      description:
        "Locate nearby waste collectors and recycling centers with our interactive map.",
      color: "bg-blue-100 text-blue-700",
    },
    {
      icon: BookOpen,
      title: "Learn & Grow",
      description:
        "Access educational resources and tips on sustainable waste management.",
      color: "bg-green-100 text-green-700",
    },
    {
      icon: Users,
      title: "Community Impact",
      description:
        "Join a community of eco-conscious citizens making a real difference.",
      color: "bg-purple-100 text-purple-700",
    },
  ];

  const stats = [
    { value: "10K+", label: "Active Users" },
    { value: "50K+", label: "Recycling Reports" },
    { value: "200+", label: "Recycling Centers" },
    { value: "5M+", label: "Points Earned" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      {/* --- HERO SECTION --- */}
      <section className="relative bg-green-900 text-white overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?q=80&w=2070&auto=format&fit=crop"
            alt="Recycling Plant"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-green-900/90 to-green-800/80"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 lg:py-40">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-green-100 text-sm font-semibold mb-6 border border-white/20">
              <Leaf size={16} className="text-green-400" />
              <span>Sustainable Waste Management Solution</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight mb-6">
              Track Waste. <br />
              <span className="text-green-400">Earn Rewards.</span> <br />
              Save the Planet.
            </h1>
            <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl leading-relaxed">
              RecycleTrack connects you with local recyclers, rewards your green
              habits, and helps you track your environmental footprint—all in
              one app.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              {user ? (
                <Link
                  to="/dashboard"
                  className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-green-500/30 hover:-translate-y-1"
                >
                  Go to Dashboard
                  <ArrowRight size={20} />
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-green-500/30 hover:-translate-y-1"
                  >
                    Get Started Free
                    <ArrowRight size={20} />
                  </Link>
                  <Link
                    to="/map"
                    className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-md border border-white/30 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/20 transition-all"
                  >
                    <Map size={20} />
                    Find Centers
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* --- STATS SECTION --- */}
      <section className="relative -mt-10 z-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 p-8 md:p-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-gray-100">
            {stats.map((stat, index) => (
              <div key={index} className="text-center px-4 first:pl-0">
                <div className="text-3xl md:text-4xl font-extrabold text-green-600 mb-1">
                  {stat.value}
                </div>
                <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FEATURES SECTION --- */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-base font-semibold text-green-600 uppercase tracking-wider mb-2">
              Features
            </h2>
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Go Green
            </h3>
            <p className="text-xl text-gray-600">
              We make recycling simple, transparent, and rewarding for everyone
              involved.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group"
                >
                  <div
                    className={`w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                  >
                    <Icon size={28} />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-3">
                    {feature.title}
                  </h4>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* --- IMAGE & CONTENT SECTION --- */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2 relative">
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-green-100 rounded-full z-0"></div>
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-blue-100 rounded-full z-0"></div>
              <img
                src="https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?q=80&w=2071&auto=format&fit=crop"
                alt="Recycling App on Phone"
                className="relative z-10 rounded-2xl shadow-2xl w-full object-cover h-[500px]"
              />
            </div>
            <div className="lg:w-1/2">
              <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Smart Waste Management at Your Fingertips
              </h3>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Gone are the days of confusing recycling schedules. With
                RecycleTrack, you can book pickups, verify disposal, and track
                your environmental impact in real-time.
              </p>

              <ul className="space-y-4 mb-8">
                {[
                  "Real-time tracking of waste collection",
                  "Instant digital payments via M-Pesa",
                  "Verified impact reports for businesses",
                  "Leaderboards to compete with neighbors",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle className="text-green-500 w-5 h-5 flex-shrink-0" />
                    <span className="text-gray-700 font-medium">{item}</span>
                  </li>
                ))}
              </ul>

              <Link
                to="/about"
                className="text-green-600 font-bold hover:text-green-700 inline-flex items-center gap-1"
              >
                Learn more about our mission <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="py-24 bg-gray-900 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-green-900/20 to-transparent"></div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <TrendingUp className="w-16 h-16 text-green-400 mx-auto mb-6" />
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Ready to Make an Impact?
          </h2>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Join thousands of users who are already making a difference in waste
            management. Start your journey towards a cleaner planet today.
          </p>
          {!user && (
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 text-white px-10 py-5 rounded-full font-bold text-lg transition-all shadow-lg hover:shadow-green-500/40 hover:-translate-y-1"
            >
              Start Your Journey
              <ArrowRight size={20} />
            </Link>
          )}
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-gray-950 text-gray-400 py-16 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <div className="bg-green-600 p-2 rounded-lg">
                  <Leaf className="w-6 h-6 text-white" />
                </div>
                <span className="text-white font-bold text-xl">
                  RecycleTrack
                </span>
              </div>
              <p className="text-sm leading-relaxed mb-6">
                Empowering communities to manage waste efficiently through
                technology and gamification.
              </p>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-6">Platform</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link
                    to="/map"
                    className="hover:text-green-400 transition-colors"
                  >
                    Find Recyclers
                  </Link>
                </li>
                <li>
                  <Link
                    to="/education"
                    className="hover:text-green-400 transition-colors"
                  >
                    Resources
                  </Link>
                </li>
                <li>
                  <Link
                    to="/dashboard"
                    className="hover:text-green-400 transition-colors"
                  >
                    Dashboard
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-6">Company</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link
                    to="/about"
                    className="hover:text-green-400 transition-colors"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="hover:text-green-400 transition-colors"
                  >
                    Contact
                  </Link>
                </li>
                <li>
                  <Link
                    to="/privacy"
                    className="hover:text-green-400 transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-6">Stay Connected</h3>
              <p className="text-sm mb-4">
                Subscribe to our newsletter for the latest eco-tips.
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg block w-full p-2.5 focus:ring-green-500 focus:border-green-500"
                />
                <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg text-sm">
                  Join
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-sm text-center text-gray-500">
            <p>
              &copy; {new Date().getFullYear()} RecycleTrack. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
