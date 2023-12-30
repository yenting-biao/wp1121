import { Typography } from "@mui/material";
import ProductCard from "./ProductCard";
import LotteryCard from "./LotteryCard";
import FoodLotteryCard from "./FoodLotteryCard";

type Props = {
  userId: string;
  coins: number;
}

export default function CoinExchange ({ userId, coins }: Props) {
  console.log(userId);
  return (
    <div>
      <Typography 
        variant="h4"
        className="text-center p-3 mb-4"
      >
        錢幣遊樂場
      </Typography>
      <div className="grid sm:grid-cols-3 xs:grid-cols-1 gap-6">
        <LotteryCard
          name="錢幣抽抽"
          description="花費 100 金幣抽獎，有機率獲得 1000 金幣"
          price={100}
          userCoins={coins}
        />
        <FoodLotteryCard
          name="餐廳抽抽"
          description="花費 50 金幣，交給命運決定你要吃什麼！"
          price={50}
        />
        <ProductCard
          name="餐廳優惠券"
          description="花費金幣，換取跟我們合作的餐廳的優惠券！"
          price={1000}
        />        
      </div>
    </div>
  )
}