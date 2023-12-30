"use client";
import { Divider, Tooltip, Typography, Snackbar } from "@mui/material";
import Link from "next/link";
import Avatar from "@mui/material/Avatar";
import Stack from "@mui/material/Stack";
import React, { useEffect, useState } from "react";
import MuiAlert, { AlertProps } from "@mui/material/Alert";
import { Check } from "lucide-react";
import { pusherClient } from "@/lib/pusher/client";
import { useRouter } from "next/navigation";

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
  }
);

type pendingDateType = {
  pendingDateId: string;
  participantCount: number;
  remainingSlots: number;
  time: string;
  priceRange: string;
  restaurantTypes: string;
  joined: boolean;
};

type disabledType = {
  pendingDateId: string;
  disabled: boolean;
};

export default function FindDatePage() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [hasError, setHasError] = useState<boolean>(false);
  const [disabled, setDisabled] = useState<disabledType[]>([]);
  const [pendingDates, setPendingDates] = useState<pendingDateType[]>([]);
  const chineseNumbers = ["一", "二", "三", "四"];

  // initial fetching
  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      const res = await fetch(`/api/date/pending`);
      if (res.status === 404 || !res.ok) {
        setErrorMessage("An error occured: failed to fetch pending dates");
        setHasError(true);
        return;
      }
      const data: {
        pendingDatesWithParticipationStatus: pendingDateType[];
      } = await res.json();
      setDisabled(
        data.pendingDatesWithParticipationStatus.map((element) => {
          return {
            pendingDateId: element.pendingDateId,
            disabled: false,
          };
        })
      );
      setPendingDates(data.pendingDatesWithParticipationStatus);
      setLoading(false);
    };
    fetchMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const channelName = `private-pending`;
    try {
      const channel = pusherClient.subscribe(channelName);
      channel.bind("pending:create", (newPendingDate: pendingDateType) => {
        setPendingDates((old) => [newPendingDate, ...old]);
      });
      return () => {
        channel.unbind("pending:create");
        pusherClient.unsubscribe(channelName);
      };
    } catch (error) {
      console.error("Failed to subscribe and bind to channel");
      console.error(error);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCloseError = () => {
    setHasError(false);
  };
  async function handleClick(pendingDateId: string) {
    setDisabled((disabled) =>
      disabled.map((element) => {
        if (element.pendingDateId !== pendingDateId) return element;
        else return { ...element, disabled: true };
      })
    );
    const pendingDate = pendingDates.find(
      (element) => element.pendingDateId === pendingDateId
    );
    if (!pendingDate) {
      setErrorMessage("An error occured: failed to join/leave date");
      setHasError(true);
      setDisabled((disabled) =>
        disabled.map((element) => {
          if (element.pendingDateId !== pendingDateId) return element;
          else return { ...element, disabled: false };
        })
      );
      return;
    }
    try {
      if (!pendingDate.joined) {
        await fetch(`/api/date/pending/join/${pendingDateId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (pendingDate.remainingSlots === 1) {
          setPendingDates((pendingDates) =>
            pendingDates.filter(
              (element) => element.pendingDateId !== pendingDateId
            )
          );
          setDisabled((disabled) =>
            disabled.filter(
              (element) => element.pendingDateId !== pendingDateId
            )
          );
          return;
        } else {
          setPendingDates((pendingDates) =>
            pendingDates.map((element) => {
              if (element.pendingDateId !== pendingDateId) return element;
              else
                return {
                  ...element,
                  remainingSlots: element.remainingSlots - 1,
                  joined: !element.joined,
                };
            })
          );
        }
      } else {
        console.log("leaving");
        await fetch(`/api/date/pending/leave/${pendingDateId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (pendingDate.remainingSlots + 1 === pendingDate.participantCount) {
          setPendingDates((pendingDates) =>
            pendingDates.filter(
              (element) => element.pendingDateId !== pendingDateId
            )
          );
          setDisabled((disabled) =>
            disabled.filter(
              (element) => element.pendingDateId !== pendingDateId
            )
          );
          return;
        } else {
          setPendingDates((pendingDates) =>
            pendingDates.map((element) => {
              if (element.pendingDateId !== pendingDateId) return element;
              else
                return {
                  ...element,
                  remainingSlots: element.remainingSlots + 1,
                  joined: !element.joined,
                };
            })
          );
        }
      }
    } catch (error) {
      setErrorMessage("An error occured: failed to join/leave date");
      setHasError(true);
    } finally {
      setDisabled((disabled) =>
        disabled.map((element) => {
          if (element.pendingDateId !== pendingDateId) return element;
          else return { ...element, disabled: false };
        })
      );
    }
  }

  return (
    <>
      <div className="flex flex-col items-center w-full h-full">
        <Typography variant="h4" className="text-center mt-7">
          找不到人一起吃飯嗎？那你來對地方了！
        </Typography>
        <Typography variant="h6" className="text-center mt-1">
          一起吃飯，賺取金幣，換取獎勵！
        </Typography>
        <Divider className="w-1/4 my-4" />
        <Typography variant="h6" className="text-center mt-1 text-gray-500">
          點選加入以下聚會，或
          <Link className="underline" href="/food-dates/find-dates/create">
            新增自己的聚會
          </Link>
        </Typography>
        {loading && (
          <div className="mt-5 loading-spinner w-[50px] h-[50px]"></div>
        )}
        {!loading && (
          <div className="w-full max-w-[500px] mt-5">
            {pendingDates.map((pendingDate) => (
              <Tooltip
                key={pendingDate.pendingDateId}
                arrow
                title={pendingDate.joined ? "離開聚會" : "加入聚會"}
                slotProps={{
                  popper: {
                    modifiers: [
                      {
                        name: "offset",
                        options: {
                          offset: [0, -14],
                        },
                      },
                    ],
                  },
                }}
              >
                <button
                  className="active:bg-gray-200 hover:bg-gray-100 rounded-lg w-full px-2 py-2"
                  onClick={(event) => {
                    event.preventDefault();
                    handleClick(pendingDate.pendingDateId);
                  }}
                  disabled={
                    disabled.find(
                      (element) =>
                        element.pendingDateId === pendingDate.pendingDateId
                    )?.disabled
                  }
                >
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col items-start w-3/4">
                      <div className="flex items-center gap-2">
                        <p className="text-xl">
                          {chineseNumbers[pendingDate.participantCount - 1]}人團
                          <span className="text-red-600">
                            缺{chineseNumbers[pendingDate.remainingSlots - 1]}
                          </span>
                        </p>
                        <Stack direction="row" spacing={-1}>
                          {Array.from({
                            length: pendingDate.participantCount,
                          }).map((_, i) => (
                            <Avatar
                              key={i}
                              className="w-[25px] h-[25px] border-2 border-white"
                            />
                          ))}
                        </Stack>
                      </div>
                      <div className="mt-2 text-gray-600">
                        時間：{pendingDate.time}
                      </div>
                      <div className="text-gray-600">
                        價格範圍：{pendingDate.priceRange}
                      </div>
                      <div
                        title={pendingDate.restaurantTypes}
                        className="text-gray-600 w-full text-start whitespace-nowrap overflow-hidden text-ellipsis"
                      >
                        想去的餐廳類型：{pendingDate.restaurantTypes}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {pendingDate.joined && (
                        <>
                          <Check color="green" strokeWidth={2} size={40} />
                          <p className="text-green-700 text-xl">已加入</p>
                        </>
                      )}
                    </div>
                  </div>
                </button>
              </Tooltip>
            ))}
          </div>
        )}
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
  );
}
