'use client';

import React, { useState, useEffect } from 'react';

interface UnitConverterProps {
  theme?: 'light' | 'dark' | 'student';
}

interface ConversionUnit {
  name: string;
  symbol: string;
  toBase: (value: number) => number;
  fromBase: (value: number) => number;
}

interface ConversionCategory {
  name: string;
  icon: string;
  baseUnit: string;
  units: ConversionUnit[];
}

export const UnitConverter: React.FC<UnitConverterProps> = ({ theme = 'student' }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('length');
  const [fromUnit, setFromUnit] = useState<string>('');
  const [toUnit, setToUnit] = useState<string>('');
  const [inputValue, setInputValue] = useState<string>('1');
  const [result, setResult] = useState<string>('');

  const conversions: { [key: string]: ConversionCategory } = {
    length: {
      name: 'Length',
      icon: '📏',
      baseUnit: 'meters',
      units: [
        { name: 'Millimeters', symbol: 'mm', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
        { name: 'Centimeters', symbol: 'cm', toBase: (v) => v / 100, fromBase: (v) => v * 100 },
        { name: 'Meters', symbol: 'm', toBase: (v) => v, fromBase: (v) => v },
        { name: 'Kilometers', symbol: 'km', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
        { name: 'Inches', symbol: 'in', toBase: (v) => v * 0.0254, fromBase: (v) => v / 0.0254 },
        { name: 'Feet', symbol: 'ft', toBase: (v) => v * 0.3048, fromBase: (v) => v / 0.3048 },
        { name: 'Yards', symbol: 'yd', toBase: (v) => v * 0.9144, fromBase: (v) => v / 0.9144 },
        { name: 'Miles', symbol: 'mi', toBase: (v) => v * 1609.34, fromBase: (v) => v / 1609.34 }
      ]
    },
    weight: {
      name: 'Weight',
      icon: '⚖️',
      baseUnit: 'grams',
      units: [
        { name: 'Milligrams', symbol: 'mg', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
        { name: 'Grams', symbol: 'g', toBase: (v) => v, fromBase: (v) => v },
        { name: 'Kilograms', symbol: 'kg', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
        { name: 'Ounces', symbol: 'oz', toBase: (v) => v * 28.3495, fromBase: (v) => v / 28.3495 },
        { name: 'Pounds', symbol: 'lb', toBase: (v) => v * 453.592, fromBase: (v) => v / 453.592 },
        { name: 'Tons', symbol: 't', toBase: (v) => v * 1000000, fromBase: (v) => v / 1000000 }
      ]
    },
    temperature: {
      name: 'Temperature',
      icon: '🌡️',
      baseUnit: 'celsius',
      units: [
        { 
          name: 'Celsius', 
          symbol: '°C', 
          toBase: (v) => v, 
          fromBase: (v) => v 
        },
        { 
          name: 'Fahrenheit', 
          symbol: '°F', 
          toBase: (v) => (v - 32) * 5/9, 
          fromBase: (v) => v * 9/5 + 32 
        },
        { 
          name: 'Kelvin', 
          symbol: 'K', 
          toBase: (v) => v - 273.15, 
          fromBase: (v) => v + 273.15 
        }
      ]
    },
    volume: {
      name: 'Volume',
      icon: '🥤',
      baseUnit: 'liters',
      units: [
        { name: 'Milliliters', symbol: 'ml', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
        { name: 'Liters', symbol: 'L', toBase: (v) => v, fromBase: (v) => v },
        { name: 'Cubic Meters', symbol: 'm³', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
        { name: 'Fluid Ounces', symbol: 'fl oz', toBase: (v) => v * 0.0295735, fromBase: (v) => v / 0.0295735 },
        { name: 'Cups', symbol: 'cup', toBase: (v) => v * 0.236588, fromBase: (v) => v / 0.236588 },
        { name: 'Pints', symbol: 'pt', toBase: (v) => v * 0.473176, fromBase: (v) => v / 0.473176 },
        { name: 'Quarts', symbol: 'qt', toBase: (v) => v * 0.946353, fromBase: (v) => v / 0.946353 },
        { name: 'Gallons', symbol: 'gal', toBase: (v) => v * 3.78541, fromBase: (v) => v / 3.78541 }
      ]
    },
    area: {
      name: 'Area',
      icon: '⬜',
      baseUnit: 'square meters',
      units: [
        { name: 'Square Millimeters', symbol: 'mm²', toBase: (v) => v / 1000000, fromBase: (v) => v * 1000000 },
        { name: 'Square Centimeters', symbol: 'cm²', toBase: (v) => v / 10000, fromBase: (v) => v * 10000 },
        { name: 'Square Meters', symbol: 'm²', toBase: (v) => v, fromBase: (v) => v },
        { name: 'Square Kilometers', symbol: 'km²', toBase: (v) => v * 1000000, fromBase: (v) => v / 1000000 },
        { name: 'Square Inches', symbol: 'in²', toBase: (v) => v * 0.00064516, fromBase: (v) => v / 0.00064516 },
        { name: 'Square Feet', symbol: 'ft²', toBase: (v) => v * 0.092903, fromBase: (v) => v / 0.092903 },
        { name: 'Acres', symbol: 'ac', toBase: (v) => v * 4046.86, fromBase: (v) => v / 4046.86 }
      ]
    }
  };

  const performConversion = () => {
    if (!inputValue || !fromUnit || !toUnit || selectedCategory === '') return;

    const category = conversions[selectedCategory];
    const fromUnitObj = category.units.find(u => u.symbol === fromUnit);
    const toUnitObj = category.units.find(u => u.symbol === toUnit);

    if (!fromUnitObj || !toUnitObj) return;

    const inputNum = parseFloat(inputValue);
    if (isNaN(inputNum)) return;

    // Convert to base unit first, then to target unit
    const baseValue = fromUnitObj.toBase(inputNum);
    const convertedValue = toUnitObj.fromBase(baseValue);

    setResult(convertedValue.toFixed(6).replace(/\.?0+$/, ''));
  };

  useEffect(() => {
    if (fromUnit && toUnit && inputValue) {
      performConversion();
    }
  }, [inputValue, fromUnit, toUnit, selectedCategory]);

  useEffect(() => {
    // Set default units when category changes
    const category = conversions[selectedCategory];
    if (category && category.units.length >= 2) {
      setFromUnit(category.units[0].symbol);
      setToUnit(category.units[1].symbol);
    }
  }, [selectedCategory]);

  const getThemeClasses = () => {
    switch (theme) {
      case 'dark':
        return 'bg-gray-800 text-white border-gray-700';
      case 'light':
        return 'bg-white text-gray-900 border-gray-200';
      case 'student':
        return 'bg-white text-gray-900 border-green-200';
      default:
        return 'bg-white text-gray-900 border-green-200';
    }
  };

  return (
    <div className={`${getThemeClasses()} rounded-xl shadow-lg p-4 border-2`}>
      <h3 className="font-bold text-lg mb-4 flex items-center">
        <span className="mr-2">🔄</span>
        Unit Converter
      </h3>

      {/* Category Selection */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {Object.entries(conversions).map(([key, category]) => (
          <button
            key={key}
            onClick={() => setSelectedCategory(key)}
            className={`p-3 rounded-lg text-sm font-medium transition-colors flex items-center ${
              selectedCategory === key
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <span className="mr-2">{category.icon}</span>
            {category.name}
          </button>
        ))}
      </div>

      {selectedCategory && (
        <div className="space-y-4">
          {/* Input Section */}
          <div>
            <label className="block text-sm font-medium mb-2">From:</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter value"
              />
              <select
                value={fromUnit}
                onChange={(e) => setFromUnit(e.target.value)}
                className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {conversions[selectedCategory].units.map(unit => (
                  <option key={unit.symbol} value={unit.symbol}>
                    {unit.name} ({unit.symbol})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Conversion Arrow */}
          <div className="text-center">
            <div className="text-2xl">⬇️</div>
          </div>

          {/* Output Section */}
          <div>
            <label className="block text-sm font-medium mb-2">To:</label>
            <div className="flex gap-2">
              <div className="flex-1 p-2 bg-gray-100 border border-gray-300 rounded-lg font-mono text-lg">
                {result || '0'}
              </div>
              <select
                value={toUnit}
                onChange={(e) => setToUnit(e.target.value)}
                className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {conversions[selectedCategory].units.map(unit => (
                  <option key={unit.symbol} value={unit.symbol}>
                    {unit.name} ({unit.symbol})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Conversion Examples */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h5 className="font-semibold text-blue-800 mb-2">Quick Examples:</h5>
            <div className="text-sm text-blue-700 space-y-1">
              {selectedCategory === 'length' && (
                <>
                  <div>• 1 meter = 100 centimeters = 3.28 feet</div>
                  <div>• 1 kilometer = 1000 meters = 0.62 miles</div>
                </>
              )}
              {selectedCategory === 'weight' && (
                <>
                  <div>• 1 kilogram = 1000 grams = 2.20 pounds</div>
                  <div>• 1 pound = 16 ounces = 453.6 grams</div>
                </>
              )}
              {selectedCategory === 'temperature' && (
                <>
                  <div>• 0°C = 32°F = 273.15K (freezing point of water)</div>
                  <div>• 100°C = 212°F = 373.15K (boiling point of water)</div>
                </>
              )}
              {selectedCategory === 'volume' && (
                <>
                  <div>• 1 liter = 1000 milliliters = 0.26 gallons</div>
                  <div>• 1 gallon = 4 quarts = 3.79 liters</div>
                </>
              )}
              {selectedCategory === 'area' && (
                <>
                  <div>• 1 m² = 10,000 cm² = 10.76 ft²</div>
                  <div>• 1 acre = 4,047 m² = 43,560 ft²</div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
