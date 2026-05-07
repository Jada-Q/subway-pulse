/**
 * Tokyo Metro lines as Beck-style abstract diagrams.
 * Polylines are NOT geographically accurate — they are hand-authored
 * editorial polylines drawn in 0..1 percentage space (x_pct, y_pct) so they
 * scale to any viewport. Each line gets a slight vertical band + organic
 * bends so the five lines don't all look like straight horizontals.
 */

export type LineId =
  | "yamanote"
  | "marunouchi"
  | "ginza"
  | "hibiya"
  | "chiyoda";

export interface Station {
  /** Japanese name (kanji/kana). */
  name: string;
  /** Romaji. */
  romaji: string;
  /** 0..1 progress along the polyline. */
  position: number;
}

export interface SubwayLine {
  id: LineId;
  /** Display name (kanji + romaji). */
  name: string;
  romaji: string;
  /** Official line color, hex. */
  color: string;
  /**
   * Polyline as percentage points, [x_pct, y_pct] in 0..1 space.
   * 6-10 control points each; gentle bends, no straight horizontals.
   */
  polyline: Array<[number, number]>;
  /** Stations along the line; position is 0..1 along the polyline. */
  stations: Station[];
  /** Average headway in seconds — how often a new train spawns. */
  headwaySeconds: number;
  /** Wall-clock seconds for a train to traverse end-to-end. */
  endToEndSeconds: number;
}

/**
 * 5 lines stacked vertically across roughly y=0.16 .. y=0.84.
 * Each gets:
 *   - a starting x near 0.06, ending x near 0.94 (full-bleed)
 *   - 6-9 control points
 *   - a slight vertical bias so the line "bends" downward or upward
 *   - 8-12 stations spaced unevenly (real-feeling, not uniform)
 */
export const LINES: Record<LineId, SubwayLine> = {
  yamanote: {
    id: "yamanote",
    name: "山手線",
    romaji: "Yamanote",
    color: "#9acd32",
    polyline: [
      [0.06, 0.18],
      [0.18, 0.16],
      [0.30, 0.21],
      [0.42, 0.17],
      [0.55, 0.22],
      [0.68, 0.18],
      [0.80, 0.20],
      [0.94, 0.16],
    ],
    stations: [
      { name: "東京", romaji: "Tokyo", position: 0.04 },
      { name: "有楽町", romaji: "Yurakucho", position: 0.13 },
      { name: "新橋", romaji: "Shimbashi", position: 0.22 },
      { name: "品川", romaji: "Shinagawa", position: 0.34 },
      { name: "渋谷", romaji: "Shibuya", position: 0.46 },
      { name: "原宿", romaji: "Harajuku", position: 0.54 },
      { name: "新宿", romaji: "Shinjuku", position: 0.66 },
      { name: "池袋", romaji: "Ikebukuro", position: 0.78 },
      { name: "上野", romaji: "Ueno", position: 0.90 },
      { name: "秋葉原", romaji: "Akihabara", position: 0.96 },
    ],
    headwaySeconds: 150,
    endToEndSeconds: 14 * 60,
  },
  marunouchi: {
    id: "marunouchi",
    name: "丸ノ内線",
    romaji: "Marunouchi",
    color: "#f62e36",
    polyline: [
      [0.06, 0.34],
      [0.16, 0.36],
      [0.27, 0.32],
      [0.38, 0.37],
      [0.50, 0.34],
      [0.62, 0.38],
      [0.74, 0.34],
      [0.86, 0.36],
      [0.94, 0.33],
    ],
    stations: [
      { name: "荻窪", romaji: "Ogikubo", position: 0.03 },
      { name: "中野坂上", romaji: "Nakano-Sakaue", position: 0.14 },
      { name: "新宿", romaji: "Shinjuku", position: 0.24 },
      { name: "四ツ谷", romaji: "Yotsuya", position: 0.36 },
      { name: "赤坂見附", romaji: "Akasaka-Mitsuke", position: 0.45 },
      { name: "国会議事堂前", romaji: "Kokkai-Gijidomae", position: 0.53 },
      { name: "霞ケ関", romaji: "Kasumigaseki", position: 0.62 },
      { name: "東京", romaji: "Tokyo", position: 0.72 },
      { name: "大手町", romaji: "Otemachi", position: 0.79 },
      { name: "御茶ノ水", romaji: "Ochanomizu", position: 0.88 },
      { name: "池袋", romaji: "Ikebukuro", position: 0.97 },
    ],
    headwaySeconds: 180,
    endToEndSeconds: 16 * 60,
  },
  ginza: {
    id: "ginza",
    name: "銀座線",
    romaji: "Ginza",
    color: "#ff9500",
    polyline: [
      [0.06, 0.50],
      [0.17, 0.48],
      [0.29, 0.53],
      [0.41, 0.49],
      [0.53, 0.52],
      [0.65, 0.48],
      [0.78, 0.51],
      [0.90, 0.49],
      [0.94, 0.50],
    ],
    stations: [
      { name: "渋谷", romaji: "Shibuya", position: 0.03 },
      { name: "表参道", romaji: "Omotesando", position: 0.11 },
      { name: "青山一丁目", romaji: "Aoyama-Itchome", position: 0.20 },
      { name: "赤坂見附", romaji: "Akasaka-Mitsuke", position: 0.30 },
      { name: "虎ノ門", romaji: "Toranomon", position: 0.40 },
      { name: "新橋", romaji: "Shimbashi", position: 0.49 },
      { name: "銀座", romaji: "Ginza", position: 0.57 },
      { name: "日本橋", romaji: "Nihombashi", position: 0.66 },
      { name: "上野", romaji: "Ueno", position: 0.78 },
      { name: "浅草", romaji: "Asakusa", position: 0.95 },
    ],
    headwaySeconds: 210,
    endToEndSeconds: 15 * 60,
  },
  hibiya: {
    id: "hibiya",
    name: "日比谷線",
    romaji: "Hibiya",
    color: "#b5b5ac",
    polyline: [
      [0.06, 0.66],
      [0.18, 0.68],
      [0.30, 0.64],
      [0.42, 0.69],
      [0.54, 0.65],
      [0.66, 0.69],
      [0.78, 0.66],
      [0.90, 0.68],
      [0.94, 0.66],
    ],
    stations: [
      { name: "中目黒", romaji: "Naka-Meguro", position: 0.03 },
      { name: "恵比寿", romaji: "Ebisu", position: 0.10 },
      { name: "六本木", romaji: "Roppongi", position: 0.22 },
      { name: "神谷町", romaji: "Kamiyacho", position: 0.32 },
      { name: "霞ケ関", romaji: "Kasumigaseki", position: 0.42 },
      { name: "日比谷", romaji: "Hibiya", position: 0.50 },
      { name: "銀座", romaji: "Ginza", position: 0.57 },
      { name: "築地", romaji: "Tsukiji", position: 0.65 },
      { name: "秋葉原", romaji: "Akihabara", position: 0.78 },
      { name: "上野", romaji: "Ueno", position: 0.86 },
      { name: "北千住", romaji: "Kita-Senju", position: 0.97 },
    ],
    headwaySeconds: 210,
    endToEndSeconds: 17 * 60,
  },
  chiyoda: {
    id: "chiyoda",
    name: "千代田線",
    romaji: "Chiyoda",
    color: "#00bb85",
    polyline: [
      [0.06, 0.82],
      [0.17, 0.80],
      [0.29, 0.84],
      [0.41, 0.80],
      [0.53, 0.83],
      [0.65, 0.80],
      [0.78, 0.83],
      [0.90, 0.81],
      [0.94, 0.82],
    ],
    stations: [
      { name: "代々木上原", romaji: "Yoyogi-Uehara", position: 0.03 },
      { name: "明治神宮前", romaji: "Meiji-Jingumae", position: 0.12 },
      { name: "表参道", romaji: "Omotesando", position: 0.18 },
      { name: "赤坂", romaji: "Akasaka", position: 0.28 },
      { name: "国会議事堂前", romaji: "Kokkai-Gijidomae", position: 0.36 },
      { name: "霞ケ関", romaji: "Kasumigaseki", position: 0.43 },
      { name: "日比谷", romaji: "Hibiya", position: 0.50 },
      { name: "大手町", romaji: "Otemachi", position: 0.58 },
      { name: "新御茶ノ水", romaji: "Shin-Ochanomizu", position: 0.65 },
      { name: "湯島", romaji: "Yushima", position: 0.73 },
      { name: "西日暮里", romaji: "Nishi-Nippori", position: 0.84 },
      { name: "綾瀬", romaji: "Ayase", position: 0.96 },
    ],
    headwaySeconds: 240,
    endToEndSeconds: 18 * 60,
  },
};

export const LINE_ORDER: LineId[] = [
  "yamanote",
  "marunouchi",
  "ginza",
  "hibiya",
  "chiyoda",
];

export interface UrlParams {
  l?: string;
}

export type FocusMode = "all" | LineId;

export function resolveFocus(params: UrlParams | undefined): FocusMode {
  if (!params?.l) return "all";
  const k = params.l.toLowerCase();
  if (k === "all") return "all";
  if ((LINE_ORDER as string[]).includes(k)) return k as LineId;
  return "all";
}

/**
 * Data source mode — flipped to "live" when env wires up an ODPT proxy.
 * v1 ships in `demo-schedule` mode and is honest about it.
 */
export type DataMode = "demo-schedule" | "live-odpt";
export const DATA_MODE: DataMode = "demo-schedule";
export const DATA_MODE_LABEL: Record<DataMode, string> = {
  "demo-schedule": "demo · scheduled timing",
  "live-odpt": "live · ODPT realtime",
};
export const DATA_MODE_LABEL_JA: Record<DataMode, string> = {
  "demo-schedule":
    "列車位置は仮想ダイヤグラム。リアルタイムデータではありません。",
  "live-odpt": "列車位置は ODPT 経由のリアルタイム運行情報。",
};
