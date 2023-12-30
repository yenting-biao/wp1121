import Link from "next/link";
import { datePreviewType } from "../layout";
import Avatar from "@mui/material/Avatar";
import AvatarGroup from "@mui/material/AvatarGroup";

export default function ChatPreview({
  dateId,
  title,
  lastMessage,
  avatarUrls,
  selected,
}: datePreviewType & { selected: boolean }) {
  return (
    <>
      {selected && (
        <Link
          className={
            "flex flex-row items-center py-2 px-2 gap-2 bg-blue-100 hover:bg-blue-300 rounded-md w-full"
          }
          href={`/food-dates/my-dates/${dateId}`}
        >
          <AvatarGroup
            max={2}
            total={(title.match(/is/g) || []).length}
            spacing="medium"
          >
            {avatarUrls.map((element, index) => (
              <Avatar
                alt={element.username ?? ""}
                key={index}
                src={element.avatarUrl ?? ""}
              >
                {element.username.charAt(0) ?? ""}
              </Avatar>
            ))}
          </AvatarGroup>
          <div className="flex flex-col w-full flex-grow overflow-hidden">
            <h3 className="text-lg overflow-hidden text-ellipsis whitespace-nowrap w-full">
              {title}
            </h3>
            {!!lastMessage && (
              <p className="text-gray-500 whitespace-nowrap overflow-hidden overflow-ellipsis w-full">
                {lastMessage}
              </p>
            )}
          </div>
        </Link>
      )}
      {!selected && (
        <Link
          className={
            "flex flex-row items-center py-2 px-2 gap-2 hover:bg-gray-100 rounded-md w-full"
          }
          href={`/food-dates/my-dates/${dateId}`}
        >
          <AvatarGroup
            max={2}
            total={(title.match(/is/g) || []).length}
            spacing="medium"
          >
            {avatarUrls.map((element, index) => (
              <Avatar
                alt={element.username ?? ""}
                key={index}
                src={element.avatarUrl ?? ""}
              >
                {element.username.charAt(0) ?? ""}
              </Avatar>
            ))}
          </AvatarGroup>
          <div className="flex flex-col w-full flex-grow overflow-hidden">
            <h3 className="text-lg overflow-hidden text-ellipsis whitespace-nowrap w-full">
              {title}
            </h3>
            {!!lastMessage && (
              <p className="text-gray-500 whitespace-nowrap overflow-hidden overflow-ellipsis w-full">
                {lastMessage}
              </p>
            )}
          </div>
        </Link>
      )}
    </>
  );
}
