"use client"
import { useState } from 'react';
import { cn } from '@/lib/utils';
import useSelectTime from '@/hooks/useSelectTime';

function getNumOfDays(start: Date, end: Date): Array<string> {
  let startYear = start.getFullYear();
  let startMonth = start.getMonth() + 1;
  let startDate = start.getDate();
  const monthLength = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];
  if(startYear % 400 == 0 || (startYear % 100 != 0 && startYear % 4 == 0))
    monthLength[1] = 29;

  const endYear = end.getFullYear();
  const endMonth = end.getMonth() + 1;
  const endDate = end.getDate();

  let result = 1;
  const dateArr = [];//[`${startYear}/${startMonth}/${startDate}`];
  while(result < 10) {
    //console.log(startYear + " " + startMonth + " " + startDate);
    //console.log(endYear + " " + endMonth + " " + endDate);
    dateArr.push(`${startYear}/${String(startMonth).padStart(2, '0')}/${String(startDate).padStart(2, '0')}`);
    if(startDate === endDate && startMonth === endMonth && startYear === endYear){
      return dateArr;
    }

    startDate += 1;
    if(startDate > monthLength[startMonth - 1]){
      startDate = 1;
      startMonth += 1;
      if(startMonth > 12){
        startMonth = 1;
        startYear += 1;
      }
    }

    result += 1;
    
  }
  return [""];
}

type WhenToMeetProp = {
  startDate: Date;
  endDate: Date;

  joined: boolean;
  joinedNum: number;
  initialSelected: string[];

  handle?: string;
  tweetId: number;

  participantsSelectedTimes: Array<{
    userHandle: string;
    selectedTime: Array<string>;
  }>;
};

export default function WhenToMeet({startDate, endDate, joined, joinedNum, /*initialSelected,*/ handle, tweetId, participantsSelectedTimes}: WhenToMeetProp) {
  const startYear = startDate.getFullYear();
  const startMonth = startDate.getMonth() + 1;
  const startDay = startDate.getDate();
  const startHour = startDate.getHours();

  const endYear = endDate.getFullYear();
  const endMonth = endDate.getMonth() + 1;
  const endDay = endDate.getDate();
  const endHour = endDate.getHours();

  const dateArray = getNumOfDays(startDate, endDate);
  //const colNum = dateArray.length;
  //const rowNum = 24;
 
  //const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>(initialSelected); //useState<string[]>([]);
  const [mouseIsOver, setMouseIsOver] = useState(false);

  const {selectActivityTime, unSelectActivityTime} = useSelectTime();

  const compareDateString = (date1: string, date2: string) =>{
    //console.log("before", date1, date2);
    const parseDateString = (dateStr: string): Date => {
      const [monthDay, hour] = dateStr.split(' ');
      const [year, month, day] = monthDay.split('/');
  
      //const year = new Date().getFullYear(); // 假設使用當前年份
  
      const parsedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour), 0, 0, 0);
      return parsedDate;
    };
  
    const parsedDate1 = parseDateString(date1);
    const parsedDate2 = parseDateString(date2);

    //console.log("after", parsedDate1, parsedDate2);
  
    if (parsedDate1 >= parsedDate2) {
      return true;
    } else {
      return false;
    }
  };

  const inDateRange = (tempDate: string) => {
    //console.log(tempDate);
    return compareDateString(tempDate, startYear + "/" + startMonth + "/" + startDay + " " + startHour + ":00") && !compareDateString(tempDate, endYear + "/" + endMonth + "/" + endDay + " " + endHour + ":00");
  };

  const includeTimeSlot = (timeSlot: string) => {
    for (let i = 0; i < participantsSelectedTimes.length; i++){
      if(participantsSelectedTimes[i].userHandle === handle){
        if(participantsSelectedTimes[i].selectedTime.includes(timeSlot)){
          return true;
        }else return false;
      }
    }
    return false;
  }

  const handleTimeSlotClick = async (timeSlot: string) => {
    //console.log("timeSlots", selectedTimeSlots);
    if(!handle || !joined) return;
    // 在這裡處理選取和取消選取時段的邏輯
    if (includeTimeSlot(timeSlot)/*selectedTimeSlots.includes(timeSlot)*/) {
      // 如果已經選取，則取消選取
      //setSelectedTimeSlots(selectedTimeSlots.filter(slot => slot !== timeSlot));
      await unSelectActivityTime({
        userHandle: handle,
        tweetId,
        selectedTime: timeSlot,
      });
    } else {
      // 否則，選取時段
      //setSelectedTimeSlots([...selectedTimeSlots, timeSlot]);
      await selectActivityTime({
        userHandle: handle,
        tweetId,
        selectedTime: timeSlot,
      });
    }
  };

  // timeSlot: YYYY/MM/DD HH:00
  const participantsNumOnTimeSlots = (timeSlot: string) => {
    let num = 0;
    for (let i = 0; i < participantsSelectedTimes.length; i++){
      if(participantsSelectedTimes[i].selectedTime.includes(timeSlot)){
        num++;
      }
    }
    return num;
  }
  
  const timeSlots = Array.from({ length: 24 }, (value, index) => {
    const hour = index.toString().padStart(2, '0');
    return `${hour}:00`;
  });

  const timeSlotBgColor = [
    ["bg-white"],
    ["bg-white", "bg-green-600"],
    ["bg-white", "bg-green-300", "bg-green-600"],
    ["bg-white", "bg-green-200", "bg-green-400", "bg-green-600"],
    ["bg-white", "bg-green-300", "bg-green-400", "bg-green-500", "bg-green-600"],
    ["bg-white", "bg-green-200", "bg-green-300", "bg-green-400", "bg-green-500", "bg-green-600"],
    ["bg-white", "bg-green-100", "bg-green-200", "bg-green-300", "bg-green-400", "bg-green-500", "bg-green-600"]
  ];

  const oneDay = (date: string) => {
    return (
      <div className="flex-1">
        <div className="flex flex-col">
          <div
            key={date}
            className="p-2  h-10 border border-solid border-black text-center"
          >
            {date.substring(5, date.length)}
          </div>
          {timeSlots.map(timeSlot => (
            <div
              key={date + timeSlot}
              onClick={inDateRange(date + timeSlot) ? (() => handleTimeSlotClick(date + timeSlot)): (() => {})}
              className={cn(`p-2 h-10 
              ${inDateRange(date + timeSlot) && mouseIsOver && joined ? 'cursor-pointer' : ''} border border-black 
              ${/*selectedTimeSlots.includes(date + timeSlot)*/ includeTimeSlot(date + timeSlot) && mouseIsOver && joined && 'border-solid border-red-600 border-4'}`,
              inDateRange(date + timeSlot) ? timeSlotBgColor[participantsNum][participantsNumOnTimeSlots(date + timeSlot)]:'bg-gray-700',)}
            >
              {""}
            </div>
          ))}
        </div>
      </div>
      
    );
  } 

  const participantsNum = joinedNum <= 6 ? joinedNum : 6;

  return (
    <div>
      <h1 className="font-semibold text-xl text-start ml-4 mt-5">{joined ? "Select your available time!" : "Join the activity to discuss your available time with them!"}</h1>
      
      <div 
        className="flex flex-row mt-5 ml-3"
        onMouseOver={() => setMouseIsOver(true)}
        onMouseOut={() => setMouseIsOver(false)}
      >
        <div 
          className="flex-1"           
        >
          <div className="flex flex-col">
            <div
              key="null"
              className={cn("p-2 h-10 border border-solid border-black", "border-sold border-black text-center")}
            >
              {"Time"}
            </div>
            {timeSlots.map(timeSlot => (
              <div
                key={timeSlot}
                className={`p-2  h-10 border border-black bg-white text-center`}
              >
                {`${timeSlot.substring(0, 2)} ~ ${String(Number(timeSlot.substring(0, 2)) + 1).padStart(2, '0')}`}
              </div>
            ))}
          </div>
        </div>
        
        
        {dateArray.map((value/*, _*/) => oneDay(value + " "))}
      </div>

      <div className='mt-5'>
        <h3 className="text-center font-bold">Availability among participants:</h3>
        <div className='flex flex-row'>
          <div
            className={cn("flex-1 p-2 h-10 ", "text-center")}
          >
            {`0/${participantsNum}`}
          </div>

          {Array.from({ length: participantsNum + 1 }, (_, i) => (
            <div
              key={`lastline-${timeSlotBgColor[participantsNum][i]}`}
              className={cn("flex-1 p-2 h-10 border border-solid border-black", "border-solid border-black text-center", timeSlotBgColor[participantsNum][i])}
            >
              {""}
            </div>
          ))}

          <div
            className={cn("flex-1 p-2 h-10 ", "text-center")}
          >
            {`${participantsNum}/${participantsNum}`}
          </div>
        </div>
      </div>

      {/*<div>
        <h3>已選取的時段：</h3>
        <ul>
          {selectedTimeSlots.map(slot => (
            <li key={slot}>{slot}</li>
          ))}
        </ul>
        </div>*/}
    </div>
  );
}