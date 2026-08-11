/**
 * IndexedDB 持久化存储工具
 * 用于离线编辑器场景数据的本地存储与恢复
 */

const DB_NAME = "offline-3d-editor";
const DB_VERSION = 1;
const STORE_SCENE = "scene"; // GLB 文件 + 配置
const STORE_BLOBS = "blobs"; // 背景图/环境贴图 Blob

let dbPromise = null;

function openDB() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_SCENE)) {
        db.createObjectStore(STORE_SCENE, { keyPath: "key" });
      }
      if (!db.objectStoreNames.contains(STORE_BLOBS)) {
        db.createObjectStore(STORE_BLOBS, { keyPath: "key" });
      }
    };
    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e.target.error);
  });
  return dbPromise;
}

function idbPut(storeName, data) {
  return openDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, "readwrite");
        tx.objectStore(storeName).put(data);
        tx.oncomplete = () => resolve();
        tx.onerror = (e) => reject(e.target.error);
      })
  );
}

function idbGet(storeName, key) {
  return openDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, "readonly");
        const req = tx.objectStore(storeName).get(key);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = (e) => reject(e.target.error);
      })
  );
}

function idbGetAll(storeName) {
  return openDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, "readonly");
        const req = tx.objectStore(storeName).getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = (e) => reject(e.target.error);
      })
  );
}

function idbClear(storeName) {
  return openDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, "readwrite");
        tx.objectStore(storeName).clear();
        tx.oncomplete = () => resolve();
        tx.onerror = (e) => reject(e.target.error);
      })
  );
}

/**
 * 保存场景（GLB 文件 + 配置 JSON）
 * @param {Object<string, ArrayBuffer>} files - { filename: buffer }
 * @param {object} config - threeConfig 配置对象
 */
export async function saveSceneToIDB(files, config) {
  // 先清空旧数据
  await idbClear(STORE_SCENE);
  // 写入模型文件
  const filenames = Object.keys(files);
  for (let i = 0; i < filenames.length; i++) {
    const name = filenames[i];
    await idbPut(STORE_SCENE, {
      key: "model_" + i,
      filename: name,
      buffer: files[name],
    });
  }
  // 写入配置
  await idbPut(STORE_SCENE, { key: "config", config });
  await idbPut(STORE_SCENE, { key: "meta", fileCount: filenames.length, savedAt: Date.now() });
}

/**
 * 仅保存配置（不动模型文件）
 */
export async function saveConfigToIDB(config) {
  await idbPut(STORE_SCENE, { key: "config", config });
}

/**
 * 加载场景数据
 * @returns {{ config: object, files: File[] } | null}
 */
export async function loadSceneFromIDB() {
  const meta = await idbGet(STORE_SCENE, "meta");
  if (!meta) return null;
  const configData = await idbGet(STORE_SCENE, "config");
  const config = configData ? configData.config : {};
  const files = [];
  for (let i = 0; i < (meta.fileCount || 0); i++) {
    const item = await idbGet(STORE_SCENE, "model_" + i);
    if (item && item.buffer) {
      files.push(new File([item.buffer], item.filename, { type: "model/gltf-binary" }));
    }
  }
  return { config, files };
}

/**
 * 清除所有场景数据（重置场景）
 */
export async function clearSceneFromIDB() {
  await idbClear(STORE_SCENE);
  await idbClear(STORE_BLOBS);
}

/**
 * 保存 Blob（背景图/环境贴图）
 */
export async function saveBlobToIDB(key, blob) {
  await idbPut(STORE_BLOBS, { key, blob });
}

/**
 * 读取 Blob
 */
export async function loadBlobFromIDB(key) {
  const item = await idbGet(STORE_BLOBS, key);
  return item ? item.blob : null;
}
