import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import Card from '../ui/Card';

const StatCard = ({ 
  title, 
  amount, 
  icon: Icon, 
  trend, 
  changePercentage, 
  loading = false,
  currency = '$',
  className = '',
  delay = 0
}) => {
  const [displayAmount, setDisplayAmount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // Counter animation effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!isVisible || loading) return;

    const duration = 1500; // 1.5 seconds
    const steps = 60;
    const increment = amount / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(amount, increment * step);
      setDisplayAmount(current);

      if (step >= steps) {
        clearInterval(timer);
        setDisplayAmount(amount);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [amount, isVisible, loading]);

  const formatAmount = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getTrendColor = () => {
    if (trend === 'up') return 'text-success';
    if (trend === 'down') return 'text-red-500';
    return 'text-slate-500';
  };

  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp size={16} />;
    if (trend === 'down') return <TrendingDown size={16} />;
    return null;
  };

  if (loading) {
    return (
      <Card className={`p-6 ${className}`} hover={false}>
        <div className="animate-pulse">
          <div className="flex items-start justify-between mb-4">
            <div className="h-4 bg-slate-200 rounded w-24"></div>
            <div className="h-8 w-8 bg-slate-200 rounded-full"></div>
          </div>
          <div className="h-8 bg-slate-200 rounded w-32 mb-2"></div>
          <div className="h-4 bg-slate-200 rounded w-20"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card 
      className={`p-6 group cursor-pointer ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Header with title and icon */}
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-sm font-medium text-slate-600 uppercase tracking-wide">
          {title}
        </h3>
        {Icon && (
          <div className="p-2 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 text-primary group-hover:scale-110 transition-transform duration-200">
            <Icon size={24} />
          </div>
        )}
      </div>

      {/* Amount */}
      <div className="mb-3">
        <p className="text-3xl font-bold text-slate-800 tracking-tight">
          {formatAmount(displayAmount)}
        </p>
      </div>

      {/* Trend indicator */}
      {(trend && changePercentage !== undefined) && (
        <div className={`flex items-center gap-1 text-sm font-medium ${getTrendColor()}`}>
          {getTrendIcon()}
          <span>
            {Math.abs(changePercentage)}% {trend === 'up' ? 'increase' : 'decrease'}
          </span>
        </div>
      )}

      {/* Subtle animation on hover */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </Card>
  );
};

export default StatCard;
