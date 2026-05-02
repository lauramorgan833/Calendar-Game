import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Moon, Sun, Palette } from 'lucide-react';
import { useTheme } from '@/contexts/theme-provider';
import { useAppContext } from '@/contexts/AppContext';
import { PIECE_COLORS } from '@/lib/colors';

// Props interface for the SettingsPanel component
interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onClearData: () => void;
}

/**
 * Settings panel component that slides in from the right side
 */
const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose, onClearData }) => {
  const { theme, setTheme } = useTheme();
  const { selectedPieceColor, setSelectedPieceColor } = useAppContext();
  const isDarkMode = theme === 'dark';

  const handleThemeToggle = (checked: boolean) => {
    setTheme(checked ? 'dark' : 'light');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full sm:max-w-[480px] max-h-[85vh] p-0 bg-background text-foreground overflow-hidden">
        <DialogHeader className="p-4 sm:p-8 pb-2">
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[calc(85vh-80px)] px-6 sm:px-10 overflow-y-auto">
          <div className="space-y-6 pb-6">
            {/* Theme settings section */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Appearance</h3>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  {isDarkMode ? (
                    <Moon className="w-4 h-4" />
                  ) : (
                    <Sun className="w-4 h-4" />
                  )}
                  <Label htmlFor="dark-mode" className="text-sm font-medium">
                    {isDarkMode ? 'Dark Mode' : 'Light Mode'}
                  </Label>
                </div>
                <Switch
                  id="dark-mode"
                  checked={isDarkMode}
                  onCheckedChange={handleThemeToggle}
                />
              </div>
              
              {/* Piece Color Selector */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Palette className="w-4 h-4" />
                  <Label className="text-sm font-medium">Puzzle Piece Color</Label>
                </div>
                <div className="grid grid-cols-6 gap-2">
                  {PIECE_COLORS.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedPieceColor(color)}
                      className={`w-8 h-8 rounded-lg border-2 transition-all ${
                        selectedPieceColor.value === color.value
                          ? 'border-foreground scale-110'
                          : 'border-muted-foreground/30 hover:border-muted-foreground/60'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Selected: {selectedPieceColor.name}
                </p>
              </div>
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsPanel;
