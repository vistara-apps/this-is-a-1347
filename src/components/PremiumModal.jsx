import React from 'react';
import { X, Star, Zap, Brain, Bell } from 'lucide-react';

export function PremiumModal({ onClose, onPurchase }) {
  const features = [
    {
      icon: <Brain className="w-5 h-5" />,
      title: 'AI Task Prioritization',
      description: 'Intelligent ordering based on urgency and importance'
    },
    {
      icon: <Zap className="w-5 h-5" />,
      title: 'Advanced Task Sequencing',
      description: 'Optimal workflow planning and dependency management'
    },
    {
      icon: <Bell className="w-5 h-5" />,
      title: 'Proactive Reminders',
      description: 'Context-aware notifications at the perfect time'
    },
    {
      icon: <Star className="w-5 h-5" />,
      title: 'Premium AI Features',
      description: 'Enhanced voice processing and task analysis'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Upgrade to Premium</h2>
          <p className="text-gray-600">Unlock advanced AI features for enhanced productivity</p>
        </div>
        
        <div className="space-y-4 mb-6">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="text-purple-500 mt-1">{feature.icon}</div>
              <div>
                <h3 className="font-semibold text-gray-800">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mb-6">
          <div className="text-3xl font-bold text-gray-800">$0.001</div>
          <div className="text-sm text-gray-600">per premium feature use</div>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Maybe Later
          </button>
          <button
            onClick={onPurchase}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            Pay with Wallet
          </button>
        </div>
      </div>
    </div>
  );
}