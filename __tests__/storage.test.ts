import AsyncStorage from '@react-native-async-storage/async-storage';
import { addToCollection, defaultState, loadState, sanitize, saveState, STORAGE_KEY, type StorageAdapter } from '../src/storage/store';

const storage = AsyncStorage as unknown as StorageAdapter;

beforeEach(async () => { await AsyncStorage.clear(); });

describe('Lokale Speicherung', () => {
  it('ohne Daten: Standardwerte (Englisch, food, Alter nicht bestätigt)', async () => {
    const s = await loadState(storage);
    expect(s.settings).toEqual({ themeId: 'food', lang: 'en', ageConfirmed: false, region: 'DE' });
    expect(s.collection).toEqual([]);
  });

  it('Sammlung und Einstellungen überstehen einen Neustart', async () => {
    let s = defaultState();
    s = { ...s, settings: { ...s.settings, lang: 'de', themeId: 'tattoo', ageConfirmed: true } };
    s = addToCollection(s, { themeId: 'tattoo', briefId: 'first_wrist', selection: { motif: 'motif_moon' }, filter: 'golden', options: { tone: 'tone3' } }, 4);
    await saveState(storage, s);
    // "Neustart": frisch laden
    const loaded = await loadState(storage);
    expect(loaded).toEqual(s);
    expect(loaded.best['tattoo:first_wrist']).toBe(4);
  });

  it('beste Wertung bleibt erhalten, auch wenn ein schlechterer Versuch folgt', () => {
    const comp = { themeId: 'food', briefId: 'spring_light', selection: {}, filter: 'none', options: {} };
    let s = addToCollection(defaultState(), comp, 5);
    s = addToCollection(s, comp, 2);
    expect(s.best['food:spring_light']).toBe(5);
    expect(s.collection).toHaveLength(2);
  });

  it('kaputte Daten führen nicht zum Absturz', async () => {
    await AsyncStorage.setItem(STORAGE_KEY, '{kaputt');
    expect(await loadState(storage)).toEqual(defaultState());
    expect(sanitize({ settings: { lang: 'xx', themeId: 'nope' }, collection: [null, 5], best: { a: 'x' } })).toEqual(defaultState());
  });
});
