import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Visitors from './Visitors';
import { visitorTranslations } from './visitorTranslations';

const renderAt = (language: string) =>
  render(
    <MemoryRouter initialEntries={[{ pathname: '/visitors', state: { language } }]}>
      <Visitors />
    </MemoryRouter>
  );

describe('Visitor guide', () => {
  test('should have every English key in all other languages', () => {
    const englishKeys = Object.keys(visitorTranslations.en);
    ['de', 'fr', 'it'].forEach(language => {
      const missing = englishKeys.filter(key => !visitorTranslations[language][key]);
      expect(missing).toEqual([]);
    });
  });

  test('should render the guide with a recommended option', () => {
    renderAt('en');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Visiting Switzerland?');
    expect(screen.getByText('Our pick for your trip')).toBeInTheDocument();
    expect(screen.getByText('What is Interrail (and Eurail)?')).toBeInTheDocument();
  });

  test('should price the whole group and let children travel free with a pass', () => {
    renderAt('en');
    // Default: two adults, 7 days, 4 travel days at CHF 55, one mountain trip
    expect(screen.getByText('Total for 2 travellers')).toBeInTheDocument();
    expect(screen.getAllByText('CHF 650').length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: 'Children +' }));
    expect(screen.getByText('Total for 3 travellers')).toBeInTheDocument();
    expect(screen.getAllByText('CHF 650').length).toBeGreaterThan(0);
    expect(screen.getByText(/children free with the Swiss Family Card/)).toBeInTheDocument();
  });

  test('should keep at least one adult or youth in the group', () => {
    renderAt('en');
    const removeAdult = screen.getByRole('button', { name: 'Adults −' });
    fireEvent.click(removeAdult);
    expect(removeAdult).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: 'Youth +' }));
    expect(removeAdult).not.toBeDisabled();
  });

  test('should open in the language chosen in the calculator', () => {
    renderAt('fr');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Vacances en Suisse');
  });

  test('should fall back to English for Romansh', () => {
    renderAt('rm');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Visiting Switzerland?');
  });
});
