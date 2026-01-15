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
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Home = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: Trophy,
      title: "Gamified Rewards",
      description:
        "Earn points and badges for proper waste disposal and recycling activities",
      color: "bg-yellow-50 text-yellow-600",
    },
    {
      icon: Map,
      title: "Find Recyclers",
      description:
        "Locate nearby waste collectors and recycling centers with our interactive map",
      color: "bg-blue-50 text-blue-600",
    },
    {
      icon: BookOpen,
      title: "Learn & Grow",
      description:
        "Access educational resources and tips on sustainable waste management",
      color: "bg-green-50 text-green-600",
    },
    {
      icon: Users,
      title: "Community Impact",
      description:
        "Join a community of eco-conscious citizens making a real difference",
      color: "bg-purple-50 text-purple-600",
    },
  ];

  const stats = [
    { value: "10K+", label: "Active Users" },
    { value: "50K+", label: "Recycling Reports" },
    { value: "200+", label: "Recycling Centers" },
    { value: "5M+", label: "Points Earned" },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-500 via-green-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl mb-6">
              <Leaf className="w-12 h-12" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Transform Waste Into Rewards
            </h1>
            <p className="text-xl md:text-2xl text-green-50 mb-8 max-w-3xl mx-auto">
              Join RecycleTrack and turn your eco-friendly actions into points,
              badges, and real environmental impact
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Link
                  to="/dashboard"
                  className="inline-flex items-center justify-center gap-2 bg-white text-green-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-green-50 transition-all shadow-lg hover:shadow-xl"
                >
                  Go to Dashboard
                  <ArrowRight size={20} />
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center gap-2 bg-white text-green-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-green-50 transition-all shadow-lg hover:shadow-xl"
                  >
                    Get Started Free
                    <ArrowRight size={20} />
                  </Link>
                  <Link
                    to="/map"
                    className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/20 transition-all"
                  >
                    <Map size={20} />
                    Explore Map
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose RecycleTrack?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to make waste management engaging, effective,
              and rewarding
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all hover:-translate-y-1"
                >
                  <div
                    className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4`}
                  >
                    <Icon size={24} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Simple steps to start making a difference
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Sign Up
              </h3>
              <p className="text-gray-600">
                Create your free account and set up your profile
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Take Action
              </h3>
              <p className="text-gray-600">
                Dispose waste properly and report your recycling activities
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Earn Rewards
              </h3>
              <p className="text-gray-600">
                Collect points, unlock badges, and climb the leaderboard
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary-600 to-green-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <TrendingUp className="w-16 h-16 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Make an Impact?
          </h2>
          <p className="text-xl text-green-50 mb-8">
            Join thousands of users who are already making a difference in waste
            management
          </p>
          {!user && (
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 bg-white text-primary-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-green-50 transition-all shadow-lg hover:shadow-xl"
            >
              Start Your Journey Today
              <ArrowRight size={20} />
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-primary-600 p-2 rounded-lg">
                  <Leaf className="w-5 h-5 text-white" />
                </div>
                <span className="text-white font-bold text-lg">
                  RecycleTrack
                </span>
              </div>
              <p className="text-sm">
                Making waste management engaging and rewarding for everyone.
              </p>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/map" className="hover:text-white">
                    Find Recyclers
                  </Link>
                </li>
                <li>
                  <Link to="/education" className="hover:text-white">
                    Resources
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard" className="hover:text-white">
                    Dashboard
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/about" className="hover:text-white">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-white">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="hover:text-white">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Connect</h3>
              <p className="text-sm mb-4">
                Join our community and stay updated with the latest news.
              </p>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
            <p>&copy; 2025 Recycle Track. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
