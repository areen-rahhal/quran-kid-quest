import { useTranslation } from 'react-i18next';
import { X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AVATAR_OPTIONS } from '@/utils/avatars';

interface AvatarSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAvatar: (avatarId: string) => void;
  currentAvatarId: string;
}

export const AvatarSelectionModal = ({
  isOpen,
  onClose,
  onSelectAvatar,
  currentAvatarId,
}: AvatarSelectionModalProps) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  const handleAvatarSelect = (avatarId: string) => {
    onSelectAvatar(avatarId);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in"
      onClick={onClose}
    >
      {/* Modal Container */}
      <div
        className="fixed inset-0 z-50 flex flex-col bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-border p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">
            {t('learnersProfiles.selectAvatar') || 'Select Avatar'}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="hover:bg-accent"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Avatar Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {AVATAR_OPTIONS.map((avatar) => {
              const isSelected = currentAvatarId === avatar.id;
              return (
                <button
                  key={avatar.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAvatarSelect(avatar.id);
                  }}
                  className={`relative p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2
                    ${
                      isSelected
                        ? 'bg-primary/10 border-primary shadow-md'
                        : 'bg-muted/50 border-border hover:border-primary/50'
                    }
                  `}
                >
                  <div className="relative">
                    <img
                      src={avatar.image}
                      alt="Avatar"
                      className="w-20 h-20 rounded-full object-cover"
                    />
                    {isSelected && (
                      <div className="absolute inset-0 rounded-full bg-primary/20 flex items-center justify-center">
                        <Check className="w-6 h-6 text-primary" />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
