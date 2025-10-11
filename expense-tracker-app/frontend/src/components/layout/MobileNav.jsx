import React from 'react';
import { 
  Home, 
  Plus, 
  Tag, 
  BarChart3, 
  Menu
} from 'lucide-react';

const MobileNav = ({ 
  currentPage, 
  onNavigate, 
  onMenuToggle,
  className = '' 
}) => {
  const navigationItems = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'add-expense', label: 'Add', icon: Plus },
    { id: 'categories', label: 'Categories', icon: Tag },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <div className={`
      fixed bottom-0 left-0 right-0 z-40 lg:hidden
      bg-white/90 backdrop-blur-xl border-t border-white/20 shadow-2xl
      ${className}
    `}>
      <div className="flex items-center justify-around px-2 py-2 safe-area-pb">
        {/* Menu Button */}
        <button
          onClick={onMenuToggle}
          className="flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-200 hover:bg-slate-100 min-h-[60px] min-w-[60px]"
        >
          <Menu size={24} className="text-slate-600" />
          <span className="text-xs text-slate-500 mt-1 font-medium">Menu</span>
        </button>

        {/* Navigation Items */}
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`
                flex flex-col items-center justify-center p-3 rounded-2xl
                transition-all duration-200 min-h-[60px] min-w-[60px]
                ${isActive 
                  ? 'bg-primary text-white shadow-lg shadow-primary/25 scale-105' 
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800 hover:scale-105'
                }
              `}
            >
              <Icon 
                size={24} 
                className={`
                  transition-transform duration-200
                  ${isActive ? 'text-white' : ''}
                `}
              />
              <span className={`
                text-xs mt-1 font-medium
                ${isActive ? 'text-white' : 'text-slate-500'}
              `}>
                {item.label}
              </span>
              
              {/* Active indicator dot */}
              {isActive && (
                <div className="absolute -top-1 w-1 h-1 bg-white rounded-full animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MobileNav;
