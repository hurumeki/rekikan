/**
 * localStorage に置く小さな状態のための共通レイヤー。
 *
 * 進捗・カード統計・地層の既読記録はどれも
 * 「読む → JSON.parse → 検証 → try/catch → 書く」を必要とし、
 * さらに useSyncExternalStore 用のスナップショットを求められる。
 * 同じ作法を各所で書き直すと、保存形式を 1 つ変えるたびに
 * 複数ファイルを直すことになるため、ここに集約する。
 *
 * - 保存は必ずバージョン封筒つき（`{ version, data }`）
 * - 読み込みは raw 文字列が変わったときだけ parse し、参照を安定させる
 *   （useSyncExternalStore は毎レンダー getSnapshot を呼ぶため）
 * - 書き込み・読み込みの失敗は握りつぶす（プライベートブラウズ・容量超過）
 */
export interface LocalStore<T> {
  /** 現在の値。参照は内容が変わるまで安定する */
  read(): T;
  /** 保存できたら true */
  write(value: T): boolean;
  /** 現在の値を関数で更新して保存する */
  update(updater: (current: T) => T): T;
  /** useSyncExternalStore 用 */
  subscribe(onChange: () => void): () => void;
  getSnapshot(): T;
  getServerSnapshot(): T;
}

export interface LocalStoreOptions<T> {
  key: string;
  version: number;
  /** 未保存・壊れている・復元できないときの値 */
  empty: T;
  /**
   * 保存されていた中身を検証して現在の形に直す。
   * `version` は保存時のバージョン（封筒がない古い形式では 0）。
   */
  parse: (data: unknown, version: number) => T;
}

interface Envelope {
  version: number;
  data: unknown;
}

function isEnvelope(v: unknown): v is Envelope {
  return !!v && typeof v === 'object' && typeof (v as Envelope).version === 'number';
}

/**
 * 保存されていた中身と、そのバージョンを取り出す。
 *
 * 封筒の形は 3 通りありうる:
 *   1. `{ version, data }`          … 現在の形
 *   2. `{ version, <独自キー> }`    … 共通化する前に各モジュールが書いていた形
 *   3. 封筒なし                     … バージョン管理を始める前の形
 * 2 と 3 は中身の取り出し方がモジュールごとに違うため、丸ごと parse に渡す。
 */
function unwrap(parsed: unknown): { data: unknown; version: number } {
  if (isEnvelope(parsed)) {
    return parsed.data !== undefined
      ? { data: parsed.data, version: parsed.version }
      : { data: parsed, version: parsed.version };
  }
  return { data: parsed, version: 0 };
}

export function createLocalStore<T>({
  key,
  version,
  empty,
  parse,
}: LocalStoreOptions<T>): LocalStore<T> {
  const frozenEmpty = Object.freeze(empty) as T;

  let cachedRaw: string | null | undefined;
  let cachedValue: T = frozenEmpty;
  const listeners = new Set<() => void>();

  function readRaw(): string | null {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  function read(): T {
    const raw = readRaw();
    if (raw === cachedRaw) return cachedValue;

    cachedRaw = raw;
    cachedValue = frozenEmpty;

    if (raw) {
      try {
        const { data, version: storedVersion } = unwrap(JSON.parse(raw));
        cachedValue = parse(data, storedVersion);
      } catch {
        cachedValue = frozenEmpty;
      }
    }

    return cachedValue;
  }

  function notify(): void {
    for (const listener of listeners) listener();
  }

  function write(value: T): boolean {
    if (typeof window === 'undefined') return false;
    const envelope: Envelope = { version, data: value };
    let raw: string;
    try {
      raw = JSON.stringify(envelope);
    } catch {
      return false;
    }

    try {
      localStorage.setItem(key, raw);
    } catch {
      // 保存できなくても画面は動かす（プライベートブラウズ・容量超過）
      return false;
    }

    cachedRaw = raw;
    cachedValue = value;
    notify();
    return true;
  }

  function update(updater: (current: T) => T): T {
    const next = updater(read());
    write(next);
    return next;
  }

  function subscribe(onChange: () => void): () => void {
    listeners.add(onChange);
    // 他タブでの更新にも追従する
    const onStorage = (event: StorageEvent) => {
      if (event.key === null || event.key === key) onChange();
    };
    if (typeof window !== 'undefined') window.addEventListener('storage', onStorage);

    return () => {
      listeners.delete(onChange);
      if (typeof window !== 'undefined') window.removeEventListener('storage', onStorage);
    };
  }

  return {
    read,
    write,
    update,
    subscribe,
    getSnapshot: read,
    // 静的書き出しされた HTML には保存内容が含まれないため、
    // サーバー側スナップショットは常に空にしてハイドレーション不一致を避ける
    getServerSnapshot: () => frozenEmpty,
  };
}
