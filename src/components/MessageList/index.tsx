import { useEffect, useState } from "react";
import io from "socket.io-client";

import { api } from "../../services/api";

import logoImg from "../../assets/logo.svg";
import styles from "./styles.module.scss";

interface IMessage {
  id: string;
  text: string;
  user: {
    name: string;
    avatar_url: string;
  };
}

const socket = io("http://172.21.32.106:4000/");

const messagesQueue: IMessage[] = [];

socket.on("new_message", (newMessage: IMessage) =>
  messagesQueue.push(newMessage)
);

export const MessageList = () => {
  const [messages, setMessages] = useState<IMessage[]>([]);

  useEffect(() => {
    api.get<IMessage[]>("/message").then(({ data }) => setMessages(data));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      if (messagesQueue.length > 0) {
        setMessages((prevState) =>
          [messagesQueue[0], prevState[0], prevState[1]].filter(Boolean)
        );

        console.log(messagesQueue, messages);
        messagesQueue.shift();
      }
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className={styles.messageListWrapper}>
      <img src={logoImg} alt="Do While 2021" />

      <ul className={styles.messageList}>
        {messages.map((message) => (
          <li key={message.id} className={styles.message}>
            <p className={styles.messageContent}>{message.text}</p>
            <div className={styles.messageUser}>
              <div className={styles.userImage}>
                <img src={message.user.avatar_url} alt={message.user.name} />
              </div>
              <span>{message.user.name}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
