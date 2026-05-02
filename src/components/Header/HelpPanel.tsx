import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';

// Props interface for the HelpPanel component
interface HelpPanelProps {
  isOpen: boolean; // Controls panel visibility
  onClose: () => void; // Callback to close the panel
}

// =============================================================================
// Static text content
// =============================================================================
const PANEL_TITLE = 'How to Play';
const PANEL_DESCRIPTION = 'Master the daily puzzle challenge!';

const OBJECTIVE_HEADING = 'Objective';
const OBJECTIVE_INTRO =
  "Fit all the puzzle pieces onto the grid while keeping open the 3 highlighted cells for today's month, date, and day of the week.";
const OBJECTIVE_BULLETS: string[] = [
  'Highlighted cells cannot be covered.',
  'Every piece must stay inside the grid boundaries without overlap.',
];

const HOW_TO_PLAY_HEADING = 'How to Play';
const DRAG_DROP_LEAD = 'pieces from the tray at the bottom onto the grid.';

const VALID_PLACEMENT_LABEL = 'Valid Placement Rules:';
const VALID_PLACEMENT_BULLETS: string[] = [
  'Pieces cannot extend outside the grid.',
  'Pieces cannot overlap each other.',
  'Pieces cannot cover highlighted cells.',
];

const ORIENTATION_LABEL = 'Orientation Controls:';
const ORIENTATION_BULLETS: string[] = [
  'Tap a piece to select it.',
  'Use the rotate buttons to spin clockwise/counterclockwise.',
  'Use the flip buttons to flip vertically or horizontally.',
  'Once oriented correctly, drag into position.',
];

const REMOVING_LABEL = 'Removing Pieces:';
const REMOVING_BULLETS: string[] = [
  'Tap a piece already placed to remove it.',
  'Removing a piece does not add to your move count.',
];

const SNAP_LABEL = 'Snap Assist:';
const SNAP_BULLETS: string[] = [
  'Pieces snap into place when positioned correctly.',
];

const SCORING_HEADING = 'Scoring';
const SCORING_BULLETS: string[] = [
  'Each piece placed = +1 move.',
  'You must place all 10 pieces, so the minimum (perfect) score is 10.',
  'Try to complete the puzzle in as few moves as possible!',
];

const DAILY_HEADING = 'Daily Challenge';
const DAILY_LINES: string[] = [
  'The 3 highlighted cells update every day to match the current date.',
  'That means you get a brand-new puzzle every single day!',
];

const PRO_TIPS_HEADING = 'Pro Tips';
const PRO_TIPS_BULLETS: string[] = [
  'Start with corner and edge pieces for an easier foundation.',
  'Look for uniquely shaped pieces that only fit in certain spots.',
  'Plan ahead — placing one piece may block another later.',
  "Patterns emerge over time — the more you play, the sharper you'll get.",
];

// =============================================================================
// className constants (light + dark variants pre-defined)
// =============================================================================
const SHEET_CONTENT_CLASS =
  'w-full sm:w-[400px] md:w-[540px] max-w-[90vw] p-0 bg-background text-foreground';
const SHEET_HEADER_CLASS = 'p-4 sm:p-6 pb-0';
const SCROLL_AREA_CLASS = 'h-[calc(100vh-80px)] px-4 sm:px-6';
const SCROLL_INNER_CLASS = 'space-y-6 pb-6';

// Standard info section card (used by Objective, How to Play, Scoring, Daily)
const SECTION_CARD_CLASS =
  'p-4 rounded-lg bg-gray-50 dark:bg-gray-800/60 border border-transparent dark:border-gray-700';
const SECTION_HEADING_CLASS =
  'text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100';
const SECTION_BODY_CLASS =
  'text-gray-600 dark:text-gray-300 space-y-2';
const SECTION_BODY_SPACED_CLASS =
  'text-gray-600 dark:text-gray-300 space-y-3';
const SECTION_LIST_CLASS = 'ml-4 space-y-1';
const SUB_LABEL_CLASS = 'font-medium text-gray-800 dark:text-gray-200';
const STRONG_CLASS = 'text-gray-900 dark:text-gray-100';

// Pro tips highlighted card
const TIPS_CARD_CLASS =
  'bg-blue-50 dark:bg-blue-950/40 border border-transparent dark:border-blue-900 p-6 rounded-lg';
const TIPS_HEADING_CLASS =
  'font-semibold mb-2 text-blue-800 dark:text-blue-300';
const TIPS_LIST_CLASS =
  'text-sm space-y-1 text-blue-700 dark:text-blue-200';

// =============================================================================
// Bullet list helper — no logic in JSX, just maps a pre-defined array
// =============================================================================
interface BulletListProps {
  items: string[];
  className?: string;
}

const BulletList: React.FC<BulletListProps> = ({ items, className = SECTION_LIST_CLASS }) => {
  return (
    <ul className={className}>
      {items.map((item) => (
        <li key={item}>• {item}</li>
      ))}
    </ul>
  );
};

/**
 * Help panel that provides game instructions and tips.
 * Displays comprehensive guide on how to play Calendle.
 * Uses shadcn/ui Sheet component for slide-out panel behavior.
 * Fully supports both light and dark themes via Tailwind dark: variants.
 *
 * @param props - Component props for controlling panel state
 */
const HelpPanel: React.FC<HelpPanelProps> = ({ isOpen, onClose }) => {
  // ---------------------------------------------------------------------------
  // Pre-build all section subtrees as variables (no conditionals in return)
  // ---------------------------------------------------------------------------
  const objectiveSection = (
    <div className={SECTION_CARD_CLASS}>
      <h3 className={SECTION_HEADING_CLASS}>{OBJECTIVE_HEADING}</h3>
      <div className={SECTION_BODY_CLASS}>
        <p>{OBJECTIVE_INTRO}</p>
        <BulletList items={OBJECTIVE_BULLETS} />
      </div>
    </div>
  );

  const howToPlaySection = (
    <div className={SECTION_CARD_CLASS}>
      <h3 className={SECTION_HEADING_CLASS}>{HOW_TO_PLAY_HEADING}</h3>
      <div className={SECTION_BODY_SPACED_CLASS}>
        <p>
          <strong className={STRONG_CLASS}>Drag &amp; Drop</strong> {DRAG_DROP_LEAD}
        </p>

        <div>
          <p className={SUB_LABEL_CLASS}>{VALID_PLACEMENT_LABEL}</p>
          <BulletList items={VALID_PLACEMENT_BULLETS} />
        </div>

        <div>
          <p className={SUB_LABEL_CLASS}>{ORIENTATION_LABEL}</p>
          <BulletList items={ORIENTATION_BULLETS} />
        </div>

        <div>
          <p className={SUB_LABEL_CLASS}>{REMOVING_LABEL}</p>
          <BulletList items={REMOVING_BULLETS} />
        </div>

        <div>
          <p className={SUB_LABEL_CLASS}>{SNAP_LABEL}</p>
          <BulletList items={SNAP_BULLETS} />
        </div>
      </div>
    </div>
  );

  const scoringSection = (
    <div className={SECTION_CARD_CLASS}>
      <h3 className={SECTION_HEADING_CLASS}>{SCORING_HEADING}</h3>
      <div className={SECTION_BODY_CLASS}>
        {SCORING_BULLETS.map((line) => (
          <p key={line}>• {line}</p>
        ))}
      </div>
    </div>
  );

  const dailySection = (
    <div className={SECTION_CARD_CLASS}>
      <h3 className={SECTION_HEADING_CLASS}>{DAILY_HEADING}</h3>
      <div className={SECTION_BODY_CLASS}>
        {DAILY_LINES.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
    </div>
  );

  const proTipsSection = (
    <div className={TIPS_CARD_CLASS}>
      <h4 className={TIPS_HEADING_CLASS}>{PRO_TIPS_HEADING}</h4>
      <BulletList items={PRO_TIPS_BULLETS} className={TIPS_LIST_CLASS} />
    </div>
  );

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className={SHEET_CONTENT_CLASS}>
        <SheetHeader className={SHEET_HEADER_CLASS}>
          <SheetTitle>{PANEL_TITLE}</SheetTitle>
          <SheetDescription>{PANEL_DESCRIPTION}</SheetDescription>
        </SheetHeader>

        <ScrollArea className={SCROLL_AREA_CLASS}>
          <div className={SCROLL_INNER_CLASS}>
            {objectiveSection}
            {howToPlaySection}
            {scoringSection}
            {dailySection}
            {proTipsSection}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default HelpPanel;
