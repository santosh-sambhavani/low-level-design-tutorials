// MessageSender interface
interface MessageSender {
    sendMessage(message: string): void;
}

// Concrete implementations
class EmailSender implements MessageSender {
    sendMessage(message: string): void {
        console.log(`📧 Sending Email: ${message}`);
    }
}

class SMSSender implements MessageSender {
    sendMessage(message: string): void {
        console.log(`📱 Sending SMS: ${message}`);
    }
}

class PushSender implements MessageSender {
    sendMessage(message: string): void {
        console.log(`🔔 Sending Push Notification: ${message}`);
    }
}

// Abstract class
abstract class Message {
    constructor(protected sender: MessageSender) { }

    abstract send(content: string): void;
}

// Concrete abstractions
class Alert extends Message {
    send(content: string): void {
        this.sender.sendMessage(`[ALERT] ${content}`);
    }
}

class Reminder extends Message {
    send(content: string): void {
        this.sender.sendMessage(`[REMINDER] ${content}`);
    }
}

class Promotion extends Message {
    send(content: string): void {
        this.sender.sendMessage(`[PROMOTION] ${content}`);
    }
}


const emailSender = new EmailSender();
const smsSender = new SMSSender();
const pushSender = new PushSender();

const alertViaEmail = new Alert(emailSender);
const reminderViaSMS = new Reminder(smsSender);
const promoViaPush = new Promotion(pushSender);

alertViaEmail.send("Server CPU usage is high");
reminderViaSMS.send("Meeting at 4 PM");
promoViaPush.send("Get 30% off on your next booking!");
