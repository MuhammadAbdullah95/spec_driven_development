import React from 'react';
import { 
  Wallet, 
  Home, 
  PlusCircle, 
  BarChart3, 
  Tag, 
  X,
  Sparkles,
  Settings
} from 'lucide-react';
import Button from '../ui/Button';

const Sidebar = ({ 
  isOpen, 
  onClose, 
  currentPage, 
  onNavigate,
  className = '' 
}) => {
  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'add-expense', label: 'Add Expense', icon: PlusCircle },
    { id: 'categories', label: 'Categories', icon: Tag },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleNavigation = (pageId) => {
    onNavigate(pageId);
    // Close sidebar on mobile after navigation
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full w-80 z-50 transform transition-transform duration-300 ease-out
        lg:relative lg:translate-x-0 lg:w-72 lg:z-auto lg:flex-shrink-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${className}
      `}>
        <div className="h-full bg-white/90 backdrop-blur-xl border-r border-white/20 shadow-2xl">
          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-secondary text-white">
                  <Wallet size={24} />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-800">ExpenseTracker</h1>
                  <p className="text-sm text-slate-500">Manage your finances</p>
                </div>
              </div>
              
              {/* Close button for mobile */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="lg:hidden p-2 hover:bg-slate-100 rounded-full"
              >
                <X size={20} />
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.id)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left
                    transition-all duration-200 group
                    ${isActive 
                      ? 'bg-primary text-white shadow-lg shadow-primary/25' 
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                    }
                  `}
                >
                  <Icon 
                    size={20} 
                    className={`
                      transition-transform duration-200
                      ${isActive ? 'text-white' : 'group-hover:scale-110'}
                    `}
                  />
                  <span className="font-medium">{item.label}</span>
                  
                  {/* Active indicator */}
                  {isActive && (
                    <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-white/20">
              <h3 className="font-semibold text-slate-800 mb-1">Need Help?</h3>
              <p className="text-sm text-slate-600 mb-3">
                Get insights with our AI assistant
              </p>
              <Button variant="primary" size="sm" className="w-full">
                Ask AI Assistant
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
