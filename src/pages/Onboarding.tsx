import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Target } from "lucide-react";

const Onboarding = () => {
  const navigate = useNavigate();
  const [selectedGoal, setSelectedGoal] = useState("");

  return (
    <div className="min-h-screen bg-gradient-soft flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-8">
        {/* Welcome Header */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold text-foreground">Welcome to Your Quran Journey</h1>
          <p className="text-lg text-muted-foreground">Choose how you'd like to get started</p>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Add Child Profile Card */}
          <Card 
            className="cursor-pointer transition-all hover:shadow-strong hover:scale-105 border-2 hover:border-primary"
            onClick={() => navigate("/goals")}
          >
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center">
                <UserPlus className="w-10 h-10 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="text-2xl">Add Child Profile</CardTitle>
                <CardDescription className="text-base mt-2">
                  Create a learning profile for your child
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground">
                Track their progress and customize their learning experience
              </p>
            </CardContent>
          </Card>

          {/* Start Learning Card */}
          <Card 
            className="cursor-pointer transition-all hover:shadow-strong hover:scale-105 border-2 hover:border-secondary"
            onClick={() => navigate("/goals")}
          >
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center">
                <Target className="w-10 h-10 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="text-2xl">Start Learning</CardTitle>
                <CardDescription className="text-base mt-2">
                  Set your personal learning goal
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground">
                Begin your own journey of Quranic knowledge
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
