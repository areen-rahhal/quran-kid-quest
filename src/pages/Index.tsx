import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-soft islamic-pattern flex items-center justify-center">
      <div className="container max-w-md mx-auto p-4 text-center">
        <h1 className="text-4xl font-bold text-primary mb-6">Quran Quest</h1>
        <p className="text-muted-foreground text-lg mb-8">Welcome to your learning journey</p>
        
        <button
          onClick={() => navigate("/goals")}
          className="px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-full hover:bg-primary/90 transition-colors shadow-soft"
        >
          Start Learning
        </button>
      </div>
    </div>
  );
};

export default Index;
