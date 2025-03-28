
import { memo } from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/ThemeProvider";

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  service?: 'crunchyroll' | 'netflix' | 'prime';
}

export const Logo = memo(function Logo({ 
  className, 
  size = 'md',
  service = 'crunchyroll'
}: LogoProps) {
  const { theme } = useTheme();
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12"
  };

  // Get the appropriate logo based on service and theme
  const getLogo = () => {
    // Calculate effective theme (for system mode)
    let effectiveTheme = theme;
    if (theme === 'system') {
      effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    
    switch (service) {
      case 'netflix':
        return effectiveTheme === "light" 
          ? "https://img.icons8.com/?size=512&id=YiCrW5hUkQCr&format=png" 
          : "https://raw.githubusercontent.com/OTTONRENT01/FOR-PHOTOS/refs/heads/main/Netflix-white.png";
      case 'prime':
        return effectiveTheme === "light" 
          ? "https://raw.githubusercontent.com/OTTONRENT01/FOR-PHOTOS/refs/heads/main/Prime-black.png" 
          : "https://raw.githubusercontent.com/OTTONRENT01/FOR-PHOTOS/refs/heads/main/Prime-white.png";
      case 'crunchyroll':
      default:
        return effectiveTheme === "light" 
          ? "https://static-00.iconduck.com/assets.00/crunchyroll-icon-512x512-4xi4az2l.png" 
          : "https://img.icons8.com/ios-glyphs/120/FFFFFF/crunchyroll.png";
    }
  };

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      <img 
        src={getLogo()} 
        alt={`${service} logo`} 
        className={cn(sizeClasses[size], "transition-all duration-300")} 
      />
    </div>
  );
});
