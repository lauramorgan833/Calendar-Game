import React from 'react';
import { Button } from '@/components/ui/button';
import { BarChart3, Settings, HelpCircle, Menu } from 'lucide-react';
import Logo from './Logo';
import { useTheme } from '@/contexts/theme-provider';
import { APP_COLORS } from '@/lib/colors';

// Theme constants
const THEME_DARK = 'dark';

// Icon size class shared by all header buttons
const HEADER_ICON_CLASSNAME = 'h-5 w-5';

// Layout className constants
const HEADER_CLASSNAME = 'shadow-sm border-b border-border';
const HEADER_INNER_CLASSNAME = 'container mx-auto px-4 py-2';
const HEADER_ROW_CLASSNAME = 'flex items-center justify-between';
const LEFT_GROUP_CLASSNAME = 'flex items-center gap-2 md:gap-4';
const MENU_BUTTON_CLASSNAME = 'md:hidden';
const LOGO_GROUP_CLASSNAME = 'flex items-center gap-2 md:gap-3';
const TITLE_CLASSNAME = 'text-2xl font-bold';
const RIGHT_GROUP_CLASSNAME = 'flex items-center gap-1 md:gap-2';

// App branding constants
const APP_TITLE = 'Calendle';

// Props interface for Header component
interface HeaderProps {
  onStatsClick: () => void;
  onSettingsClick: () => void;
  onHelpClick: () => void;
  onMenuClick: () => void;
}

/**
 * Header component that displays the app title and navigation buttons
 * Provides access to stats, settings, help, and mobile menu
 */
const Header: React.FC<HeaderProps> = ({
  onStatsClick,
  onSettingsClick,
  onHelpClick,
  onMenuClick
}) => {
  const { theme } = useTheme();

  // Determine header background color based on theme
  const isDarkTheme = theme === THEME_DARK;
  const headerBgColor = isDarkTheme
    ? APP_COLORS.background.dark.header
    : APP_COLORS.background.light.header;

  // Pre-compute style objects so the return statement has no inline logic
  const headerStyle = { backgroundColor: headerBgColor };

  const titleStyle = {
    color: APP_COLORS.primary.main,
  };

  return (
    <header style={headerStyle} className={HEADER_CLASSNAME}>
      <div className={HEADER_INNER_CLASSNAME}>
        <div className={HEADER_ROW_CLASSNAME}>
          {/* Left side: Mobile menu and app title */}
          <div className={LEFT_GROUP_CLASSNAME}>
            {/* Mobile menu button - only visible on small screens */}
            <Button variant="ghost" size="icon" onClick={onMenuClick} className={MENU_BUTTON_CLASSNAME}>
              <Menu className={HEADER_ICON_CLASSNAME} />
            </Button>
            {/* Logo only */}
            <div className={LOGO_GROUP_CLASSNAME}>
              <Logo />
              <h1 className={TITLE_CLASSNAME} style={titleStyle}>
                {APP_TITLE}
              </h1>
            </div>
          </div>

          {/* Right side: Navigation buttons */}
          <div className={RIGHT_GROUP_CLASSNAME}>
            {/* Statistics button */}
            <Button variant="ghost" size="icon" onClick={onStatsClick}>
              <BarChart3 className={HEADER_ICON_CLASSNAME} />
            </Button>
            {/* Help button */}
            <Button variant="ghost" size="icon" onClick={onHelpClick}>
              <HelpCircle className={HEADER_ICON_CLASSNAME} />
            </Button>
            {/* Settings button */}
            <Button variant="ghost" size="icon" onClick={onSettingsClick}>
              <Settings className={HEADER_ICON_CLASSNAME} />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
