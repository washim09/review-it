// Description: This component outlines the steps of how the review platform works.

import { FaUserPlus, FaPencilAlt, FaUsers } from 'react-icons/fa';

const HowItWorks = () => {
  const steps = [
    {
      step: "1",
      title: "Create an Account",
      description: "Join our community of reviewers in just a few clicks.",
      icon: <FaUserPlus className="text-4xl text-indigo-600" />,
    },
    {
      step: "2",
      title: "Write Reviews",
      description: "Share your authentic experience with products.",
      icon: <FaPencilAlt className="text-4xl text-purple-600" />,
    },
    {
      step: "3",
      title: "Help Others",
      description: "Your insights help others make better choices.",
      icon: <FaUsers className="text-4xl text-pink-600" />,
    }
  ];

  return (
    <div className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-indigo-600 to-purple-600 mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative group"
            >
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    {step.step}
                  </div>
                </div>
                
                <div className="mt-8 text-center">
                  <div className="flex justify-center mb-6">
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    {step.title}
                  </h3>
                  <p className="text-gray-600">
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;