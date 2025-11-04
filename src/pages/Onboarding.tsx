import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Target } from "lucide-react";
const Onboarding = () => {
  const navigate = useNavigate();
  const [goalName, setGoalName] = useState("");
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Navigate to main screen
    navigate("/");
  };
  return <div className="min-h-screen bg-gradient-soft flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-strong">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center">
            <Target className="w-8 h-8 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Set Your Goal</CardTitle>
            <CardDescription className="text-base mt-2">
              Let's personalize your Quran learning journey
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="goalName" className="text-base">
                What's your learning goal?
              </Label>
              <Input id="goalName" type="text" placeholder="e.g., Complete Juz Amma" value={goalName} onChange={e => setGoalName(e.target.value)} className="h-12 text-base" required />
              
            </div>
            <Button type="submit" className="w-full h-12 text-base" size="lg">
              Start Learning
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>;
};
export default Onboarding;