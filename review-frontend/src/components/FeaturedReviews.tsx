const FeaturedReviews = () => {
    const products = [
      { name: "Sample Product 1", rating: 5, description: "This is a sample review description." },
      { name: "Sample Product 2", rating: 4, description: "This is a sample review description." },
      { name: "Sample Product 3", rating: 3, description: "This is a sample review description." }
    ];
  
    return (
      <div className="p-8">
        <h2 className="text-2xl font-bold text-center">Featured Reviews</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {products.map((product, index) => (
            <div key={index} className="border rounded-lg p-4 shadow-md">
              <h3 className="font-semibold text-lg">{product.name}</h3>
              <p className="text-yellow-500">{"★".repeat(product.rating)}</p>
              <p className="mt-2 text-sm text-gray-600">{product.description}</p>
              <a href="#" className="text-blue-500 mt-2 inline-block">Read More →</a>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  export default FeaturedReviews;
  