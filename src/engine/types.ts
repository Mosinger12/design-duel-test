/**
 * Themen-neutrale Datentypen der Engine.
 * Alle themenspezifischen Inhalte kommen aus /themes/<name>/*.json.
 */

export type Tier = 'free' | 'premium';

/** Optionale kommerzielle Felder für Aufträge und Teile (nur sichtbar mit Schalter sponsoredContent). */
export interface CommercialFields {
  /** Name des (fiktiven) Sponsors. Ein nicht-leerer Wert macht den Eintrag zu gesponsertem Inhalt. */
  sponsor?: string;
  /** Zusatz-Text des Sponsors. Ersetzt NIE die Kennzeichnung "Sponsored". */
  label?: string;
  /** ISO-Datum (YYYY-MM-DD), ab dem der Eintrag sichtbar ist. */
  validFrom?: string;
  /** ISO-Datum (YYYY-MM-DD), bis zu dem (einschließlich) der Eintrag sichtbar ist. */
  validTo?: string;
  /** Regionen (ISO-3166 Ländercode, z. B. "DE"), in denen der Eintrag sichtbar ist. */
  region?: string | string[];
  /** Mindestalter. */
  minAge?: number;
}

/** Ein einfaches 2D-Grundelement. Text gibt es bewusst nicht (keine Schriftzüge). */
export type Primitive =
  | ({ type: 'circle'; cx: number; cy: number; r: number } & Paint)
  | ({ type: 'ellipse'; cx: number; cy: number; rx: number; ry: number } & Paint)
  | ({ type: 'rect'; x: number; y: number; width: number; height: number; rx?: number } & Paint)
  | ({ type: 'path'; d: string } & Paint)
  | ({ type: 'polygon'; points: string } & Paint)
  | ({ type: 'line'; x1: number; y1: number; x2: number; y2: number } & Paint);

export interface Paint {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
  fillOpacity?: number;
  strokeDasharray?: string;
  strokeLinecap?: 'butt' | 'round' | 'square';
  /** SVG-Transform, z. B. "rotate(20 0 0)" */
  transform?: string;
  /** Rolle für Stil-Anpassungen: "line" (Kontur) oder "fill" (Fläche). */
  role?: 'line' | 'fill';
}

/** Stil-Anpassungen, die ein Teil (z. B. Tattoo-Stil) auf "styled"-Ebenen anwendet. */
export interface StyleMods {
  strokeScale?: number;
  fillOpacity?: number;
  dash?: string;
  linecap?: 'butt' | 'round' | 'square';
}

export interface Visual {
  /** Name einer Form aus der Formbibliothek (src/render/glyphs.ts). */
  glyph?: string;
  /** Farben für die Form; "$name" verweist auf eine Variable (z. B. "$ink"). */
  colors?: string[];
  /** Startwert für die (deterministische) Zufallsverteilung. */
  seed?: number;
  /** Variablen, die dieses Teil für andere Ebenen bereitstellt (z. B. Tinte). */
  vars?: Record<string, string>;
  /** Stil-Anpassungen für alle "styled"-Ebenen. */
  style?: StyleMods;
}

export interface Part extends CommercialFields {
  id: string;
  slot: string;
  tier: Tier;
  tags: string[];
  attributes?: Record<string, number>;
  visual: Visual;
}

export interface SlotDef {
  id: string;
  required: boolean;
  /** Mittelpunkt und Maßstab der Ebene (Formen sind in einem 100er-Feld um 0,0 gezeichnet). */
  transform: { x: number; y: number; scale: number; rotate?: number };
  /** Ebene übernimmt Variablen und Stil-Anpassungen anderer Teile. */
  styled?: boolean;
}

export interface OptionValue {
  id: string;
  color: string;
}

export interface ThemeOption {
  id: string;
  /** Variable, in die der gewählte Farbwert geschrieben wird (z. B. "skin"). */
  var: string;
  values: OptionValue[];
}

export interface Backdrop {
  /** Feste Grundelemente des Hintergrunds. */
  base?: Primitive[];
  /** Varianten je Wert eines Auftrags-Kontextfelds (z. B. Körperstelle). */
  variantKey?: string;
  variants?: Record<string, Primitive[]>;
}

export interface ScaleBy {
  attribute: string;
  slots: string[];
  /** Maßstab je Attribut-Punkt. */
  unit: number;
  /** Maßstab, wenn die Summe 0 ist. */
  min: number;
}

export interface ThemeManifest {
  id: string;
  canvas: { width: number; height: number };
  backdrop: Backdrop;
  /** Reihenfolge = Zeichenreihenfolge (erste Ebene unten). */
  slots: SlotDef[];
  filters: string[];
  /** Reihenfolge der Auswahl in der Oberfläche (Standard: Reihenfolge von slots). */
  pickOrder?: string[];
  options?: ThemeOption[];
  /** Optional: Größe der "styled"-Ebenen hängt von einem Attribut ab (Tattoo-Größe). */
  scaleBy?: ScaleBy;
  /** Standardwerte für Farb-Variablen ($name). */
  defaultVars?: Record<string, string>;
  /** Kontextfelder eines Auftrags, die übersetzt angezeigt werden (Schlüssel "context.<feld>.<wert>"). */
  contextFields?: string[];
}

export interface CriterionRef {
  rule: string;
  params?: Record<string, unknown>;
  weight?: number;
}

export interface Brief extends CommercialFields {
  id: string;
  context?: Record<string, string>;
  criteria: CriterionRef[];
}

export interface RuleDef {
  id: string;
  type: string;
  params?: Record<string, unknown>;
  weight?: number;
}

export type Dictionary = Record<string, string>;

export interface BlockedSymbol {
  id: string;
  terms: string[];
}

export interface Theme {
  manifest: ThemeManifest;
  parts: Part[];
  briefs: Brief[];
  rules: RuleDef[];
  i18n: { en: Dictionary; de: Dictionary };
  blockedSymbols?: BlockedSymbol[];
}

/** Auswahl: Slot-ID -> Teil-ID (oder null = leer). */
export type Selection = Record<string, string | null>;

export interface Composition {
  themeId: string;
  briefId: string;
  selection: Selection;
  filter: string;
  /** Gewählte Optionen, z. B. { tone: "tone2" }. */
  options: Record<string, string>;
}

/** Übersetzbarer Parameter: { t: "schlüssel" } wird beim Anzeigen übersetzt. */
export type TextParam = string | number | { t: string };

export interface Reason {
  ruleId: string;
  outcome: string;
  textKey: string;
  params: Record<string, TextParam>;
  score: number;
  weight: number;
}

export interface Evaluation {
  complete: boolean;
  missingSlots: string[];
  /** Gewichteter Durchschnitt 0..1 */
  score: number;
  stars: 1 | 2 | 3 | 4 | 5;
  summaryKey: string;
  reasons: Reason[];
}
