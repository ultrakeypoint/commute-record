import {
  BaseDirectory,
  createDir,
  exists,
  writeTextFile,
  readTextFile,
} from "@tauri-apps/api/fs";

import {write, utils} from "xlsx";
import {save} from "@tauri-apps/api/dialog";
import {writeBinaryFile} from "@tauri-apps/api/fs";

import dayjs from "dayjs";
import _ from "lodash";
import {ElNotification} from "element-plus";

export const DB_FOLDER = "databases";
export const DB_IO_FILE = `${DB_FOLDER}\\io.json`;

export async function initDatabase() {
  try {
    const exist = await existDB(DB_IO_FILE);
    if (!exist) {
      await createDB(DB_IO_FILE);
    }
    const n = dayjs().format("YYYYMMDD");
    const r = await readDB(DB_IO_FILE);
    const t = Object.values(r).filter((r) => r.date === n)?.[0];
    if (!t) {
      r[n] = {
        date: n,
        inTime: "0000",
        outTime: "0000",
        memo: "",
      };
      await saveDB(DB_IO_FILE, r);
    }
  } catch (e) {
    console.log(e);
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

export async function removeDB(path, key) {
  const r = await readDB(path, {dir: BaseDirectory.AppData});
  // r[key] = {...r[key], ...data};
  delete r[key];
  await writeTextFile(path, JSON.stringify(r), {
    dir: BaseDirectory.AppData,
  });
}

export async function existDB(path) {
  return await exists(path, {
    dir: BaseDirectory.App,
  });
}

export async function exportDB(path, t) {
  const value = (i, v, f) => {
    switch (i) {
      case 0:
        return dayjs(v[f] + "000000").format("YYYY/MM/DD");
      case 1:
      case 2:
        return dayjs(v.date + v[f]).format("HH:mm");
      default:
        return v[f];
    }
  };

  try {
    const file = `${dayjs().format(
      "YYYY년MM월DD일 HH시 mm분 ss초"
    )}_출퇴근일지`;

    const r = await readDB(path, {dir: BaseDirectory.AppData});
    let values = _.sortBy(_.values(r), "date").reverse();

    const f = _.keys(values?.[0]);

    const h = f.map((f) => t(f));
    const v = values.map((v) =>
      f.map((f, i) => {
        return {
          t: "s",
          v: value(i, v, f),
        };
      })
    );

    const wb = utils.book_new();
    const ws = utils.aoa_to_sheet(
      [h, ...v],
      [{t: "t", z: "m/d/yy h:mm AM/PM"}]
    );
    ws["!cols"] = [{width: 10}];
    // ws["!cols"] = {width: 20};
    utils.book_append_sheet(wb, ws, file);

    saveFile(wb);

    async function saveFile(wb) {
      const filters = [{name: "Excel 97-2004 Workbook", extensions: ["xls"]}];
      const selected = await save({
        title: file,
        filters,
      });
      if (!selected) return;

      const bookType = selected.slice(selected.lastIndexOf(".") + 1);
      const d = write(wb, {type: "buffer", bookType});

      await writeBinaryFile(selected, d);

      ElNotification({
        title: "알림",
        message: "다운로드를 완료하였습니다.",
        type: "success",
        duration: 1000,
      });
    }
  } catch (e) {
    console.log(e);
    return false;
  }
}
