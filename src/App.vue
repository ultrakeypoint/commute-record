<script setup>
import {ref, onMounted, computed} from "vue";
import _ from "lodash";
import dayjs from "dayjs";
import * as db from "./utils/db";
import {ElNotification, ElMessage, ElMessageBox} from "element-plus";

let isLoading = ref(true);
let data = ref([]);

const ux = {
  updateInTime: async ({row}) => {
    row.inTime = dayjs().format();
    const data = {inTime: dayjs().format("HHmfm")};
    db.updateDB(db.DB_IO_FILE, row.date, data);
    msg("출근 처리되었습니다.");
  },
  updateOutTime: async ({row}) => {
    row.outTime = dayjs().format();
    const data = {outTime: dayjs().format("HHmm")};
    db.updateDB(db.DB_IO_FILE, row.date, data);
    msg("퇴근 처리되었습니다.");
  },
  updateMemo: async ({row}) => {
    const data = {memo: row.memo};
    db.updateDB(db.DB_IO_FILE, row.date, data);
    msg("메모 저장되었습니다.");
  },
  changeInTime: (d, {row}) => {
    row.inTime = dayjs(d).format();
    const data = {inTime: dayjs(row.inTime).format("HHmm")};
    db.updateDB(db.DB_IO_FILE, row.date, data);
    msg("출근 처리되었습니다.");
  },
  changeOutTime: (d, {row}) => {
    row.outTime = dayjs(d).format();
    const data = {outTime: dayjs(row.outTime).format("HHmm")};
    db.updateDB(db.DB_IO_FILE, row.date, data);
    msg("퇴근 처리되었습니다.");
  },
};

const inOutList = async () => {
  try {
    isLoading.value = true;
    const r = await db.readDB(db.DB_IO_FILE);
    data.value = _.sortBy(_.keys(r))
      .reverse()
      .map((k) => {
        return {
          ...r[k],
          ...{
            inTime: dayjs(r[k].date + r[k].inTime).format(),
            outTime: dayjs(r[k].date + r[k].outTime).format(),
          },
        };
      });
  } catch (e) {
    console.log(e);
  } finally {
    isLoading.value = false;
  }
};

const workDuration = ({row}) => {
  return computed(() => {
    if (!row?.inTime || !row?.outTime) {
      return "00:00";
    }
    const hh = dayjs(row?.outTime).diff(dayjs(row?.inTime), "h");
    const mm = dayjs(row?.outTime).diff(dayjs(row?.inTime), "m");
    if (0 > hh) {
      return "00:00";
    }
    const durationTime = dayjs(row?.date + `${hh}:${mm % 60}`);
    return 0 <= hh ? durationTime.format("HH:mm") : "00:00";
  });
};

const msg = (m) => {
  ElNotification({
    title: "알림",
    message: m,
    type: "success",
  });
};

onMounted(async () => {
  await inOutList();
});
</script>

<template>
  <div class="app-container">
    <el-container>
      <el-header>
        <div>
          <h3
            class="title"
            title="출/퇴근 일지">
            출/퇴근 일지
          </h3>
          <small class="description">Save your time</small>
        </div>
        <el-button
          type="primary"
          link>
          <a
            href="https://github.com/sponsors/ultrakeypoint"
            target="_blank">
            <unicon
              name="github"
              fill="black" />
          </a>
        </el-button>
      </el-header>
      <el-container>
        <el-main>
          <el-form>
            <el-table
              :data="data"
              v-loading="isLoading">
              <el-table-column
                label="날짜"
                prop="date"
                align="center"
                width="100">
                <template #default="scope">
                  {{ dayjs(scope.row.date).format("YYYY/MM/DD") }}
                </template>
              </el-table-column>
              <el-table-column
                label="출근시간"
                prop="inTime"
                align="center"
                width="90">
                <template #default="scope">
                  <el-time-picker
                    v-model="scope.row.inTime"
                    placeholder="00:00"
                    arrow-control
                    size="small"
                    prefix-icon="false"
                    clear-icon="false"
                    format="HH:mm"
                    @change="(d) => ux.changeInTime(d, scope)" />
                </template>
              </el-table-column>
              <el-table-column
                label="퇴근시간"
                prop="outTime"
                align="center"
                width="90">
                <template #default="scope">
                  <el-time-picker
                    v-model="scope.row.outTime"
                    placeholder="00:00"
                    arrow-control
                    size="small"
                    prefix-icon="false"
                    clear-icon="false"
                    format="HH:mm"
                    @change="(d) => ux.changeOutTime(d, scope)" />
                </template>
              </el-table-column>
              <el-table-column
                label="근무시간"
                prop="duration"
                align="center"
                width="90">
                <template #default="scope">
                  {{ workDuration(scope).value }}
                </template>
              </el-table-column>
              <el-table-column
                label="기록"
                align="center"
                width="250">
                <template #default="scope">
                  <el-button
                    type="primary"
                    @click="ux.updateInTime(scope)"
                    round>
                    <unicon
                      class="el-icon--left"
                      name="desktop"
                      fill="white" />
                    출근
                  </el-button>
                  <el-button
                    type="danger"
                    @click="ux.updateOutTime(scope)"
                    round>
                    <unicon
                      class="el-icon--left"
                      name="pizza-slice"
                      fill="white" />
                    퇴근
                  </el-button>
                </template>
              </el-table-column>
              <el-table-column
                label="메모"
                prop="memo">
                <template #default="scope">
                  <el-input
                    v-model="scope.row.memo"
                    type="text"
                    placeholder="메모"
                    :value="scope.row.memo"
                    @keyup.enter="ux.updateMemo(scope)">
                    <template #append>
                      <el-button
                        @click="ux.updateMemo(scope)"
                        link>
                        저장
                      </el-button>
                    </template>
                  </el-input>
                </template>
              </el-table-column>
            </el-table>
          </el-form>
        </el-main>
      </el-container>
    </el-container>
    <BubbleEffect />
  </div>
</template>

<style scoped></style>
