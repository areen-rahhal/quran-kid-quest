import mascotPen from "@/assets/mascot-pen.png";

interface MascotMessageProps {
  message: string;
}

export const MascotMessage = ({ message }: MascotMessageProps) => {
  return (
    <div className="fixed bottom-6 left-4 right-4 max-w-md mx-auto z-10">
      <div className="flex items-end gap-3">
        <div className="w-20 h-20 flex-shrink-0 animate-bounce-gentle">
          <img 
            src={mascotPen} 
            alt="Friendly pen mascot" 
            className="w-full h-full object-contain drop-shadow-lg"
          />
        </div>
        <div className="bg-card rounded-2xl rounded-bl-none p-4 shadow-strong border-2 border-primary/20 flex-1">
          <p className="text-sm font-semibold text-foreground">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
};
