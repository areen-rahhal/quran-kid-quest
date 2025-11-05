import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import { TopNavBar } from "@/components/TopNavBar";
import { GoalHeader } from "@/components/GoalHeader";
import { VerticalProgressBar } from "@/components/VerticalProgressBar";
import { UnitsGrid, Unit } from "@/components/UnitsGrid";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/contexts/ProfileContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Target } from "lucide-react";
import pencilMascot from "@/assets/pencil-mascot.json";

const Goals = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { currentProfile } = useProfile();
  const [selectedGoal, setSelectedGoal] = useState("");
  
  // Sample data for Juz' 30 (last juz of Quran)
  const juz30Surahs: Unit[] = [
    { id: 78, name: "An-Naba", arabicName: "النبأ", status: "completed" },
    { id: 79, name: "An-Nazi'at", arabicName: "النازعات", status: "completed" },
    { id: 80, name: "Abasa", arabicName: "عبس", status: "completed" },
    { id: 81, name: "At-Takwir", arabicName: "التكوير", status: "in-progress" },
    { id: 82, name: "Al-Infitar", arabicName: "الإنفطار", status: "not-started" },
    { id: 83, name: "Al-Mutaffifin", arabicName: "المطففين", status: "not-started" },
    { id: 84, name: "Al-Inshiqaq", arabicName: "الإنشقاق", status: "not-started" },
    { id: 85, name: "Al-Buruj", arabicName: "البروج", status: "not-started" },
    { id: 86, name: "At-Tariq", arabicName: "الطارق", status: "not-started" },
    { id: 87, name: "Al-A'la", arabicName: "الأعلى", status: "not-started" },
    { id: 88, name: "Al-Ghashiyah", arabicName: "الغاشية", status: "not-started" },
    { id: 89, name: "Al-Fajr", arabicName: "الفجر", status: "not-started" },
    { id: 90, name: "Al-Balad", arabicName: "البلد", status: "not-started" },
    { id: 91, name: "Ash-Shams", arabicName: "الشمس", status: "not-started" },
    { id: 92, name: "Al-Lail", arabicName: "الليل", status: "not-started" },
    { id: 93, name: "Ad-Duha", arabicName: "ال��حى", status: "not-started" },
    { id: 94, name: "Ash-Sharh", arabicName: "الشرح", status: "not-started" },
    { id: 95, name: "At-Tin", arabicName: "التين", status: "not-started" },
    { id: 96, name: "Al-Alaq", arabicName: "العلق", status: "not-started" },
    { id: 97, name: "Al-Qadr", arabicName: "القدر", status: "not-started" },
    { id: 98, name: "Al-Bayyinah", arabicName: "البينة", status: "not-started" },
    { id: 99, name: "Az-Zalzalah", arabicName: "الزلزلة", status: "not-started" },
    { id: 100, name: "Al-Adiyat", arabicName: "العادي��ت", status: "not-started" },
    { id: 101, name: "Al-Qari'ah", arabicName: "القارعة", status: "not-started" },
    { id: 102, name: "At-Takathur", arabicName: "التكاثر", status: "not-started" },
    { id: 103, name: "Al-Asr", arabicName: "العصر", status: "not-started" },
    { id: 104, name: "Al-Humazah", arabicName: "الهمزة", status: "not-started" },
    { id: 105, name: "Al-Fil", arabicName: "الفيل", status: "not-started" },
    { id: 106, name: "Quraish", arabicName: "قريش", status: "not-started" },
    { id: 107, name: "Al-Ma'un", arabicName: "الماعون", status: "not-started" },
    { id: 108, name: "Al-Kawthar", arabicName: "الكوثر", status: "not-started" },
    { id: 109, name: "Al-Kafirun", arabicName: "الكافرون", status: "not-started" },
    { id: 110, name: "An-Nasr", arabicName: "النصر", status: "not-started" },
    { id: 111, name: "Al-Masad", arabicName: "المسد", status: "not-started" },
    { id: 112, name: "Al-Ikhlas", arabicName: "الإخلاص", status: "not-started" },
    { id: 113, name: "Al-Falaq", arabicName: "الفلق", status: "not-started" },
    { id: 114, name: "An-Nas", arabicName: "الناس", status: "not-started" },
  ];

  // Sample data for Juz' 29 (Tabaarak) - 11 Surahs
  const juz29Surahs: Unit[] = [
    { id: 67, name: "Al-Mulk", arabicName: "الملك", status: "completed" },
    { id: 68, name: "Al-Qalam", arabicName: "القلم", status: "completed" },
    { id: 69, name: "Al-Haqqah", arabicName: "الحاقة", status: "completed" },
    { id: 70, name: "Al-Ma'arij", arabicName: "المعارج", status: "completed" },
    { id: 71, name: "Nuh", arabicName: "نوح", status: "completed" },
    { id: 72, name: "Al-Jinn", arabicName: "الجن", status: "completed" },
    { id: 73, name: "Al-Muzzammil", arabicName: "المزمل", status: "in-progress" },
    { id: 74, name: "Al-Muddathir", arabicName: "المدثر", status: "not-started" },
    { id: 75, name: "Al-Qiyamah", arabicName: "القيامة", status: "not-started" },
    { id: 76, name: "Al-Insan", arabicName: "الإنسان", status: "not-started" },
    { id: 77, name: "Al-Mursalat", arabicName: "المرسلات", status: "not-started" },
  ];

  const [stars] = useState(128);
  const [streak] = useState(7);
  const [recitations] = useState(45);
  const [goalsCompleted] = useState(1);

  const handleUnitClick = (unit: Unit) => {
    toast({
      title: `Opening ${unit.name}`,
      description: `Let's learn ${unit.arabicName}!`,
    });
  };

  // Check if user has goals
  const hasGoals = currentProfile.goalsCount && currentProfile.goalsCount > 0;

  // Determine which goal data to show based on current profile's goal
  const getGoalData = () => {
    switch (currentProfile.currentGoal) {
      case "Juz' 29":
        return {
          name: "Juz' 29",
          surahCount: 11,
          ayatCount: 447,
          units: juz29Surahs,
          totalUnits: 11
        };
      case "Juz' 30":
      default:
        return {
          name: "Juz' 30",
          surahCount: 37,
          ayatCount: 564,
          units: juz30Surahs,
          totalUnits: 37
        };
    }
  };

  const goalData = getGoalData();

  // Calculate completed count dynamically from goal data
  const completedCount = goalData.units.filter(unit => unit.status === "completed").length;

  // Find in-progress unit and calculate its position
  const inProgressUnitIndex = goalData.units.findIndex(unit => unit.status === "in-progress");
  const columnsPerRow = 4;
  const unitRow = Math.floor(inProgressUnitIndex / columnsPerRow);
  const unitColumn = inProgressUnitIndex % columnsPerRow;

  // Calculate mascot position (each unit ~80px + 8px gap)
  const mascotTop = unitRow * 88;
  const mascotLeft = unitColumn * 25 + 10; // percentage based positioning

  // If no goals, show empty state
  if (!hasGoals) {
    return (
      <div className="min-h-screen bg-gradient-soft islamic-pattern">
        <TopNavBar
          achievements={{
            stars: 0,
            streak: 0,
            recitations: 0,
            goalsCompleted: 0
          }}
        />
        <div className="container max-w-md mx-auto p-4 pb-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <Card className="w-full max-w-md transition-all border-2 hover:border-secondary hover:shadow-strong">
              <CardHeader className="text-center space-y-4">
                <div className="mx-auto w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center">
                  <Target className="w-10 h-10 text-primary-foreground" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Start Your Journey</CardTitle>
                  <CardDescription className="text-base mt-2">
                    Select your first learning goal
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground text-center">
                  Begin your journey of Quranic learning and earn rewards as you progress
                </p>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Choose a goal:
                  </label>
                  <Select value={selectedGoal} onValueChange={setSelectedGoal}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose a goal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="juz-30">Juz' 30</SelectItem>
                      <SelectItem value="juz-29">Juz' 29</SelectItem>
                      <SelectItem value="surah-bakarah">Surah Al Bakarah</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <button
                  onClick={() => selectedGoal && navigate("/goals")}
                  disabled={!selectedGoal}
                  className="w-full px-4 py-2 bg-secondary text-secondary-foreground font-semibold rounded-md hover:bg-secondary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Start Learning
                </button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-soft islamic-pattern">
      <TopNavBar
        achievements={{
          stars,
          streak,
          recitations,
          goalsCompleted
        }}
      />
      <div className="container max-w-md mx-auto p-4 pb-8">
        <GoalHeader
          goalName={goalData.name}
          surahCount={goalData.surahCount}
          ayatCount={goalData.ayatCount}
        />

        {/* Progress bar and units grid side by side */}
        <div className="flex gap-3 relative">
          <VerticalProgressBar
            completed={completedCount}
            total={goalData.totalUnits}
          />

          <div className="flex-1 relative">
            <UnitsGrid
              units={goalData.units}
              onUnitClick={handleUnitClick}
            />

            {/* Pencil Mascot - Positioned dynamically on in-progress unit */}
            {inProgressUnitIndex !== -1 && (
              <div
                className="absolute w-36 h-36 pointer-events-none z-10"
                style={{
                  left: `calc(${mascotLeft}% + 0.375rem)`,
                  top: `${mascotTop}px`
                }}
              >
                <Lottie animationData={pencilMascot} loop={true} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Goals;
