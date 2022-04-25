import chalk from 'chalk';
import clear from 'clear';
import { doc, onSnapshot, Timestamp } from 'firebase/firestore';
import inquirer from 'inquirer';
import { sendMessage } from '../../services/chat-service';
import { db, usersCollection } from '../../services/db';
import { CoreProvider } from '../../services/state/CoreProvider';
import { MessageType, UserType } from '../../types';
import { print } from '../../utils/log';

const formatChat = (
  message: MessageType,
  recipient: UserType,
  { userId: loggedInUserId, email: loggedInUserEmail }: UserType
): string => {
  let formattedMessage = '';
  let formattedDate = new Date((message.sentDate as any).toDate()).toLocaleString();

  if (message.senderId === loggedInUserId) {
    formattedMessage =
      chalk.red(loggedInUserEmail) + ' ' + chalk.blue(formattedDate) + ' ' + chalk.blueBright(message.content);
  } else {
    formattedMessage =
      chalk.cyan(recipient.email) + ' ' + chalk.green(formattedDate) + ' ' + chalk.yellow(message.content);
  }
  return formattedMessage;
};

export const chatView = async (chatId: string, recipient: UserType) => {
  const loggedInUserId = CoreProvider.instance.userId;
  let userEmail = CoreProvider.instance.userEmail;
  let stillChatting = true;
  const senderId = CoreProvider.instance.userId;
  const unsub = onSnapshot(doc(db, 'chats', chatId), (doc) => {
    clear();
    print('Type "exit()" to leave chat');
    for (const d of doc.data()!.messages) {
      print(formatChat(d, recipient, { userId: loggedInUserId, email: userEmail }));
    }
  });

  while (stillChatting) {
    const { message } = await inquirer.prompt([
      {
        name: 'message',
        message: '->',
        type: 'input',
        validate: (input) => input !== '',
      },
    ]);

    if (message === 'exit()') {
      stillChatting = false;
      clear();
    }
    await sendMessage({
      senderId,
      recipientId: recipient.userId,
      content: message,
      chatId,
    });
  }
  return unsub();
};
