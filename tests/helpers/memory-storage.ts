/**
 * localStorage を使うモジュールを Node 上でテストするための最小のスタブ。
 *
 * createLocalStore は呼び出し時に window / localStorage を見るため、
 * import 順に関係なく、テスト開始前に install しておけばよい。
 */
export class MemoryStorage implements Pick<
  Storage,
  'getItem' | 'setItem' | 'removeItem' | 'clear'
> {
  private map = new Map<string, string>();

  getItem(key: string): string | null {
    return this.map.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.map.set(key, value);
  }

  removeItem(key: string): void {
    this.map.delete(key);
  }

  clear(): void {
    this.map.clear();
  }
}

/** globalThis に window / localStorage を生やし、そのストレージを返す。 */
export function installMemoryStorage(): MemoryStorage {
  const storage = new MemoryStorage();
  const target = globalThis as unknown as {
    window?: unknown;
    localStorage?: MemoryStorage;
    addEventListener?: () => void;
    removeEventListener?: () => void;
  };
  target.window = globalThis;
  target.localStorage = storage;
  // createLocalStore は他タブの更新を購読するために addEventListener を使う
  target.addEventListener ??= () => {};
  target.removeEventListener ??= () => {};
  return storage;
}
