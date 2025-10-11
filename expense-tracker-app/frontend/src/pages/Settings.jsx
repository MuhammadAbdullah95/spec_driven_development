import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft,
  DollarSign,
  Target,
  Bell,
  Shield,
  Palette,
  Download,
  Upload,
  Trash2,
  Save,
  User,
  Mail,
  Calendar,
  TrendingUp
} from 'lucide-react';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useApp } from '../context/AppContext.jsx';

const Settings = ({ onNavigate }) => {
  const { state, actions } = useApp();
  
  // Settings state
  const [settings, setSettings] = useState({
    monthlyIncome: 3000,
    monthlyBudget: 1500,
    savingsGoal: 500,
    currency: 'USD',
    notifications: {
      budgetAlerts: true,
      weeklyReports: true,
      goalReminders: true
    },
    profile: {
      name: 'John Doe',
      email: 'john@example.com'
    }
  });

  const [activeTab, setActiveTab] = useState('budget');
  const [hasChanges, setHasChanges] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('expenseTrackerSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = () => {
    localStorage.setItem('expenseTrackerSettings', JSON.stringify(settings));
    setHasChanges(false);
    // Show success message or toast
  };

  const updateSetting = (path, value) => {
    setSettings(prev => {
      const newSettings = { ...prev };
      const keys = path.split('.');
      let current = newSettings;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newSettings;
    });
    setHasChanges(true);
  };

  const calculateBudgetRecommendation = () => {
    const expenses = state.expenses || [];
    if (expenses.length === 0) return settings.monthlyIncome * 0.5;
    
    // Calculate average monthly spending
    const totalSpending = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const avgMonthlySpending = totalSpending / Math.max(1, Math.ceil(expenses.length / 30));
    
    // Recommend 10% buffer above average spending
    return Math.round(avgMonthlySpending * 1.1);
  };

  const exportData = () => {
    const data = {
      expenses: state.expenses,
      categories: state.categories,
      settings: settings,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expense-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const tabs = [
    { id: 'budget', label: 'Budget & Income', icon: DollarSign },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'data', label: 'Data Management', icon: Download },
  ];

  return (
    <Layout currentPage="settings" onNavigate={onNavigate}>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => onNavigate('dashboard')}
            className="p-2 hover:bg-slate-100 rounded-full"
          >
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-slate-800">
              Settings
            </h1>
            <p className="text-slate-600">
              Manage your budget, preferences, and account settings
            </p>
          </div>
        </div>

        {/* Save Changes Bar */}
        {hasChanges && (
          <Card className="p-4 bg-gradient-to-r from-accent/10 to-accent/5 border border-accent/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                <span className="font-medium text-slate-800">You have unsaved changes</span>
              </div>
              <Button
                variant="primary"
                onClick={saveSettings}
                className="flex items-center gap-2"
              >
                <Save size={16} />
                Save Changes
              </Button>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card className="p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left
                        transition-all duration-200
                        ${activeTab === tab.id 
                          ? 'bg-primary text-white shadow-lg shadow-primary/25' 
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                        }
                      `}
                    >
                      <Icon size={20} />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Budget & Income Tab */}
            {activeTab === 'budget' && (
              <div className="space-y-6">
                <Card className="p-8">
                  <h2 className="text-xl font-bold text-slate-800 mb-6">💰 Income & Budget Settings</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Monthly Income */}
                    <div>
                      <Input
                        label="Monthly Income"
                        type="number"
                        value={settings.monthlyIncome}
                        onChange={(e) => updateSetting('monthlyIncome', parseFloat(e.target.value) || 0)}
                        icon={DollarSign}
                        placeholder="3000"
                      />
                      <p className="mt-2 text-sm text-slate-500">
                        Your total monthly income after taxes
                      </p>
                    </div>

                    {/* Monthly Budget */}
                    <div>
                      <Input
                        label="Monthly Budget"
                        type="number"
                        value={settings.monthlyBudget}
                        onChange={(e) => updateSetting('monthlyBudget', parseFloat(e.target.value) || 0)}
                        icon={Target}
                        placeholder="1500"
                      />
                      <p className="mt-2 text-sm text-slate-500">
                        How much you plan to spend each month
                      </p>
                    </div>

                    {/* Savings Goal */}
                    <div>
                      <Input
                        label="Monthly Savings Goal"
                        type="number"
                        value={settings.savingsGoal}
                        onChange={(e) => updateSetting('savingsGoal', parseFloat(e.target.value) || 0)}
                        icon={TrendingUp}
                        placeholder="500"
                      />
                      <p className="mt-2 text-sm text-slate-500">
                        Target amount to save each month
                      </p>
                    </div>

                    {/* Currency */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-3">
                        Currency
                      </label>
                      <div className="relative">
                        <select
                          value={settings.currency}
                          onChange={(e) => updateSetting('currency', e.target.value)}
                          className="w-full px-4 py-4 bg-white/90 backdrop-blur-xl border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/20 text-slate-800 font-medium appearance-none cursor-pointer"
                        >
                          <option value="USD">🇺🇸 USD - US Dollar ($)</option>
                          <option value="EUR">🇪🇺 EUR - Euro (€)</option>
                          <option value="GBP">🇬🇧 GBP - British Pound (£)</option>
                          <option value="CAD">🇨🇦 CAD - Canadian Dollar (C$)</option>
                          <option value="AUD">🇦🇺 AUD - Australian Dollar (A$)</option>
                          <option value="JPY">🇯🇵 JPY - Japanese Yen (¥)</option>
                          <option value="CHF">🇨🇭 CHF - Swiss Franc (CHF)</option>
                          <option value="CNY">🇨🇳 CNY - Chinese Yuan (¥)</option>
                          <option value="INR">🇮🇳 INR - Indian Rupee (₹)</option>
                          <option value="KRW">🇰🇷 KRW - South Korean Won (₩)</option>
                          <option value="SGD">🇸🇬 SGD - Singapore Dollar (S$)</option>
                          <option value="HKD">🇭🇰 HKD - Hong Kong Dollar (HK$)</option>
                          <option value="NOK">🇳🇴 NOK - Norwegian Krone (kr)</option>
                          <option value="SEK">🇸🇪 SEK - Swedish Krona (kr)</option>
                          <option value="DKK">🇩🇰 DKK - Danish Krone (kr)</option>
                          <option value="PLN">🇵🇱 PLN - Polish Złoty (zł)</option>
                          <option value="CZK">🇨🇿 CZK - Czech Koruna (Kč)</option>
                          <option value="HUF">🇭🇺 HUF - Hungarian Forint (Ft)</option>
                          <option value="RUB">🇷🇺 RUB - Russian Ruble (₽)</option>
                          <option value="BRL">🇧🇷 BRL - Brazilian Real (R$)</option>
                          <option value="MXN">🇲🇽 MXN - Mexican Peso ($)</option>
                          <option value="ARS">🇦🇷 ARS - Argentine Peso ($)</option>
                          <option value="CLP">🇨🇱 CLP - Chilean Peso ($)</option>
                          <option value="COP">🇨🇴 COP - Colombian Peso ($)</option>
                          <option value="PEN">🇵🇪 PEN - Peruvian Sol (S/)</option>
                          <option value="ZAR">🇿🇦 ZAR - South African Rand (R)</option>
                          <option value="EGP">🇪🇬 EGP - Egyptian Pound (£)</option>
                          <option value="NGN">🇳🇬 NGN - Nigerian Naira (₦)</option>
                          <option value="KES">🇰🇪 KES - Kenyan Shilling (KSh)</option>
                          <option value="MAD">🇲🇦 MAD - Moroccan Dirham (DH)</option>
                          <option value="TND">🇹🇳 TND - Tunisian Dinar (DT)</option>
                          <option value="AED">🇦🇪 AED - UAE Dirham (AED)</option>
                          <option value="SAR">🇸🇦 SAR - Saudi Riyal (SR)</option>
                          <option value="QAR">🇶🇦 QAR - Qatari Riyal (QR)</option>
                          <option value="KWD">🇰🇼 KWD - Kuwaiti Dinar (KD)</option>
                          <option value="BHD">🇧🇭 BHD - Bahraini Dinar (BD)</option>
                          <option value="OMR">🇴🇲 OMR - Omani Rial (OR)</option>
                          <option value="JOD">🇯🇴 JOD - Jordanian Dinar (JD)</option>
                          <option value="LBP">🇱🇧 LBP - Lebanese Pound (LL)</option>
                          <option value="ILS">🇮🇱 ILS - Israeli Shekel (₪)</option>
                          <option value="TRY">🇹🇷 TRY - Turkish Lira (₺)</option>
                          <option value="PKR">🇵🇰 PKR - Pakistani Rupee (Rs)</option>
                          <option value="BDT">🇧🇩 BDT - Bangladeshi Taka (৳)</option>
                          <option value="LKR">🇱🇰 LKR - Sri Lankan Rupee (Rs)</option>
                          <option value="NPR">🇳🇵 NPR - Nepalese Rupee (Rs)</option>
                          <option value="MMK">🇲🇲 MMK - Myanmar Kyat (K)</option>
                          <option value="THB">🇹🇭 THB - Thai Baht (฿)</option>
                          <option value="VND">🇻🇳 VND - Vietnamese Dong (₫)</option>
                          <option value="IDR">🇮🇩 IDR - Indonesian Rupiah (Rp)</option>
                          <option value="MYR">🇲🇾 MYR - Malaysian Ringgit (RM)</option>
                          <option value="PHP">🇵🇭 PHP - Philippine Peso (₱)</option>
                          <option value="TWD">🇹🇼 TWD - Taiwan Dollar (NT$)</option>
                        </select>
                        {/* Custom dropdown arrow */}
                        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                          <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-slate-500">
                        Select your preferred currency for displaying amounts
                      </p>
                    </div>
                  </div>

                  {/* Budget Insights */}
                  <div className="mt-8 p-6 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl border border-primary/20">
                    <h3 className="font-semibold text-slate-800 mb-4">💡 Budget Insights</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="font-medium text-slate-700">Savings Rate</div>
                        <div className="text-2xl font-bold text-primary">
                          {((settings.savingsGoal / settings.monthlyIncome) * 100).toFixed(1)}%
                        </div>
                      </div>
                      <div>
                        <div className="font-medium text-slate-700">Budget vs Income</div>
                        <div className="text-2xl font-bold text-secondary">
                          {((settings.monthlyBudget / settings.monthlyIncome) * 100).toFixed(1)}%
                        </div>
                      </div>
                      <div>
                        <div className="font-medium text-slate-700">Recommended Budget</div>
                        <div className="text-lg font-bold text-accent">
                          ${calculateBudgetRecommendation()}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <Card className="p-8">
                <h2 className="text-xl font-bold text-slate-800 mb-6">🔔 Notification Preferences</h2>
                
                <div className="space-y-6">
                  {Object.entries(settings.notifications).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                      <div>
                        <div className="font-medium text-slate-800">
                          {key === 'budgetAlerts' && 'Budget Alerts'}
                          {key === 'weeklyReports' && 'Weekly Reports'}
                          {key === 'goalReminders' && 'Goal Reminders'}
                        </div>
                        <div className="text-sm text-slate-500">
                          {key === 'budgetAlerts' && 'Get notified when you exceed budget limits'}
                          {key === 'weeklyReports' && 'Receive weekly spending summaries'}
                          {key === 'goalReminders' && 'Reminders about your savings goals'}
                        </div>
                      </div>
                      <button
                        onClick={() => updateSetting(`notifications.${key}`, !value)}
                        className={`
                          relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                          ${value ? 'bg-primary' : 'bg-slate-300'}
                        `}
                      >
                        <span
                          className={`
                            inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                            ${value ? 'translate-x-6' : 'translate-x-1'}
                          `}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <Card className="p-8">
                <h2 className="text-xl font-bold text-slate-800 mb-6">👤 Profile Information</h2>
                
                <div className="space-y-6">
                  <Input
                    label="Full Name"
                    value={settings.profile.name}
                    onChange={(e) => updateSetting('profile.name', e.target.value)}
                    icon={User}
                    placeholder="John Doe"
                  />
                  
                  <Input
                    label="Email Address"
                    type="email"
                    value={settings.profile.email}
                    onChange={(e) => updateSetting('profile.email', e.target.value)}
                    icon={Mail}
                    placeholder="john@example.com"
                  />

                  <div className="p-4 bg-gradient-to-br from-accent/10 to-accent/5 rounded-2xl border border-accent/20">
                    <h3 className="font-semibold text-slate-800 mb-2">🔒 Privacy & Security</h3>
                    <p className="text-sm text-slate-600">
                      Your data is stored locally on your device. We don't collect or share any personal information.
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Data Management Tab */}
            {activeTab === 'data' && (
              <div className="space-y-6">
                <Card className="p-8">
                  <h2 className="text-xl font-bold text-slate-800 mb-6">💾 Data Management</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Export Data */}
                    <div className="p-6 border border-slate-200 rounded-2xl">
                      <div className="flex items-center gap-3 mb-4">
                        <Download className="text-primary" size={24} />
                        <h3 className="font-semibold text-slate-800">Export Data</h3>
                      </div>
                      <p className="text-sm text-slate-600 mb-4">
                        Download all your expenses, categories, and settings as a backup file.
                      </p>
                      <Button
                        variant="primary"
                        onClick={exportData}
                        className="w-full"
                      >
                        Export Backup
                      </Button>
                    </div>

                    {/* Import Data */}
                    <div className="p-6 border border-slate-200 rounded-2xl">
                      <div className="flex items-center gap-3 mb-4">
                        <Upload className="text-secondary" size={24} />
                        <h3 className="font-semibold text-slate-800">Import Data</h3>
                      </div>
                      <p className="text-sm text-slate-600 mb-4">
                        Restore your data from a previously exported backup file.
                      </p>
                      <Button
                        variant="secondary"
                        className="w-full"
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = '.json';
                          input.onchange = (e) => {
                            const file = e.target.files[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (e) => {
                                try {
                                  const data = JSON.parse(e.target.result);
                                  // Handle import logic here
                                  console.log('Import data:', data);
                                } catch (error) {
                                  console.error('Invalid backup file');
                                }
                              };
                              reader.readAsText(file);
                            }
                          };
                          input.click();
                        }}
                      >
                        Import Backup
                      </Button>
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <div className="mt-8 p-6 bg-red-50 border border-red-200 rounded-2xl">
                    <div className="flex items-center gap-3 mb-4">
                      <Trash2 className="text-red-500" size={24} />
                      <h3 className="font-semibold text-red-800">Danger Zone</h3>
                    </div>
                    <p className="text-sm text-red-600 mb-4">
                      Permanently delete all your data. This action cannot be undone.
                    </p>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete ALL data? This cannot be undone.')) {
                          if (window.confirm('This will permanently delete all expenses, categories, and settings. Type "DELETE" to confirm.')) {
                            // Clear all data
                            localStorage.clear();
                            window.location.reload();
                          }
                        }
                      }}
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      Delete All Data
                    </Button>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
