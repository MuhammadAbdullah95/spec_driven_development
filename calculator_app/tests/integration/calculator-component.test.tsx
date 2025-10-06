import { render, screen, fireEvent } from '@testing-library/react';
import { Calculator } from '@/app/calculator/components/Calculator';

describe('Calculator Component Integration', () => {
  test('should render calculator interface', () => {
    render(<Calculator />);
    expect(screen.getByText(/Calculator/i)).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /display/i })).toBeInTheDocument();
  });

  test('should handle basic calculations', () => {
    render(<Calculator />);
    const display = screen.getByRole('textbox', { name: /display/i });
    
    fireEvent.click(screen.getByText('2'));
    fireEvent.click(screen.getByText('+'));
    fireEvent.click(screen.getByText('3'));
    fireEvent.click(screen.getByText('='));
    
    expect(display).toHaveValue('5');
  });

  test('should handle complex calculations', () => {
    render(<Calculator />);
    const display = screen.getByRole('textbox', { name: /display/i });
    
    fireEvent.click(screen.getByText('('));
    fireEvent.click(screen.getByText('2'));
    fireEvent.click(screen.getByText('+'));
    fireEvent.click(screen.getByText('3'));
    fireEvent.click(screen.getByText(')'));
    fireEvent.click(screen.getByText('×'));
    fireEvent.click(screen.getByText('4'));
    fireEvent.click(screen.getByText('='));
    
    expect(display).toHaveValue('20');
  });

  test('should clear the display', () => {
    render(<Calculator />);
    const display = screen.getByRole('textbox', { name: /display/i });
    
    fireEvent.click(screen.getByText('2'));
    fireEvent.click(screen.getByText('C'));
    
    expect(display).toHaveValue('');
  });
});