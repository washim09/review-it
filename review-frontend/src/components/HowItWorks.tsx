const HowItWorks = () => {
    const steps = [
      { step: "1", title: "Create an Account", description: "Sign up for free and join our community of reviewers." },
      { step: "2", title: "Write Reviews", description: "Share your experience with products you’ve used." },
      { step: "3", title: "Help Others", description: "Your reviews help others make better purchasing decisions." }
    ];
  
    return (
      <div className="p-8 bg-gray-100">
        <h2 className="text-2xl font-bold text-center">How It Works</h2>
        <div className="flex justify-around mt-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl font-bold text-blue-500">{step.step}</div>
              <h3 className="mt-4 font-semibold text-lg">{step.title}</h3>
              <p className="mt-2 text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  export default HowItWorks;
  