import { useState } from 'react';
import './Calculator.css';

export function Calculator() {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [newNumber, setNewNumber] = useState(true);

  const handleNumber = (num: string) => {
    if (newNumber) {
      setDisplay(num);
      setNewNumber(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const handleOperation = (op: string) => {
    const current = parseFloat(display);
    
    if (previousValue !== null && operation && !newNumber) {
      const result = calculate(previousValue, current, operation);
      setDisplay(String(result));
      setPreviousValue(result);
    } else {
      setPreviousValue(current);
    }
    
    setOperation(op);
    setNewNumber(true);
  };

  const calculate = (prev: number, current: number, op: string): number => {
    switch (op) {
      case '+':
        return prev + current;
      case '-':
        return prev - current;
      case '*':
        return prev * current;
      case '/':
        return current !== 0 ? prev / current : prev;
      default:
        return current;
    }
  };

  const handleEquals = () => {
    if (previousValue !== null && operation) {
      const current = parseFloat(display);
      const result = calculate(previousValue, current, operation);
      setDisplay(String(result));
      setPreviousValue(null);
      setOperation(null);
      setNewNumber(true);
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setNewNumber(true);
  };

  const handleDecimal = () => {
    if (!display.includes('.')) {
      setDisplay(display + '.');
      setNewNumber(false);
    }
  };

  const handleBackspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
      setNewNumber(true);
    }
  };

  return (
    <div className="calc-app">
      {/* Display */}
      <div className="calc-app__display">
        <div className="calc-app__display-val">
          {display}
        </div>
      </div>

      {/* Buttons */}
      <div className="calc-app__grid">
        {/* Memory buttons row */}
        <CalcButton onClick={handleClear} text="MC" disabled />
        <CalcButton onClick={handleClear} text="MR" disabled />
        <CalcButton onClick={handleClear} text="MS" disabled />
        <CalcButton onClick={handleClear} text="M+" disabled />

        {/* Backspace, CE, C row */}
        <CalcButton onClick={handleBackspace} text="←" colSpan={2} />
        <CalcButton onClick={handleClear} text="CE" />
        <CalcButton onClick={handleClear} text="C" className="calc-app__btn--action" />

        {/* Number pad */}
        <CalcButton onClick={() => handleNumber('7')} text="7" />
        <CalcButton onClick={() => handleNumber('8')} text="8" />
        <CalcButton onClick={() => handleNumber('9')} text="9" />
        <CalcButton onClick={() => handleOperation('/')} text="/" className="calc-app__btn--action" />

        <CalcButton onClick={() => handleNumber('4')} text="4" />
        <CalcButton onClick={() => handleNumber('5')} text="5" />
        <CalcButton onClick={() => handleNumber('6')} text="6" />
        <CalcButton onClick={() => handleOperation('*')} text="*" className="calc-app__btn--action" />

        <CalcButton onClick={() => handleNumber('1')} text="1" />
        <CalcButton onClick={() => handleNumber('2')} text="2" />
        <CalcButton onClick={() => handleNumber('3')} text="3" />
        <CalcButton onClick={() => handleOperation('-')} text="-" className="calc-app__btn--action" />

        <CalcButton onClick={() => handleNumber('0')} text="0" />
        <CalcButton onClick={handleDecimal} text="." />
        <CalcButton onClick={handleEquals} text="=" className="calc-app__btn--action" />
        <CalcButton onClick={() => handleOperation('+')} text="+" className="calc-app__btn--action" />
      </div>
    </div>
  );
}

interface CalcButtonProps {
  onClick: () => void;
  text: string;
  colSpan?: number;
  disabled?: boolean;
  className?: string;
}

function CalcButton({ onClick, text, colSpan = 1, disabled = false, className = '' }: CalcButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        calc-app__btn
        ${colSpan === 2 ? 'calc-app__btn--col2' : ''}
        ${disabled ? 'calc-app__btn--disabled' : ''}
        ${className}
      `}
    >
      {text}
    </button>
  );
}

