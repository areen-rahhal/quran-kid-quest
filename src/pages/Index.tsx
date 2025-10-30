import { useState } from "react";
import { GoalHeader } from "@/components/GoalHeader";
import { VerticalProgressBar } from "@/components/VerticalProgressBar";
import { AchievementsRow } from "@/components/AchievementsRow";
import { UnitsGrid, Unit } from "@/components/UnitsGrid";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { toast } = useToast();
  
  // Sample data for Juz' 30 (last juz of Quran) - reversed order to start from An-Nas
  const juz30Surahs: Unit[] = [
    { id: 114, name: "An-Nas", arabicName: "الناس", status: "not-started" },
    { id: 113, name: "Al-Falaq", arabicName: "الفلق", status: "not-started" },
    { id: 112, name: "Al-Ikhlas", arabicName: "الإخلاص", status: "not-started" },
    { id: 111, name: "Al-Masad", arabicName: "المسد", status: "not-started" },
    { id: 110, name: "An-Nasr", arabicName: "النصر", status: "not-started" },
    { id: 109, name: "Al-Kafirun", arabicName: "الكافرون", status: "not-started" },
    { id: 108, name: "Al-Kawthar", arabicName: "الكوثر", status: "not-started" },
    { id: 107, name: "Al-Ma'un", arabicName: "الماعون", status: "not-started" },
    { id: 106, name: "Quraish", arabicName: "قريش", status: "not-started" },
    { id: 105, name: "Al-Fil", arabicName: "الفيل", status: "not-started" },
    { id: 104, name: "Al-Humazah", arabicName: "الهمزة", status: "not-started" },
    { id: 103, name: "Al-Asr", arabicName: "العصر", status: "not-started" },
    { id: 102, name: "At-Takathur", arabicName: "التكاثر", status: "not-started" },
    { id: 101, name: "Al-Qari'ah", arabicName: "القارعة", status: "not-started" },
    { id: 100, name: "Al-Adiyat", arabicName: "العاديات", status: "not-started" },
    { id: 99, name: "Az-Zalzalah", arabicName: "الزلزلة", status: "not-started" },
    { id: 98, name: "Al-Bayyinah", arabicName: "البينة", status: "not-started" },
    { id: 97, name: "Al-Qadr", arabicName: "القدر", status: "not-started" },
    { id: 96, name: "Al-Alaq", arabicName: "العلق", status: "not-started" },
    { id: 95, name: "At-Tin", arabicName: "التين", status: "not-started" },
    { id: 94, name: "Ash-Sharh", arabicName: "الشرح", status: "not-started" },
    { id: 93, name: "Ad-Duha", arabicName: "الضحى", status: "not-started" },
    { id: 92, name: "Al-Lail", arabicName: "الليل", status: "not-started" },
    { id: 91, name: "Ash-Shams", arabicName: "الشمس", status: "not-started" },
    { id: 90, name: "Al-Balad", arabicName: "البلد", status: "not-started" },
    { id: 89, name: "Al-Fajr", arabicName: "الفجر", status: "not-started" },
    { id: 88, name: "Al-Ghashiyah", arabicName: "الغاشية", status: "not-started" },
    { id: 87, name: "Al-A'la", arabicName: "الأعلى", status: "not-started" },
    { id: 86, name: "At-Tariq", arabicName: "الطارق", status: "not-started" },
    { id: 85, name: "Al-Buruj", arabicName: "البروج", status: "not-started" },
    { id: 84, name: "Al-Inshiqaq", arabicName: "الإنشقاق", status: "not-started" },
    { id: 83, name: "Al-Mutaffifin", arabicName: "المطففين", status: "not-started" },
    { id: 82, name: "Al-Infitar", arabicName: "الإنفطار", status: "not-started" },
    { id: 81, name: "At-Takwir", arabicName: "التكوير", status: "in-progress" },
    { id: 80, name: "Abasa", arabicName: "عبس", status: "completed" },
    { id: 79, name: "An-Nazi'at", arabicName: "النازعات", status: "completed" },
    { id: 78, name: "An-Naba", arabicName: "النبأ", status: "completed" },
  ];

  const [completedCount] = useState(3);
  const [stars] = useState(128);
  const [streak] = useState(7);
  const [recitations] = useState(45);

  const handleUnitClick = (unit: Unit) => {
    toast({
      title: `Opening ${unit.name}`,
      description: `Let's learn ${unit.arabicName}!`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-soft islamic-pattern pb-8">
      <div className="container max-w-md mx-auto p-4 pt-6">
        <GoalHeader 
          goalName="Juz' 30"
          surahCount={37}
          ayatCount={564}
        />
        
        <AchievementsRow 
          stars={stars}
          streak={streak}
          recitations={recitations}
        />
        
        {/* Progress bar and units grid side by side */}
        <div className="flex gap-3">
          <VerticalProgressBar 
            completed={completedCount}
            total={37}
          />
          
          <div className="flex-1">
            <UnitsGrid 
              units={juz30Surahs}
              onUnitClick={handleUnitClick}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
