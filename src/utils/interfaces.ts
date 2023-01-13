import { AnyMessageContent, proto, WASocket } from '@adiwajshing/baileys';

export type CommandFC = <T>(
  sock: WASocket,
  command: Command,
  additional?: any,
) => T | any;

export interface Replys {
  [key: string]: CommandFC | undefined;
}

export interface SubCommands {
  [key: string]: CommandFC | undefined;
}

export type buttonResponse = proto.Message.ButtonsResponseMessage &
  proto.Message.TemplateButtonReplyMessage;

export interface RawCommand {
  raw: proto.IWebMessageInfo;
  id: string;
  participant: string;
  textMessage: string;
  isMe?: boolean | null;
  isGroup?: boolean;
  isReply: boolean;
  isCommand: boolean;
  isListReply?: boolean;
  isButtonReply?: boolean;
  buttonReply: {
    raw?: buttonResponse;
    id: string;
    index: number;
    text: string;
    type: proto.Message.ButtonsResponseMessage.Type;
    command: string;
    args: string[];
  };
  listReply: {
    raw?: proto.Message.IListResponseMessage | null;
    id: string;
    title?: string | null;
    description?: string | null;
    command: string;
    args: string[];
  };
  command: string;
  subCommand: string;
  subArgs: string[];
  args: {
    arg: string;
    values: string[];
  }[];
}

export interface MessageFuncs {
  replyMessage: (
    text: string,
    more?: AnyMessageContent,
  ) => Promise<proto.WebMessageInfo | undefined>;
  sendText: (
    text: string,
    more?: AnyMessageContent,
  ) => Promise<proto.WebMessageInfo | undefined>;
}

export type Command = MessageFuncs & RawCommand;

export interface MakeCommand {
  (message: proto.IWebMessageInfo, sock: WASocket): Command;
}

export interface MakeMessageFuncs {
  (command: RawCommand, sock: WASocket): MessageFuncs;
}
