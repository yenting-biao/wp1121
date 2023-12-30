"use client";
import React, { useState } from "react";

import {
  Button,
  Checkbox,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Snackbar,
  Typography,
} from "@mui/material";

import ListItemText from "@mui/material/ListItemText";
import MuiAlert, { AlertProps } from "@mui/material/Alert";
import { useRouter } from "next/navigation";

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
  }
);

export default function FoodDatePage() {
  const router = useRouter();

  const restaurantTypes = [
    "中式餐館",
    "餐廳",
    "墨西哥餐廳",
    "美式餐廳",
    "日本料理",
    "好ㄘ的早午餐",
    "活力早餐",
    "附商店",
    "有賣壽司",
    "韓式料理",
    "有聘請顧問",
    "含雜貨店",
    "注重健康",
    "拉麵洗腎幫",
    "泰式料理",
    "主打蔬食",
    "有在辦活動",
    "義式餐廳",
    "越南餐館",
    "素食至上",
    "裝文青勝地",
    "酒鬼聚會所",
    "印度料理",
    "主打海鮮",
    "咖啡店",
    "咖啡廳",
    "西班牙菜",
    "中東風味餐",
    "速食店",
    "有賣漢堡",
    "披薩專賣",
    "法式料理",
    "印尼料理",
    "牛排館",
    "歡迎外帶",
    "酒鬼避難所",
    "食物批發",
    "地中海料理",
    "麵包店",
    "燒烤店",
    "歡迎外送",
    "歡樂夜總會",
    "希臘餐廳",
    "冰淇淋店",
    "有賣家居用品",
    "有賣傢俱",
    "家庭改造服務",
    "市場",
    "土耳其料理",
    "三明治！！",
    "宴會所",
    "會議廳",
    "有賣衣服",
    "婚禮現場",
    "表演藝術中心",
  ];
  const priceRanges = [
    "$（200元以內）",
    "$$（400元以內）",
    "$$$（600元以內）",
    "$$$$（600元以上）",
  ];

  const [pplCount, setPplCount] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const ITEM_HEIGHT = 35;
  const ITEM_PADDING_TOP = 8;
  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 10 + ITEM_PADDING_TOP,
        width: 250,
      },
    },
  };
  const handleChange = (event: SelectChangeEvent<typeof selectedTypes>) => {
    const {
      target: { value },
    } = event;
    setSelectedTypes(typeof value === "string" ? value.split(",") : value);
  };

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [hasError, setHasError] = useState<boolean>(false);
  const [emptyFields, setEmptyFields] = useState<string[]>([]);

  const handleSubmit = async () => {
    setSubmitting(true);
    const tmpEmptyFields: string[] = [];
    if (pplCount === "") tmpEmptyFields.push("人數");
    if (selectedTime === "") tmpEmptyFields.push("時間");
    if (selectedPriceRange === "") tmpEmptyFields.push("價格範圍");
    if (selectedTypes.length === 0) tmpEmptyFields.push("餐廳類型");
    setEmptyFields(tmpEmptyFields);
    const incompleteForm = tmpEmptyFields.length > 0;
    if (incompleteForm) {
      setErrorMessage("請填寫以下欄位：" + emptyFields.join("、"));
      setHasError(true);
      setSubmitting(false);
      return;
    }
    try {
      await fetch("/api/date/pending/create", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          participantCount: pplCount,
          time: selectedTime,
          priceRange: priceRanges[parseInt(selectedPriceRange)],
          restaurantTypes: selectedTypes.join(", "),
        }),
      });
      router.push("/food-dates/find-dates");
    } catch (error) {
      setErrorMessage("An error has occured: could not create date");
      setHasError(true);
      setSubmitting(false);
    }
  };

  const handleCloseError = () => {
    setHasError(false);
  };

  return (
    <main className="flex flex-col items-center w-full h-full mb-14">
      <>
        <Typography variant="h4" className="text-center mt-7">
          找不到人一起吃飯嗎？那你來對地方了！
        </Typography>
        <Typography variant="h6" className="text-center mt-1">
          一起吃飯，賺取金幣，換取獎勵！
        </Typography>
        <Divider className="w-1/4 my-4" />
        <Typography variant="h6" className="text-center mt-1 mb-4">
          新增聚會
        </Typography>
        <div className="px-6 mt-2 max-w-[500px] w-3/4 flex justify-center gap-5 flex-col items-center">
          <FormControl fullWidth>
            <InputLabel id="ppl-count-label">選擇人數</InputLabel>
            <Select
              labelId="ppl-count-label"
              label="選擇人數"
              value={pplCount}
              onChange={(event: SelectChangeEvent) =>
                setPplCount(event.target.value as string)
              }
              disabled={submitting}
            >
              {[2, 3, 4].map((count) => (
                <MenuItem key={count} value={count}>
                  {count} 人
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel id="time-label">選擇時間（24小時內）</InputLabel>
            <Select
              value={selectedTime}
              labelId="time-label"
              label="選擇時間（24小時內）"
              onChange={(data) => setSelectedTime(data.target.value)}
              disabled={submitting}
              MenuProps={MenuProps}
            >
              <MenuItem value={"早上（6:00-11:00）"}>
                早上（6:00-11:00）
              </MenuItem>
              <MenuItem value={"中午（11:00-13:00）"}>
                中午（11:00-13:00）
              </MenuItem>
              <MenuItem value={"下午（13:00-17:00）"}>
                下午（13:00-17:00）
              </MenuItem>
              <MenuItem key={1} value={"晚上（17:00-20:00）"}>
                晚上（17:00-20:00）
              </MenuItem>
              <MenuItem key={1} value={"半夜（20:00-1:00）"}>
                半夜（20:00-1:00）
              </MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel id="price-label">價格範圍</InputLabel>
            <Select
              labelId="price-label"
              label="價格範圍"
              value={selectedPriceRange}
              onChange={(data) => setSelectedPriceRange(data.target.value)}
              disabled={submitting}
            >
              {Array.from({ length: 4 }, (_, i) => i).map((count) => (
                <MenuItem key={count} value={count}>
                  {priceRanges[count]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel id="types-label">餐廳類型</InputLabel>
            <Select
              id="types-label"
              label="餐廳類型"
              multiple
              value={selectedTypes}
              onChange={handleChange}
              renderValue={(selected) => selected.join(", ")}
              MenuProps={MenuProps}
              disabled={submitting}
            >
              {restaurantTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  <Checkbox checked={selectedTypes.indexOf(type) > -1} />
                  <ListItemText primary={type} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <div className="flex gap-5 relative items-center">
            <Button
              variant="contained"
              color="error"
              className="bg-red-500"
              onClick={() => {
                setSubmitting(true);
                setPplCount("");
                setSelectedTime("");
                setSelectedPriceRange("");
                setSelectedTypes([]);
                setSubmitting(false);
              }}
              disabled={submitting}
            >
              清除選擇
            </Button>
            <Button
              variant="contained"
              color="primary"
              className="bg-blue-500"
              onClick={handleSubmit}
              disabled={submitting}
            >
              新增聚會
            </Button>
            {submitting && (
              <div className="loading-spinner absolute -right-9 w-[25px] h-[25px]"></div>
            )}
          </div>
        </div>
        <Snackbar
          open={hasError}
          autoHideDuration={6000}
          onClose={handleCloseError}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={handleCloseError}
            severity="error"
            sx={{ width: "100%" }}
          >
            {errorMessage}
          </Alert>
        </Snackbar>
      </>
    </main>
  );
}
