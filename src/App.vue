<template>
  <div class="container">
    <el-container>
      <el-header>
        <h3>출/퇴근 작성 도우미</h3>
      </el-header>
      <el-main>
        <el-table
          :data="data"
          stripe>
          <el-table-column
            fixed
            prop="commute_date"
            label="날짜"
            width="150"
            align="center"
            sortable>
            <template #default="scope">
              {{ $dayjs(scope.row.commute_date).format("YYYY/MM/DD") }}
            </template>
          </el-table-column>
          <el-table-column
            prop="commute_in_time"
            label="출근시간"
            align="center">
            <template #default="scope">
              {{
                $dayjs(
                  `${scope.row.commute_date}${scope.row.commute_in_time}`
                ).format("HH:mm")
              }}
            </template>
          </el-table-column>
          <el-table-column
            prop="commute_out_time"
            label="퇴근시간"
            align="center">
            <template #default="scope">
              {{
                $dayjs(
                  `${scope.row.commute_date}${scope.row.commute_out_time}`
                ).format("HH:mm")
              }}
            </template>
          </el-table-column>
          <el-table-column
            prop="commute_work_time"
            label="근무시간"
            align="center">
            <template #default="scope">
              {{ viewWorkTime(scope) }}
            </template>
          </el-table-column>
          <el-table-column
            fixed="right"
            label="행동"
            align="center"
            width="160">
            <template #default="scope">
              <el-button
                type="success"
                @click="setInTime(scope.row)"
                :disabled="'' !== scope.row.commute_in_time">
                {{ "" !== scope.row.commute_in_time ? "마감" : "출근" }}
              </el-button>
              <el-button
                type="danger"
                @click="setOutTime(scope.row)"
                :disabled="'' !== scope.row.commute_out_time">
                {{ "" !== scope.row.commute_out_time ? "퇴근" : "마감" }}
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import {h} from "vue";
import {invoke} from "@tauri-apps/api";
import {useDate} from "vue3-dayjs-plugin/useDate";
import {ElNotification} from "element-plus";
import {reactive} from "vue";

const date = useDate();
const data = reactive([]);

const setInTime = async (row) => {
  try {
    row.commute_in_time = date().format("HHmm");
    await invoke("commute_record_update", {
      id: row.id,
      commuteInTime: row.commute_in_time,
      commuteOutTime: row.commute_out_time,
    });
    ElNotification({
      title: "알림",
      message: h("i", {style: "color: teal"}, "출근 처리되었습니다."),
    });
  } catch (e) {
    console.log(e);
  } finally {
  }
};

const setOutTime = async (row) => {
  try {
    row.commute_out_time = date().format("HHmm");
    await invoke("commute_record_update", {
      id: row.id,
      commuteInTime: row.commute_in_time,
      commuteOutTime: row.commute_out_time,
    });
    ElNotification({
      title: "알림",
      message: h("i", {style: "color: teal"}, "퇴근 처리되었습니다."),
    });
  } catch (e) {
    console.log(e);
  } finally {
  }
};

const getWorkList = async () => {
  try {
    const list = await invoke("commute_record_list");
    JSON.parse(list).forEach((d) => data.push(d));

    const isAddToday = () => {
      return 0 >= data.length || !date().isSame(data[0]?.commute_date, "d");
    };

    if (isAddToday()) {
      const newCommuteRecord = {
        commuteDate: date().format("YYYYMMDD"),
        commuteInTime: "",
        commuteOutTime: "",
      };

      const res = await invoke("commute_record_create", newCommuteRecord);
      await getWorkList();
    }
  } catch (e) {
    console.log(e);
  } finally {
  }
};

const viewWorkTime = (scope) => {
  const row = scope.row;
  if (0 >= Object.values(row).length) {
    return;
  }

  let hour = "00";
  let minutes = "00";

  const inDateTime = date(`${row.commute_date}${row.commute_in_time}`);
  const outDateTime = date(`${row.commute_date}${row.commute_out_time}`);

  const sDiff = outDateTime.diff(inDateTime, "second");

  if (0 < sDiff) {
    hour = String(Math.floor((sDiff / (60 * 60)) % 24)).padStart(2, "0");
    minutes = String(Math.floor((sDiff / 60) % 60)).padStart(2, "0");
  }

  return `${hour}:${minutes}`;
};

getWorkList();
</script>

<style scoped></style>
