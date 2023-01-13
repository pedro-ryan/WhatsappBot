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

// ===========================
// Generate Command Interfaces
// ===========================

export type ActionsFC = (sock: WASocket, command: Command) => any;
export type ActionsList = { [k: string]: ActionsFC };

export type GenConfig = {
  Command: ActionsFC;
  SubCommand?: ActionsFC;
  SubCommands?: ActionsList;
  ReplyButtons?: ActionsList;
  ReplyList?: ActionsList;
};

type Info = {
  usedFor: string;
  howUse: string;

  args?: {
    [k: string]: {
      usedFor: string;
      howUse: string;
    };
  };
};

export type GenericGenInfos = {
  toUse: string;
  description: string;
  args?: {
    [k: string]: {
      usedFor: string;
      howUse: string;
    };
  };
  subCommands?: {
    [k: string]: Info;
  };
  ReplyButtons?: {
    [k: string]: Info;
  };
  ReplyList?: {
    [k: string]: Info;
  };
};

export type GenInfos<
  SC extends string | number | symbol,
  RB extends string | number | symbol,
  RL extends string | number | symbol,
> = {
  toUse: string;
  description: string;
  subCommands?: Record<SC, Info>;
  ReplyButtons?: Record<RB, Info>;
  ReplyList?: Record<RL, Info>;
};

export type GenerateCommand<T, K extends keyof T> = (
  config: {
    Command: ActionsFC;
    SubCommands: T;
    ReplyButtons?: ActionsList;
    ReplyList?: ActionsList;
  },
  infos: K,
) => (sock: WASocket, command: Command) => void;

export type CommandThis = { sock: WASocket; command: Command };
export type FailContext = 'NoCommand' | 'NotFound';
export type ExecConfig = {
  CheckType?: boolean;
  commands?: ActionsList;
  index: string;
  onFail?: (ctx: FailContext) => any;
};
