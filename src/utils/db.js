import {
  BaseDirectory,
  createDir,
  exists,
  writeTextFile,
  readTextFile,
} from "@tauri-apps/api/fs";
import dayjs from "dayjs";
import _ from "lodash";

export const DB_FOLDER = "databases";
export const DB_IO_FILE = `${DB_FOLDER}\\io.json`;

export async function initDatabase() {
  const exist = await existDB(DB_IO_FILE);
  if (!exist) {
    await createDB(DB_IO_FILE);
  }
  const today = dayjs().format("YYYYMMDD");
  const r = await readDB(DB_IO_FILE);
  const t = Object.values(r).filter((r) => r.date === today)?.[0];
  if (!t) {
    r[today] = {
      date: today,
      inTime: "0000",
      outTime: "0000",
      memo: "",
    };
    await saveDB(DB_IO_FILE, r);
  }
}

export async function createDB(file) {
  const existDBFolder = await existDB(DB_FOLDER);
  if (!existDBFolder) {
    await createDir(DB_FOLDER, {
      dir: BaseDirectory.AppData,
      recursive: true,
    });
  }
  const existFile = await existDB(file);
  if (!existFile) {
    await writeTextFile(file, JSON.stringify({}), {
      dir: BaseDirectory.AppData,
    });
  }
}

export async function readDB(path) {
  const r = await readTextFile(path, {dir: BaseDirectory.AppData});
  return JSON.parse(r);
}

export async function saveDB(path, data) {
  await writeTextFile(path, JSON.stringify(data), {
    dir: BaseDirectory.AppData,
  });
}

export async function updateDB(path, key, data) {
  const r = await readDB(path, {dir: BaseDirectory.AppData});
  r[key] = {...r[key], ...data};
  await writeTextFile(path, JSON.stringify(r), {
    dir: BaseDirectory.AppData,
  });
}

export async function existDB(path) {
  return await exists(path, {
    dir: BaseDirectory.App,
  });
}
