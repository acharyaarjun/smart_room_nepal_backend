import { User } from "@/models";

declare module "socket.io" {
  interface Socket {
    data: {
      user: User;
    };
  }
}
