/**
 * Ablauf-Test der App: Alter bestätigen → Auftrag spielen → Bewertung mit Begründung →
 * Sammlung → "Neustart" (App neu laden) → Sammlung ist noch da. Plus Thema/Sprache umschalten.
 */
import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import App from '../App';

beforeAll(async () => { await AsyncStorage.clear(); });

async function flush() { await act(async () => { await new Promise((r) => setTimeout(r, 0)); }); }

it('kompletter Ablauf food, Sammlung übersteht Neustart', async () => {
  await render(<App />);
  await flush();
  await fireEvent.press(await screen.findByTestId('age-confirm'));
  await fireEvent.press(await screen.findByTestId('home-play'));
  await fireEvent.press(await screen.findByTestId('brief-quick_lunch'));
  for (const id of ['plate_white', 'base_couscous', 'main_tofu', 'side_tomatoes', 'garnish_lemon_zest']) await fireEvent.press(screen.getByTestId(`part-${id}`));
  await fireEvent.press(screen.getByTestId('filter-golden'));
  await fireEvent.press(screen.getByTestId('rate'));
  expect(await screen.findByTestId('result-stars')).toBeTruthy();
  expect(screen.getByTestId('reason-time')).toBeTruthy();
  expect(screen.getByText('Perfect – the brief is fully met!')).toBeTruthy();
  await flush();
  await screen.unmount();

  // Neustart
  await render(<App />);
  await flush();
  await fireEvent.press(await screen.findByTestId('home-collection'));
  expect(await screen.findAllByTestId('collection-item')).toHaveLength(1);
  await fireEvent.press(screen.getByTestId('back'));

  // Thema und Sprache umschalten
  await fireEvent.press(screen.getByTestId('home-settings'));
  await fireEvent.press(screen.getByTestId('theme-tattoo'));
  await fireEvent.press(screen.getByTestId('lang-de'));
  await fireEvent.press(screen.getByTestId('back'));
  expect(await screen.findByText('Tinten-Studio')).toBeTruthy();
  await fireEvent.press(screen.getByTestId('home-play'));
  expect(await screen.findByText('Das erste Tattoo')).toBeTruthy();
  await flush();
  await screen.unmount();

  await render(<App />);
  await flush();
  expect(await screen.findByText('Tinten-Studio')).toBeTruthy();
  await screen.unmount();
});

it('gesperrte Premium-Teile lassen sich nicht wählen', async () => {
  await render(<App />);
  await flush();
  await fireEvent.press(await screen.findByTestId('home-play'));
  await fireEvent.press(await screen.findByTestId('brief-first_wrist'));
  const premium = screen.getByTestId('part-motif_snake');
  expect(premium.props.accessibilityState).toEqual(expect.objectContaining({ disabled: true }));
  await screen.unmount();
});
