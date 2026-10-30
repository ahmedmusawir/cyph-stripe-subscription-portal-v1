/**
 * @jest-environment jsdom
 */
// R-011 component layer: the real OwnerView on the real public registration store.
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { OwnerView } from '@/components/portal/register/OwnerView';
import { OWNER_DECLARATION, registrationHarness } from '@/services/portal';

const push = jest.fn();
jest.mock('next/navigation', () => ({ useRouter: () => ({ push, replace: jest.fn(), refresh: jest.fn() }) }));

function fill() {
  fireEvent.change(screen.getByLabelText(/First name/), { target: { value: 'Jordan' } });
  fireEvent.change(screen.getByLabelText(/Last name/), { target: { value: 'Ellis' } });
  fireEvent.change(screen.getByLabelText(/Work email/), { target: { value: 'jordan@demo-pharmacy.example' } });
  fireEvent.change(screen.getByLabelText(/Mobile phone/), { target: { value: '(555) 010-0144' } });
}

beforeEach(() => {
  sessionStorage.clear();
  push.mockClear();
  act(() => {
    registrationHarness.selectScenario('fresh');
  });
});

describe('OwnerView — owner declaration (R-011)', () => {
  it('has no job-title control and an unchecked, exactly worded, required declaration', async () => {
    render(<OwnerView notice={false} />);
    const box = (await screen.findByRole('checkbox', { name: new RegExp(OWNER_DECLARATION.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) })) as HTMLInputElement;
    expect(box.checked).toBe(false);
    expect(box.getAttribute('aria-required')).toBe('true');
    expect(screen.queryByLabelText(/Your role/)).toBeNull();
    expect(screen.queryByRole('combobox')).toBeNull();
    expect(screen.queryByText(/Pharmacist in charge/)).toBeNull();
  });

  it('blocks Continue without the declaration: summary + inline error, no navigation', async () => {
    render(<OwnerView notice={false} />);
    await screen.findByRole('checkbox');
    fill();
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    const inline = await screen.findByText('Confirm that you are the pharmacy owner to continue.', { selector: '#owner-declaration-err' }, { timeout: 3000 });
    expect(inline).toBeTruthy();
    expect(screen.getByRole('checkbox').getAttribute('aria-invalid')).toBe('true');
    expect(screen.getByRole('checkbox').getAttribute('aria-describedby')).toContain('owner-declaration-err');
    expect(screen.getByRole('link', { name: /Owner declaration/ }).getAttribute('href')).toBe('#owner-declaration');
    expect(push).not.toHaveBeenCalled();
  });

  it('continues once the owner ticks the declaration', async () => {
    render(<OwnerView notice={false} />);
    await screen.findByRole('checkbox');
    fill();
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    await waitFor(() => expect(push).toHaveBeenCalledWith('/demo/register/pharmacies?store=1'), { timeout: 3000 });
  });
});
