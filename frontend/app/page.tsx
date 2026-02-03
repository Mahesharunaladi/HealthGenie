import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Activity, Brain, Heart, Shield, TrendingUp, Users } from 'lucide-react'
import Doctor3D from '@/components/Doctor3D'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">CuraGenie</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left side - Text */}
          <div className="text-center md:text-left">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              AI-Powered Healthcare Platform
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Empowering everyone with accessible, data-driven healthcare solutions through
              advanced AI diagnostics and personalized patient care.
            </p>
            <div className="flex flex-col sm:flex-row justify-center md:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
              <Link href="/register">
                <Button size="lg" className="px-8 w-full sm:w-auto">
                  Start Free Trial
                </Button>
              </Link>
              <Link href="/demo">
                <Button size="lg" variant="outline" className="px-8 w-full sm:w-auto">
                  View Demo
                </Button>
              </Link>
            </div>
          </div>

          {/* Right side - 3D Doctor */}
          <div className="flex justify-center items-center">
            <div className="w-full max-w-md h-[400px] bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl shadow-2xl flex items-center justify-center relative overflow-hidden">
              {/* Animated background circles */}
              <div className="absolute w-64 h-64 bg-blue-200 rounded-full opacity-20 blur-3xl animate-pulse"></div>
              <div className="absolute w-48 h-48 bg-purple-200 rounded-full opacity-20 blur-2xl animate-pulse delay-1000"></div>

              {/* 3D Doctor Component */}
              <Doctor3D />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Brain className="h-10 w-10 text-blue-600" />}
            title="AI-Powered Diagnostics"
            description="Advanced ML models analyze medical images and data for faster, accurate diagnoses with 95%+ accuracy."
          />
          <FeatureCard
            icon={<Heart className="h-10 w-10 text-red-600" />}
            title="Real-Time Monitoring"
            description="Integrate with wearables for continuous health tracking and instant alerts for critical metrics."
          />
          <FeatureCard
            icon={<Shield className="h-10 w-10 text-green-600" />}
            title="Secure & Private"
            description="HIPAA/GDPR compliant with end-to-end encryption and advanced security measures."
          />
          <FeatureCard
            icon={<Users className="h-10 w-10 text-purple-600" />}
            title="Patient Portal"
            description="Comprehensive dashboard for patients to access medical history and reports."
          />
          <FeatureCard
            icon={<TrendingUp className="h-10 w-10 text-orange-600" />}
            title="Genomic Analysis"
            description="Identify genetic markers and provide personalized treatment recommendations."
          />
          <FeatureCard
            icon={<Activity className="h-10 w-10 text-indigo-600" />}
            title="Automated Reporting"
            description="Generate detailed PDF reports with AI insights and track progress over time."
          />
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <StatCard number="95%" label="Diagnostic Accuracy" />
            <StatCard number="90%" label="Time Reduction" />
            <StatCard number="10K+" label="Patients Served" />
            <StatCard number="50+" label="Healthcare Providers" />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-bold mb-6">Ready to Transform Healthcare?</h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Join thousands of healthcare providers and patients using CuraGenie for better health outcomes.
        </p>
        <Link href="/register">
          <Button size="lg" className="px-8">
            Get Started Now
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 py-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>&copy; 2026 CuraGenie. All rights reserved. Open-source healthcare platform.</p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div>
      <div className="text-4xl font-bold mb-2">{number}</div>
      <div className="text-blue-100">{label}</div>
    </div>
  )
}
