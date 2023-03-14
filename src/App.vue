<script setup>
import {ref, reactive, onBeforeMount, onMounted, computed} from "vue";
import _ from "lodash";
import dayjs from "dayjs";
import * as db from "./utils/db";
import {ElNotification, ElMessage, ElMessageBox} from "element-plus";
import {useI18n} from "vue-i18n";
import {getVersion} from "@tauri-apps/api/app";

let appVersion = ref();
let isLoading = ref(true);
let data = ref([]);
let bt = ref("");
let dialogFormVisible = ref(false);
let addFormEl = ref({});
let addForm = reactive({
  date: "",
  inTime: "",
  outTime: "",
  memo: "",
});
const rules = {
  date: [
    {
      required: true,
      message: "날짜를 입력하세요",
      trigger: "blur",
    },
  ],
  inTime: [
    {
      required: true,
      message: "출근시간을 입력하세요",
      trigger: "blur",
    },
  ],
  outTime: [
    {
      required: true,
      message: "퇴근시간을 입력하세요",
      trigger: "blur",
    },
  ],
};

const holidays = [
  {
    value: "",
    label: "",
  },
  {
    value: "half",
    label: "반차",
  },
  {
    value: "full",
    label: "휴가",
  },
];

const buildDateTime = dayjs();

const ux = {
  search: async () => {
    await inOutList();
  },
  updateInTime: async ({row}) => {
    row.inTime = dayjs().format();
    const data = {inTime: dayjs().format("HHmm")};
    db.updateDB(db.DB_IO_FILE, row.date, data);
    msg("출근 처리되었습니다.", true);
  },
  updateOutTime: async ({row}) => {
    row.outTime = dayjs().format();
    const data = {outTime: dayjs().format("HHmm")};
    db.updateDB(db.DB_IO_FILE, row.date, data);
    msg("퇴근 처리되었습니다.", true);
  },
  updateHoliday: async ({row}) => {
    const data = {holiday: row.holiday};
    db.updateDB(db.DB_IO_FILE, row.date, data);
    msg("휴가가 설정되었습니다.", true);
  },
  updateMemo: async ({row}) => {
    const data = {memo: row.memo};
    db.updateDB(db.DB_IO_FILE, row.date, data);
    msg("메모 저장되었습니다.", true);
  },
  changeInTime: (d, {row}) => {
    if (bt === dayjs(d).format("HHmm")) {
      return false;
    }
    row.inTime = dayjs(d).format();
    const data = {inTime: dayjs(row.inTime).format("HHmm")};
    db.updateDB(db.DB_IO_FILE, row.date, data);
    msg("출근 처리되었습니다.", true);
  },
  changeOutTime: (d, {row}) => {
    if (bt === dayjs(d).format("HHmm")) {
      return false;
    }
    row.outTime = dayjs(d).format();
    const data = {outTime: dayjs(row.outTime).format("HHmm")};
    db.updateDB(db.DB_IO_FILE, row.date, data);
    msg("퇴근 처리되었습니다.", true);
  },
  updateBT: (d, ot) => {
    if (d) {
      bt = dayjs(ot).format("HHmm");
    }
  },
  addItem: async (ref) => {
    try {
      await ref.validate((v, fs) => {
        if (v) {
          const data = _.cloneDeep(addForm);
          data.date = dayjs(data.date).format("YYYYMMDD");
          data.inTime = dayjs(data.inTime).format("HHmm");
          data.outTime = dayjs(data.outTime).format("HHmm");
          db.updateDB(db.DB_IO_FILE, data.date, data);
          msg("추가 되었습니다.", true);
          setTimeout(async () => await inOutList(), 500);
        }
      });
    } catch (e) {
      msg(e, false);
    } finally {
      dialogFormVisible.value = false;
    }
  },
  remoteItem: async ({row}) => {
    try {
      await ElMessageBox.confirm("삭제하시겠습니까??", "Warning", {
        confirmButtonText: "삭제",
        cancelButtonText: "취소",
        type: "warning",
      });
      db.removeDB(db.DB_IO_FILE, row.date);
      msg("추가 되었습니다.", true);
      setTimeout(async () => await inOutList(), 500);
    } catch (e) {
      e === "cancle" ? null : msg(e, false);
    } finally {
      dialogFormVisible.value = false;
    }
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
    msg("목록 조회되었습니다.", true);
  } catch (e) {
    console.log(e);
  } finally {
    isLoading.value = false;
  }
};

const workDuration = ({row}) => {
  return computed(() => {
    const hh = dayjs(row?.outTime).diff(dayjs(row?.inTime), "h");
    const mm = dayjs(row?.outTime).diff(dayjs(row?.inTime), "m");
    const dt = dayjs(row?.date + `${hh}:${mm % 60}`);
    return dt.isValid() ? dt.format("HH:mm") : "00:00";
  });
};

const msg = (m, t) => {
  ElNotification({
    title: "알림",
    message: m,
    type: t ? "success" : "error",
    duration: 1000,
  });
};

onBeforeMount(async () => {
  appVersion = await getVersion();
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
            <small class="version">{{ appVersion }}</small>
          </h3>
          <small class="description">Save your time</small>
        </div>
        <div>
          <el-button
            type="primary"
            link>
            <a
              href="https://github.com/sponsors/ultrakeypoint"
              target="_blank"
              disabled="isLoading">
              <unicon
                name="github"
                fill="black" />
            </a>
          </el-button>
        </div>
      </el-header>
      <el-container>
        <el-main>
          <el-form>
            <div class="table-top">
              <el-button
                size="large"
                circle
                @click="dialogFormVisible = true"
                color="#626aef">
                <unicon
                  name="plus"
                  fill="#fff" />
              </el-button>
              <el-button
                size="large"
                circle
                @click="db.exportDB(db.DB_IO_FILE, $t)"
                color="#626aef">
                <unicon
                  name="file-download"
                  fill="#fff" />
              </el-button>
              <el-button
                size="large"
                circle
                @click="ux.search"
                color="#626aef">
                <unicon
                  name="search"
                  fill="#fff" />
              </el-button>
            </div>
            <el-table
              ref="table"
              :data="data"
              v-loading="isLoading"
              stripe>
              <el-table-column
                :label="$t('date')"
                prop="date"
                align="center"
                width="100"
                sortable>
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
                    prefix-icon="false"
                    clear-icon="false"
                    format="HH:mm"
                    @visible-change="(d) => ux.updateBT(d, scope.row.inTime)"
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
                    prefix-icon="false"
                    clear-icon="false"
                    format="HH:mm"
                    @visible-change="(d) => ux.updateBT(d, scope.row.outTime)"
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
                label="기록하기"
                align="center"
                width="320">
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
                  <el-button
                    type="info"
                    @click="ux.remoteItem(scope)"
                    round>
                    <unicon
                      class="el-icon--left"
                      name="trash"
                      fill="white" />
                    삭제
                  </el-button>
                </template>
              </el-table-column>
              <el-table-column
                label="휴가"
                align="center"
                width="100">
                <template #default="scope">
                  <el-select
                    v-model="scope.row.holiday"
                    @change="ux.updateHoliday(scope)">
                    <el-option
                      v-for="h in holidays"
                      :key="h.value"
                      :label="h.label"
                      :value="h.value" />
                  </el-select>
                </template>
              </el-table-column>
              <el-table-column
                label="메모"
                prop="memo">
                <template #default="scope">
                  <el-input
                    size="large"
                    v-model="scope.row.memo"
                    type="text"
                    placeholder="메모"
                    :value="scope.row.memo"
                    @keyup.enter="ux.updateMemo(scope)">
                    <template #append>
                      <el-button
                        color="#626aef"
                        size="large"
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
    <el-dialog
      class="add"
      v-model="dialogFormVisible"
      title="추가"
      width="300">
      <el-form
        ref="addFormEl"
        :model="addForm"
        :rules="rules"
        label-position="right">
        <el-form-item
          prop="date"
          label="날짜"
          label-width="80">
          <el-date-picker
            v-model="addForm.date"
            type="date"
            :placeholder="dayjs().format('YYYY/MM/DD')"
            format="YYYY/MM/DD" />
        </el-form-item>
        <el-form-item
          prop="inTime"
          label="출근시간"
          label-width="80">
          <el-time-picker
            v-model="addForm.inTime"
            placeholder="00:00"
            format="HH:mm" />
        </el-form-item>
        <el-form-item
          prop="outTime"
          label="퇴근시간"
          label-width="80">
          <el-time-picker
            v-model="addForm.outTime"
            placeholder="00:00"
            format="HH:mm" />
        </el-form-item>
        <el-form-item
          prop="memo"
          label="메모"
          label-width="80">
          <el-input
            v-model="addForm.memo"
            autocomplete="off"
            placeholder="메모" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogFormVisible = false">취소</el-button>
          <el-button
            color="#626aef"
            @click="ux.addItem(addFormEl)">
            등록
          </el-button>
        </span>
      </template>
    </el-dialog>
    <BubbleEffect />
  </div>
</template>

<style scoped></style>
