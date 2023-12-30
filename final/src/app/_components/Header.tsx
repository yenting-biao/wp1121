"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Avatar,
  Badge,
  IconButton,
  ListItemText,
  Tooltip,
  Menu,
  MenuItem,
  ButtonBase,
  ListItemIcon,
  Typography,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AppsRoundedIcon from "@mui/icons-material/AppsRounded";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { pusherClient } from "@/lib/pusher/client";

type NotificationType = {
  notificationId: string;
  type: string;
  content: string;
  redirectUrl: string | null;
  read: boolean;
};

export default function Header() {
  const [loading, setLoading] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const [notificationAnchorEl, setNotificationAnchorEl] =
    useState<null | HTMLElement>(null);
  const notificationOpen = Boolean(notificationAnchorEl);
  const handleNotificationClick = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    setNotificationAnchorEl(event.currentTarget);
  };
  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
  };
  async function handleNotificationRead(
    notificationId: string,
    redirectUrl: string | null
  ) {
    await fetch("/api/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        notificationId,
      }),
    });
    const notification = notifications.find(
      (element) => element.notificationId === notificationId
    );
    setNotifications((old) =>
      old.map((element) => {
        if (element.notificationId !== notificationId) return element;
        return {
          ...element,
          read: true,
        };
      })
    );
    if (redirectUrl) router.push(redirectUrl);
  }

  const router = useRouter();
  const handleOpenAuthModal = () => {
    router.push("/login");
  };

  // temporary variables
  const { data: session } = useSession();
  const userNotificationCount = notifications.filter(
    (element) => !element.read
  ).length;

  // Access username and avatar URL from the session
  // const userName = session?.user?.username ?? "Guest";
  const isAdmin = session?.user?.email === "admin@ntu.edu.tw";
  const avatarUrl = session?.user?.avatarUrl ?? "";
  const userId = session?.user?.id;

  const menuItemStyle = "py-3 px-6";

  // initial fetching
  useEffect(() => {
    if (!userId) return;
    const fetchNotifications = async () => {
      const res = await fetch(`/api/notifications`);
      if (!res.ok) return;
      const data: {
        notifications: NotificationType[];
      } = await res.json();
      setNotifications(data.notifications);
      setLoading(false);
    };
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    const channelName = `private-${userId}`;
    try {
      const channel = pusherClient.subscribe(channelName);
      channel.bind("notif", (newNotif: NotificationType) => {
        setNotifications((old) => [newNotif, ...old]);
      });
      return () => {
        channel.unbind("notif");
        pusherClient.unsubscribe(channelName);
      };
    } catch (error) {
      console.error("Failed to subscribe and bind to channel");
      console.error(error);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return (
    <>
      <header className="fixed top-0 w-full h-16 z-50 flex items-center gap-1 bg-white text-black py-3 px-2 border-b-2 border-black">
        <ButtonBase className="p-2 rounded-xl" onClick={() => router.push("/")}>
          <Image
            src="/food-date-icon.jpg"
            alt="Food Date"
            height={14}
            width={200}
          />
          <Image
            src="/map-and-location.png"
            alt="Food Date"
            height={36}
            width={36}
            className="ml-2"
          />
          {isAdmin && (
            <Typography
              variant="h5"
              className="ml-5 text-red-500 font-semibold"
            >
              Admin
            </Typography>
          )}
        </ButtonBase>
        <div className="flex-grow">{/* any other things */}</div>
        <div className="flex items-center gap-3 p-3">
          <Tooltip title="展開所有功能">
            <IconButton
              id="apps-button"
              size="large"
              aria-controls={open ? "apps-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={open ? "true" : undefined}
              onClick={handleClick}
            >
              <AppsRoundedIcon color="action" sx={{ width: 28, height: 28 }} />
            </IconButton>
          </Tooltip>
          <Menu
            id="apps-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            MenuListProps={{
              "aria-labelledby": "apps-button",
            }}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }} // adjust as needed
            transformOrigin={{ vertical: "top", horizontal: "center" }} // adjust as needed
          >
            <MenuItem
              onClick={() => {
                setAnchorEl(null);
                router.push("/missions");
              }}
              className={menuItemStyle}
            >
              <ListItemText>任務列表</ListItemText>
            </MenuItem>
            <MenuItem
              onClick={() => {
                setAnchorEl(null);
                router.push("/restaurants");
              }}
              className={menuItemStyle}
            >
              <ListItemText>找餐廳</ListItemText>
            </MenuItem>
            <MenuItem
              onClick={() => {
                setAnchorEl(null);
                router.push("/food-dates/find-dates");
              }}
              className={menuItemStyle}
            >
              <ListItemText>找飯友</ListItemText>
            </MenuItem>
            <MenuItem
              onClick={() => {
                setAnchorEl(null);
                router.push("/food-dates/my-dates");
              }}
              className={menuItemStyle}
            >
              <ListItemText>我的聚會</ListItemText>
            </MenuItem>
            {isAdmin && (
              <MenuItem
                onClick={() => {
                  setAnchorEl(null);
                  router.push("/admin-management");
                }}
                className={menuItemStyle}
              >
                <ListItemText>admin 管理頁面</ListItemText>
              </MenuItem>
            )}
          </Menu>
          {session ? (
            <>
              <Tooltip title="通知">
                <IconButton
                  id="notification-button"
                  size="large"
                  aria-label="show 4 new mails"
                  color="inherit"
                  className="mr-2"
                  aria-controls={
                    notificationOpen ? "notificaion-menu" : undefined
                  }
                  aria-haspopup="true"
                  aria-expanded={notificationOpen ? "true" : undefined}
                  onClick={handleNotificationClick}
                >
                  <Badge badgeContent={userNotificationCount} color="info">
                    <NotificationsIcon
                      color="action"
                      sx={{ width: 32, height: 32 }}
                    />
                  </Badge>
                </IconButton>
              </Tooltip>
              <Menu
                id="notification-menu"
                anchorEl={notificationAnchorEl}
                open={notificationOpen}
                onClose={handleNotificationClose}
                MenuListProps={{
                  "aria-labelledby": "notification-button",
                }}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }} // adjust as needed
                transformOrigin={{ vertical: "top", horizontal: "center" }} // adjust as needed
              >
                {loading && (
                  <div className="mx-5 my-2 loading-spinner h-[30px] w-[30px]"></div>
                )}
                {!loading && notifications.length === 0 && (
                  <div className="mx-5 my-2">尚無通知</div>
                )}
                {!loading &&
                  notifications.length > 0 &&
                  notifications.map((notification, index) => {
                    return (
                      <MenuItem
                        className={`${menuItemStyle} max-w-xs ${notification.read ? "" : "bg-blue-100 hover:bg-blue-200"} m-1 rounded-lg`}
                        sx={{ whiteSpace: "normal" }}
                        key={index}
                        onClick={() =>
                          handleNotificationRead(
                            notification.notificationId,
                            notification.redirectUrl
                          )
                        }
                      >
                        <ListItemIcon>
                          <NotificationsIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>{notification.content}</ListItemText>
                      </MenuItem>
                    );
                  })}
              </Menu>

              <Tooltip title="帳號設定">
                <IconButton
                  sx={{ p: 0 }}
                  onClick={() => {
                    router.push("/profile");
                  }}
                >
                  <Avatar src={avatarUrl} sx={{ width: 42, height: 42 }} />
                </IconButton>
              </Tooltip>
            </>
          ) : (
            <button
              className="rounded-full hover:bg-gray-300 p-3"
              onClick={handleOpenAuthModal}
            >
              登入
            </button>
          )}
        </div>
      </header>
    </>
  );
}
