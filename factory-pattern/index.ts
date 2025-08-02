abstract class NotificationService {
    abstract sendNotification(message: string): void 
}

class EmailNotificationService extends NotificationService {
    public sendNotification(message: string): void {
        console.log(`Email Notification: ${message}`);
    }
}

class SMSNotificationService extends NotificationService {
    public sendNotification(message: string): void {
        console.log(`SMS Notification: ${message}`);
    }
}

abstract class NotificationServiceFactory {
    abstract crateNotificationService(): NotificationService 
}

class EmailNotificationServiceFactory extends NotificationServiceFactory {
    public crateNotificationService(): NotificationService {
        return new EmailNotificationService();
    }
}

class SMSNotificationServiceFactory extends NotificationServiceFactory {
    public crateNotificationService(): NotificationService {
        return new SMSNotificationService();
    }
}

function sendNotification(factory: NotificationServiceFactory, message: string): void {
    const service = factory.crateNotificationService();
    service.sendNotification(message);
}

// Usage
const emailFactory = new EmailNotificationServiceFactory();
sendNotification(emailFactory, "Hello via Email!");

const smsFactory = new SMSNotificationServiceFactory();
sendNotification(smsFactory, "Hello via SMS!");