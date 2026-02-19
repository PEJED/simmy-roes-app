const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-blue-800 text-center">
          Επιλογή Ροών ΣΗΜΜΥ
        </h1>
      </header>
      <main className="max-w-2xl w-full bg-white p-8 rounded-lg shadow-md">
        <p className="text-lg text-gray-700 mb-4 text-center">
          Καλώς ήρθατε στην εφαρμογή επιλογής ροών για τη σχολή Ηλεκτρολόγων Μηχανικών και Μηχανικών Υπολογιστών του ΕΜΠ.
        </p>
        <div className="text-center">
           <button className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
             Ξεκινήστε
           </button>
        </div>
      </main>
    </div>
  );
};

export default Home;
