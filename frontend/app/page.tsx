import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Activity, Brain, Heart, Shield, TrendingUp, Users, Stethoscope, Clipboard, Pill } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Header - White background with shadow */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <nav className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-pink-500 to-red-500 p-2 rounded-lg">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                HealthGenie
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#home" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Home
              </Link>
              <Link href="#services" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Services
              </Link>
              <Link href="#about" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                About Us
              </Link>
              <Link href="/doctor/dashboard" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Our Doctor
              </Link>
              <Link href="/register" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Appointment
              </Link>
              <Link href="/login" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Contact
              </Link>
            </div>
            <Link href="/register">
              <Button className="bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white shadow-lg">
                Book An Appointment
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section - Gradient blue background with medical professionals */}
      <section className="relative bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 overflow-hidden">
        {/* Decorative DNA/Medical Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-10 w-64 h-64 border-4 border-white rounded-full"></div>
          <div className="absolute top-40 right-32 w-32 h-32 border-4 border-white rounded-full"></div>
          <div className="absolute bottom-20 left-10 w-48 h-48 border-4 border-white rounded-full"></div>
          {/* Dotted pattern */}
          <div className="absolute top-1/4 right-1/3 flex space-x-2">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="w-2 h-2 bg-white rounded-full"></div>
            ))}
          </div>
        </div>

        <div className="container mx-auto px-6 py-20 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Text Content */}
            <div className="text-white">
              <h1 className="text-6xl font-bold mb-6 leading-tight">
                Your Healthy Is<br />
                <span className="text-white/90">Our Priority.</span>
              </h1>
              <p className="text-xl text-white/90 mb-8 leading-relaxed max-w-lg">
                Lorem Ipsum Dolor Sit Amet Consectetur Adipisicing Elit, Sed Do Eiusmod Tempor Incididunt Ut Labore Et Dolore Magna Aliqua. Quis Ipsum Suspendisse Ultrices Gravida.
              </p>
              <Link href="/register">
                <Button size="lg" className="bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white shadow-2xl px-8 py-6 text-lg">
                  Book An Appointment →
                </Button>
              </Link>
            </div>

            {/* Right side - Medical Team Image */}
            <div className="relative">
              <div className="relative bg-white/10 backdrop-blur-sm rounded-3xl p-8 shadow-2xl">
                {/* Medical professionals illustration */}
                <div className="flex items-center justify-center space-x-6">
                  {/* Doctor 1 - Male with stethoscope */}
                  <div className="flex flex-col items-center">
                    <div className="w-40 h-40 bg-gradient-to-br from-teal-400 to-teal-500 rounded-t-full flex items-end justify-center overflow-hidden relative">
                      <div className="absolute top-8 w-32 h-32 bg-[#f5d5b8] rounded-full"></div>
                      <div className="absolute top-12 left-1/2 transform -translate-x-1/2 w-24 h-24 bg-[#3d2817] rounded-t-full"></div>
                      <div className="absolute top-24 left-1/2 transform -translate-x-1/2 flex space-x-4">
                        <div className="w-3 h-3 bg-gray-800 rounded-full"></div>
                        <div className="w-3 h-3 bg-gray-800 rounded-full"></div>
                      </div>
                      <div className="absolute top-32 left-1/2 transform -translate-x-1/2 w-1 h-2 bg-[#d4a574] rounded-full"></div>
                      <div className="absolute top-36 left-1/2 transform -translate-x-1/2 w-8 h-2 bg-red-400 rounded-full"></div>
                    </div>
                    <div className="w-40 h-48 bg-white rounded-b-lg flex flex-col items-center pt-4">
                      <div className="w-32 h-40 bg-gray-50 rounded-lg relative">
                        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gray-300"></div>
                        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-16 h-0.5 bg-gray-300"></div>
                        <div className="absolute top-10 left-1/2 transform -translate-x-1/2 flex space-x-2">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        </div>
                        <Stethoscope className="absolute bottom-4 left-1/2 transform -translate-x-1/2 h-12 w-12 text-gray-700" />
                      </div>
                    </div>
                  </div>

                  {/* Doctor 2 - Female with surgical cap */}
                  <div className="flex flex-col items-center -mt-8">
                    <div className="w-40 h-40 bg-gradient-to-br from-gray-400 to-gray-500 rounded-t-full flex items-end justify-center overflow-hidden relative">
                      <div className="absolute top-8 w-32 h-32 bg-[#f5d5b8] rounded-full"></div>
                      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-32 h-16 bg-gray-300 rounded-t-full"></div>
                      <div className="absolute top-20 left-1/2 transform -translate-x-1/2 flex space-x-4">
                        <div className="w-3 h-3 bg-gray-800 rounded-full"></div>
                        <div className="w-3 h-3 bg-gray-800 rounded-full"></div>
                      </div>
                    </div>
                    <div className="w-40 h-48 bg-white rounded-b-lg flex flex-col items-center pt-4">
                      <div className="w-32 h-40 bg-gray-50 rounded-lg"></div>
                    </div>
                  </div>

                  {/* Doctor 3 - Male with mask */}
                  <div className="flex flex-col items-center">
                    <div className="w-40 h-40 bg-gradient-to-br from-teal-400 to-teal-500 rounded-t-full flex items-end justify-center overflow-hidden relative">
                      <div className="absolute top-8 w-32 h-32 bg-[#f5d5b8] rounded-full"></div>
                      <div className="absolute top-12 left-1/2 transform -translate-x-1/2 w-24 h-24 bg-[#3d2817] rounded-t-full"></div>
                      <div className="absolute top-24 left-1/2 transform -translate-x-1/2 flex space-x-4">
                        <div className="w-3 h-3 bg-gray-800 rounded-full"></div>
                        <div className="w-3 h-3 bg-gray-800 rounded-full"></div>
                      </div>
                      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-24 h-16 bg-blue-100 rounded-lg"></div>
                    </div>
                    <div className="w-40 h-48 bg-white rounded-b-lg flex flex-col items-center pt-4">
                      <div className="w-32 h-40 bg-gray-50 rounded-lg"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social media sidebar */}
              <div className="absolute right-0 top-1/2 transform translate-x-16 -translate-y-1/2 bg-gradient-to-r from-pink-500 to-red-500 rounded-full py-4 px-3 flex flex-col space-y-4 shadow-2xl">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                  <span className="text-pink-500 font-bold">f</span>
                </div>
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                  <span className="text-pink-500 font-bold">t</span>
                </div>
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                  <span className="text-pink-500 font-bold">in</span>
                </div>
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                  <span className="text-pink-500 font-bold">ig</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Feature Cards */}
        <div className="container mx-auto px-6 pb-12 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 -mb-16">
            <FeatureCard
              icon={<Pill className="h-12 w-12 text-pink-500" />}
              title="Lorem Ipsum Dolor"
              description="Lorem Ipsum Dolor Sit Amet Consectetur Adipisicing Elit"
            />
            <FeatureCard
              icon={<Clipboard className="h-12 w-12 text-pink-500" />}
              title="Lorem Ipsum Dolor"
              description="Lorem Ipsum Dolor Sit Amet Consectetur Adipisicing Elit"
            />
            <FeatureCard
              icon={<Stethoscope className="h-12 w-12 text-pink-500" />}
              title="Lorem Ipsum Dolor"
              description="Lorem Ipsum Dolor Sit Amet Consectetur Adipisicing Elit"
            />
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="bg-gradient-to-b from-white to-gray-50 py-32 mt-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Services</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive healthcare solutions powered by advanced AI technology
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <ServiceCard
              icon={<Brain className="h-12 w-12 text-pink-500" />}
              title="AI-Powered Diagnostics"
              description="Advanced ML models analyze medical images and data for faster, accurate diagnoses with 95%+ accuracy."
              gradient="from-pink-500 to-red-500"
            />
            <ServiceCard
              icon={<Heart className="h-12 w-12 text-blue-500" />}
              title="Real-Time Monitoring"
              description="Integrate with wearables for continuous health tracking and instant alerts for critical metrics."
              gradient="from-blue-500 to-cyan-500"
            />
            <ServiceCard
              icon={<Shield className="h-12 w-12 text-green-500" />}
              title="Secure & Private"
              description="HIPAA/GDPR compliant with end-to-end encryption and advanced security measures."
              gradient="from-green-500 to-emerald-500"
            />
            <ServiceCard
              icon={<Users className="h-12 w-12 text-purple-500" />}
              title="Patient Portal"
              description="Comprehensive dashboard for patients to access medical history and reports."
              gradient="from-purple-500 to-pink-500"
            />
            <ServiceCard
              icon={<TrendingUp className="h-12 w-12 text-orange-500" />}
              title="Genomic Analysis"
              description="Identify genetic markers and provide personalized treatment recommendations."
              gradient="from-orange-500 to-red-500"
            />
            <ServiceCard
              icon={<Activity className="h-12 w-12 text-indigo-500" />}
              title="Automated Reporting"
              description="Generate detailed PDF reports with AI insights and track progress over time."
              gradient="from-indigo-500 to-purple-500"
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-20">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <StatCard number="95%" label="Diagnostic Accuracy" />
            <StatCard number="90%" label="Time Reduction" />
            <StatCard number="10K+" label="Patients Served" />
            <StatCard number="50+" label="Healthcare Providers" />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-pink-50 to-blue-50 py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Ready to Transform Healthcare?</h2>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Join thousands of healthcare providers and patients using HealthGenie for better health outcomes.
          </p>
          <Link href="/register">
            <Button size="lg" className="bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white shadow-xl px-10 py-6 text-lg">
              Book An Appointment Now →
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-gradient-to-br from-pink-500 to-red-500 p-2 rounded-lg">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold">HealthGenie</span>
              </div>
              <p className="text-gray-400">
                AI-powered healthcare platform for better patient outcomes.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/services" className="hover:text-white transition-colors">Services</Link></li>
                <li><Link href="/doctors" className="hover:text-white transition-colors">Our Doctors</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Services</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/patient/predict" className="hover:text-white transition-colors">AI Diagnosis</Link></li>
                <li><Link href="/health-monitoring" className="hover:text-white transition-colors">Health Monitoring</Link></li>
                <li><Link href="/telemedicine" className="hover:text-white transition-colors">Telemedicine</Link></li>
                <li><Link href="/family" className="hover:text-white transition-colors">Family Care</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Contact Info</h3>
              <ul className="space-y-2 text-gray-400">
                <li>📧 info@healthgenie.com</li>
                <li>📞 +1 (555) 123-4567</li>
                <li>📍 123 Healthcare Ave</li>
                <li>San Francisco, CA 94102</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2026 HealthGenie. All rights reserved. Open-source healthcare platform.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
      <div className="bg-gradient-to-br from-pink-100 to-red-100 w-16 h-16 rounded-xl flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 text-gray-900">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  )
}

function ServiceCard({ icon, title, description, gradient }: { icon: React.ReactNode; title: string; description: string; gradient: string }) {
  return (
    <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 relative overflow-hidden">
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 rounded-full blur-3xl transition-opacity duration-300`}></div>
      <div className="relative z-10">
        <div className="mb-4">{icon}</div>
        <h3 className="text-xl font-bold mb-3 text-gray-900">{title}</h3>
        <p className="text-gray-600 leading-relaxed">{description}</p>
      </div>
    </div>
  )
}

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div className="text-center transform hover:scale-105 transition-transform duration-300">
      <h3 className="text-5xl font-bold mb-2">{number}</h3>
      <p className="text-blue-100 text-lg">{label}</p>
    </div>
  )
}
