// apps/frontend/src/app/page.tsx
import Link from 'next/link';
import { ArrowRight, BarChart3, Shield, Zap, Users, Cloud, CheckCircle } from 'lucide-react';

export default function Home() {
  const features = [
    {
      icon: <BarChart3 className="w-8 h-8 text-blue-600" />,
      title: 'Real-time Analytics',
      description: 'Get instant insights into your store performance with live dashboards.',
    },
    {
      icon: <Shield className="w-8 h-8 text-green-600" />,
      title: 'Multi-tenant Security',
      description: 'Secure data isolation for multiple stores with enterprise-grade security.',
    },
    {
      icon: <Zap className="w-8 h-8 text-purple-600" />,
      title: 'Automated Sync',
      description: 'Automatic data synchronization with Shopify using webhooks and schedulers.',
    },
    {
      icon: <Users className="w-8 h-8 text-orange-600" />,
      title: 'Customer Insights',
      description: 'Deep customer analytics to understand buying patterns and preferences.',
    },
    {
      icon: <Cloud className="w-8 h-8 text-red-600" />,
      title: 'Cloud Native',
      description: 'Deploy anywhere - Heroku, Render, Railway, Vercel with zero configuration.',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50 py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-6">
            <CheckCircle className="w-4 h-4 mr-2" />
            Xeno FDE Internship Project
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Shopify Data{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Ingestion & Insights
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
            A multi-tenant service that helps enterprise retailers onboard, integrate, 
            and analyze their customer data in real-time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Launch Dashboard
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link
              href="https://github.com/yourusername/xeno-fde-internship"
              target="_blank"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-gray-700 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 transition-all duration-300 shadow-sm hover:shadow-md"
            >
              View on GitHub
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for Shopify Analytics
            </h2>
            <p className="text-xl text-gray-600">
              Built with modern technologies for enterprise-grade performance
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-sm mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* Tech Stack */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 md:p-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              Built With Modern Tech Stack
            </h3>
            <div className="flex flex-wrap justify-center items-center gap-8">
              {[
                { name: 'Next.js', color: 'text-gray-900' },
                { name: 'React', color: 'text-blue-600' },
                { name: 'TypeScript', color: 'text-blue-700' },
                { name: 'Tailwind CSS', color: 'text-teal-600' },
                { name: 'Node.js', color: 'text-green-600' },
                { name: 'Express', color: 'text-gray-700' },
                { name: 'PostgreSQL', color: 'text-blue-800' },
                { name: 'Prisma', color: 'text-emerald-700' },
                { name: 'Shopify API', color: 'text-green-700' },
              ].map((tech) => (
                <div
                  key={tech.name}
                  className="flex flex-col items-center"
                >
                  <span className={`text-lg font-semibold ${tech.color}`}>
                    {tech.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Shopify Analytics?
          </h2>
          <p className="text-xl text-blue-100 mb-10">
            Get started with our multi-tenant solution today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-blue-600 bg-white rounded-xl hover:bg-gray-100 transition-all duration-300 shadow-lg"
            >
              Try Dashboard
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <a
              href="mailto:contact@example.com"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white bg-transparent rounded-xl border-2 border-white hover:bg-white hover:text-blue-600 transition-all duration-300"
            >
              Contact Sales
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-xl font-bold">X</span>
              </div>
              <span className="ml-3 text-2xl font-bold">Xeno</span>
            </div>
            <p className="text-gray-400 mb-8">
              Multi-tenant Shopify Data Ingestion & Insights Service
            </p>
            <div className="text-gray-500 text-sm">
              <p>© {new Date().getFullYear()} Xeno FDE Internship Project. All rights reserved.</p>
              <p className="mt-2">Built for Xeno Forward Deployed Engineer Internship Application</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}