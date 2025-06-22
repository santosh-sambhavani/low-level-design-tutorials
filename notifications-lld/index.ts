class IReceiver {
    constructor(
        public type: NotificationType,
        public to: string,
    ) { }
}

// ============= Notification part starts ====================

class IdGenerator {
    static generateId(): string {
        return Math.random().toString(36).substr(2, 9);
    }
}

abstract class INotificationContent {
    constructor(
        public id: string,
        public title: string,
        public message: string,
        public additionalData?: Record<string, any>,
    ) { }
}

abstract class INotification extends INotificationContent {
    constructor(
        public title: string,
        public message: string,
        public additionalData?: Record<string, any>,
    ) {
        super(IdGenerator.generateId(), title, message, additionalData);
    }

    abstract getContent(): INotificationContent;
}

class SimpleNotification extends INotification {
    constructor(
        title: string,
        message: string,
        additionalData?: Record<string, any>,
    ) {
        super(title, message, additionalData);
    }
    getContent(): INotificationContent {
        return {
            id: this.id,
            title: this.title,
            message: this.message,
            additionalData: this.additionalData || {},
        };
    }
}

abstract class INotificationDecorator extends INotification {
    constructor(protected notification: INotification) {
        super(notification.title, notification.message, notification.additionalData);
    }

    abstract getContent(): INotificationContent;
}

class NotificationWithTimestamp extends INotificationDecorator {
    constructor(notification: INotification) {
        super(notification);
    }
    getContent(): INotificationContent {
        const original = this.notification.getContent()
        return {
            ...original,
            additionalData: {
                ...original.additionalData,
                timestamp: new Date().toISOString(),
            }
        }
    }
}

class NotificationWithLogo extends INotificationDecorator {
    private logoUrl: string;
    constructor(notification: INotification, logoUrl: string) {
        super(notification);
        this.logoUrl = logoUrl;
    }
    getContent(): INotificationContent {
        const original = this.notification.getContent();
        return {
            ...original,
            additionalData: {
                ...original.additionalData,
                logoUrl: this.logoUrl,
            }
        };
    }
}

// ============= Notification part ends ====================

// ============= Notifier starts ====================
abstract class IObserver {
    abstract update(notification: INotificationContent): void;
}

abstract class INotifier {
    private observers: Map<string, IObserver> = new Map<string, IObserver>();

    addObserver(id: string, observer: IObserver): void {
        if (!this.observers.has(id)) {
            this.observers.set(id, observer);
        } else {
            console.warn(`Observer ${id} is already registered.`);
        }
    }

    getObserver(id: string): IObserver | undefined {
        return this.observers.get(id);
    }

    notify(notification: INotificationContent): void {
        this.observers.forEach(observer => observer.update(notification));
    }

    setNotification(notification: INotification): void {
        this.notify(notification.getContent());
    }
}

class Notifier extends INotifier {
    constructor(
        public fromEmail: string = "",
        public fromPhone: string = ""
    ) { 
        super();
    }
}

// ============= Notifier ends ====================

// ============= Notification Strategy starts ====================

enum NotificationType {
    Email = "Email",
    SMS = "SMS",
}

interface INotificationStrategy {
    send(notification: INotificationContent, notifier?: INotifier): void;
}

class EmailNotificationStrategy implements INotificationStrategy {
    toEmail: string;
    constructor(toEmail: string) {
        this.toEmail = toEmail;
    }
    send(notification: INotificationContent, notifier?: INotifier): void {
        console.log(`\nSending Email Notification from ${(notifier as Notifier).fromEmail} to ${this.toEmail}:
            ${JSON.stringify(notification, null, 2)}
        `);
    }
}

class SMSNotificationStrategy implements INotificationStrategy {
    toPhone: string;
    constructor(toPhone: string) {
        this.toPhone = toPhone;
    }
    send(notification: INotificationContent, notifier?: INotifier): void {
        console.log(`\nSending Email Notification from ${(notifier as Notifier).fromPhone} to ${this.toPhone}:
            ${JSON.stringify(notification, null, 2)}
        `);
    }
}

class NotificationStrategyFactory {
    /**
     * Factory method to create notification strategy based on type
     * @param type - Type of notification (Email or SMS)
     * @returns INotificationStrategy
     */
    static createStrategy(receiver: IReceiver): INotificationStrategy {
        const { type, to } = receiver;
        switch (type) {
            case NotificationType.Email:
                return new EmailNotificationStrategy(to);
            case NotificationType.SMS:
                return new SMSNotificationStrategy(to);
            default:
                throw new Error(`Unknown notification type: ${type}`);
        }
    }
}

// ============= Notification Strategy ends ====================


// ============= Observer starts ====================

class NotificationEngine extends IObserver {
    private strategies: INotificationStrategy[] = [];
    private notifier: INotifier;

    constructor(notifier: INotifier) {
        super();
        this.notifier = notifier;
    }

    public addStrategy(strategy: INotificationStrategy): void {
        this.strategies.push(strategy);
    }

    public update(notification: INotificationContent): void {
        this.strategies.forEach(strategy => {
            strategy.send(notification, this.notifier);
        })
    }
}

class LoggerService extends IObserver {
    logs: string[] = [];
    addLog(notification: INotificationContent): void {
        const log = `[${new Date().toISOString()}] LoggerService: notification - ${JSON.stringify(notification, null, 2)}`
        this.logs.push(log);
        console.log(log);
    }

    update(notification: INotificationContent): void {
        this.addLog(notification);
    }
}

// ============= Observer ends ====================

// ============= Notification Service starts ====================
class NotificationFacade {
    private topics: Map<string, INotifier> = new Map<string, Notifier>();
    private static instance: NotificationFacade | null = null;

    public static getInstance(): NotificationFacade {
        if (!NotificationFacade.instance) {
            NotificationFacade.instance = new NotificationFacade();
        }
        return NotificationFacade.instance;
    }

    public addTopic(topic: string, fromEmail?: string, fromPhone?: string): INotifier {
        if (this.topics.has(topic)) {
            console.warn(`Topic ${topic} already exists. Returning existing notifier.`);
            return this.topics.get(topic)!;
        }
        const notifier = new Notifier(fromEmail, fromPhone);
        notifier.addObserver("NotificationEngine", new NotificationEngine(notifier));
        notifier.addObserver("LoggerService", new LoggerService());
        this.topics.set(topic, notifier);
        return notifier;
    }

    public sendNotification(notifierId: string, notification: INotification): void {
        const notifier = this.topics.get(notifierId);
        if (notifier) {
            notifier.setNotification(notification);
        } else {
            console.warn(`Notifier with ID ${notifierId} not found.`);
        }
    }

    subscribeToTopic(topic: string, receivers: { to: string, type: NotificationType }[]): void {
        const notifier = this.topics.get(topic);
        if (!notifier) {
            console.warn(`Topic ${topic} does not exist.`);
            return;
        }

        const notificationEngine = notifier.getObserver("NotificationEngine") as NotificationEngine;
        receivers.forEach(receiver => {
            let strategy = NotificationStrategyFactory.createStrategy(receiver);
            notificationEngine?.addStrategy(strategy);
        })

        console.log(`Subscribed to topic ${topic} with receivers:`, receivers);
    }

    public getTopics(): Map<string, INotifier> {
        return this.topics;
    }
}

class NotificationService {
    private static instance: NotificationService | null = null;
    private notificationFacade: NotificationFacade;

    constructor() {
        this.notificationFacade = NotificationFacade.getInstance();
    }

    public static getInstance(): NotificationService {
        if (!NotificationService.instance) {
            NotificationService.instance = new NotificationService();
        }
        return NotificationService.instance;
    }

    public addTopic(topic: string, fromEmail?: string, fromPhone?: string): void {
        this.notificationFacade.addTopic(topic, fromEmail, fromPhone);
    }

    public subscribeToTopic(topic: string, receivers: IReceiver[]): void {
        this.notificationFacade.subscribeToTopic(topic, receivers);
    }

    public sendNotification(topic: string, notification: INotification): void {
        this.notificationFacade.sendNotification(topic, notification);
    }

    public getTopics(): Map<string, INotifier> {
        return this.notificationFacade.getTopics();
    }
}

// ============= Notification Service ends ====================

// Example usage
const notification = new SimpleNotification("Welcome", "Thank you for joining us!");
console.log("\n================ Simple Notification Content: ================");
console.log(notification.getContent());

// Decorate the notification with timestamp and logo
const decoratedNotification = new NotificationWithTimestamp(
    new NotificationWithLogo(notification, "https://example.com/logo.png")
);
console.log("\n================ Decorated Notification Content: ================");
console.log(decoratedNotification.getContent());

console.log("\n================ Send Notification Flow: ================");
// Create a notification service instance
const notificationService = NotificationService.getInstance();

// Add a topic
notificationService.addTopic("UserNotifications", "admin@email.com", "1234567890");

// Subscribe to the topic with different notification types
notificationService.subscribeToTopic("UserNotifications", [
    { to: "user1@gmail.com", type: NotificationType.Email },
    { to: "7564536828", type: NotificationType.SMS },
]);

// Send a notification
notificationService.sendNotification(
    "UserNotifications",
    decoratedNotification
);