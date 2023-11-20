export type User = {
  id: string;
  username: string;
  provider: "github" | "credentials";
};

export type ChatroomPinMessage = {
  chatroomId: string;
  pinnedMessageId: string | number;
};

export type DeleteChatroom = {
  chatroomId: string;
};

export type Message = {
  id: string;
  chatroomID: string;
  sender: string;
  message: string;
  validity: string; // TODO: new
};

export type MessageWithValidity = {
  id: string | number;
  chatroomId: string;
  sender: string;
  //message: string;
  validity: string;
};

export type newChatroom = {
  user1name: string;
  user2name: string;
};
