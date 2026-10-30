/**
 * @jest-environment jsdom
 */
import { createRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { Counter } from '@/components/portal/Counter';
import { ErrorSummary, summarize } from '@/components/portal/ErrorSummary';

it('Counter cannot go below 1', () => {
  const onChange = jest.fn();
  render(<Counter id="c" value={1} onChange={onChange} />);
  const minus = screen.getByRole('button', { name: 'Fewer pharmacies' }) as HTMLButtonElement;
  expect(minus.disabled).toBe(true);
  fireEvent.click(screen.getByRole('button', { name: 'More pharmacies' }));
  expect(onChange).toHaveBeenCalledWith(2);
});

it('ErrorSummary lists fields in form order, links focus the field, and is a focus target', () => {
  const ref = createRef<HTMLDivElement>();
  render(
    <>
      <ErrorSummary ref={ref} items={summarize({ npi: 'Enter the 10-digit NPI.', name: 'Enter the pharmacy name.' }, [
        { key: 'name', fieldId: 'ph-name', label: 'Pharmacy name' },
        { key: 'npi', fieldId: 'ph-npi', label: 'NPI' },
      ])} />
      <input id="ph-name" />
      <input id="ph-npi" />
    </>,
  );
  expect(screen.getByRole('alert').textContent).toContain('Please fix 2 fields');
  const links = screen.getAllByRole('link');
  expect(links.map((l) => l.textContent)).toEqual(['Pharmacy name', 'NPI']);
  fireEvent.click(links[1]);
  expect(document.activeElement?.id).toBe('ph-npi');
  expect(ref.current?.tabIndex).toBe(-1);
});

it('user text renders inert', () => {
  render(<ErrorSummary items={[{ fieldId: 'x', label: '<img src=x onerror=alert(1)>', message: '<b>bold</b>' }]} />);
  expect(document.querySelector('img')).toBeNull();
  expect(screen.getByText('<img src=x onerror=alert(1)>')).toBeTruthy();
});
