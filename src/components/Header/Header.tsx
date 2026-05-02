import React from 'react';
import { Button } from '@/components/ui/button';
import { BarChart3, Settings, HelpCircle, Menu } from 'lucide-react';
import Logo from './Logo';
import { APP_COLORS } from '@/lib/colors';

// Icon size class shared by all header buttons
const HEADER_ICON_CLASSNAME = 'h-5 w-5';

// Layout className constants
const HEADER_CLASSNAME = 'border-b border-border/50';
const HEADER_INNER_CLASSNAME = 'container mx-auto px-4 py-3';
const HEADER_ROW_CLASSNAME = 'flex items-center justify-between';
const LEFT_GROUP_CLASSNAME = 'flex items-center gap-2 md:gap-4';
const MENU_BUTTON_CLASSNAME = 'md:hidden';
const LOGO_GROUP_CLASSNAME = 'flex items-center gap-2 md:gap-3';
const TITLE_CLASSNAME = 'text-xl md:text-2xl font-semibold tracking-tight';
const RIGHT_GROUP_CLASSNAME = 'flex items-center gap-0.5 md:gap-1';

// App branding constants
const APP_TITLE_CALEN = 'Calen';
const APP_TITLE_DLE = 'dle';

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
  const titleStyleCalen = {
    color: APP_COLORS.primary.main,
    fontFamily: "'Outfit', sans-serif",
  };

  const titleStyleDle = {
    color: APP_COLORS.cell.highlight,
    fontFamily: "'Outfit', sans-serif",
  };

  return (
    <header className={HEADER_CLASSNAME}>
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
              <h1 className={TITLE_CLASSNAME}>
                <span style={titleStyleCalen}>{APP_TITLE_CALEN}</span>
                <span style={titleStyleDle}>{APP_TITLE_DLE}</span>
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
