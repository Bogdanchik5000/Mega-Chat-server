//interfaces without ts

const messagesHistory = {};

class MessageService {
  constructor() {
    this.messagesHistory = {};
  }

  addMessage(roomNum, newMessage) {
    const messages = this.messagesHistory[roomNum] ?? [];
    this.messagesHistory[roomNum] = [...messages, newMessage];

    return this.messagesHistory[roomNum];
  }

  getMessagesHistory(roomNum) {
    return this.messagesHistory[roomNum];
  }

  deleteMessagesHistory(roomNum) {
    delete this.messagesHistory[roomNum];
  }
}

const messageService = new MessageService(messagesHistory);

export default messageService;
