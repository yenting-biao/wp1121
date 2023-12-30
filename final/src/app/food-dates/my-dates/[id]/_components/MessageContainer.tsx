import Linkify from "react-linkify";
import Tooltip from "@mui/material/Tooltip";

import { Avatar } from "@mui/material";

type MessageContainerProps = {
  username: string;
  senderUsername: string | null;
  content: string;
  avatarUrls: { username: string; avatarUrl: string | null }[];
};

function Urlify(message: string) {
  return (
    <Linkify
      componentDecorator={(decoratedHref, decoratedText, key) => (
        <a target="blank" href={decoratedHref} key={key} className="underline">
          {decoratedText}
        </a>
      )}
    >
      {message}
    </Linkify>
  );
}

export default function MessageContainer({
  username,
  senderUsername,
  content,
  avatarUrls,
}: MessageContainerProps) {
  const fromServer = content.slice(0, 7) === "server:";
  const isMine = senderUsername && username === senderUsername;

  return (
    <>
      {fromServer && (
        <div className="w-full text-center">
          <p className="text-gray-400">{Urlify(content.slice(7))}</p>
        </div>
      )}
      {!fromServer && isMine && (
        <div className="flex w-full items-end gap-2 justify-end">
          <div className="break-all px-3 py-1 bg-blue-500 text-white rounded-l-2xl rounded-tr-2xl">
            {Urlify(content)}
          </div>
          <Tooltip
            title={senderUsername ?? "[已刪除]"}
            placement="right"
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
            <Avatar
              alt={senderUsername ?? ""}
              src={
                avatarUrls.find((element) => element.username === senderUsername)
                  ?.avatarUrl ?? ""
              }
              className="w-[30px] h-[30px]"
            >
              {username.charAt(0)}
            </Avatar>
          </Tooltip>
        </div>
      )}
      {!fromServer && !isMine && (
        <div className="flex w-full items-end gap-2 justify-start">
          <Tooltip
            title={senderUsername ?? "[已刪除]"}
            placement="left"
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
            <Avatar
              alt={senderUsername ?? ""}
              src={
                avatarUrls.find((element) => element.username === senderUsername)
                  ?.avatarUrl ?? ""
              }
              className="w-[30px] h-[30px]"
            >
              {username.charAt(0)}
            </Avatar>
          </Tooltip>
          <div className="break-all px-3 py-1 bg-gray-100 text-black rounded-r-2xl rounded-tl-2xl">
            {Urlify(content)}
          </div>
        </div>
      )}
    </>
  );
}
