# Observer Design Pattern Notes

---

## 1. **Definition**

The **Observer Design Pattern** defines a **one-to-many dependency** between objects so that when one object (the **subject/observable**) changes state, all its dependents (the **observers**) are automatically notified and updated.

- It solves the problem of keeping multiple objects in sync without tight coupling.
- Commonly used in event handling, notification systems, and data binding.

---

## 2. **Core Concept**

- **Subject (Observable):** Maintains a list of observers and notifies them of state changes.
- **Observer:** Defines an interface for objects that should be notified of changes in the subject.
- **One-to-Many Relationship:** One subject can have many observers.

---

## 3. **Standard UML Diagram**

```
+-----------------+           +-----------------+
|   > |           |   > |
|   IObservable   |           |    IObserver    |
+-----------------+           +-----------------+
| +addObserver()  |           | +update()       |
| +removeObserver()|          +-----------------+
| +notifyObservers()|
+-----------------+

          ^                             ^
          |                             |
+-----------------+           +-----------------+
| ConcreteSubject |           | ConcreteObserver|
+-----------------+           +-----------------+
| -observers: list|           | -subject: ref   |
| -state          |           |                 |
+-----------------+           +-----------------+
| +addObserver()  |           | +update()       |
| +removeObserver()|          +-----------------+
| +notifyObservers()|         
| +getState()     |
| +setState()     |
+-----------------+
```

---

## 4. **Example UML (YouTube Channel Notification System)**

- **IChannel (Observable):** Interface for YouTube channel with methods: subscribe, unsubscribe, notifySubscribers.
- **ISubscriber (Observer):** Interface with update method.
- **ConcreteChannel:** Implements IChannel, maintains list of subscribers, notifies them on new video upload.
- **ConcreteSubscriber:** Implements ISubscriber, updates itself when notified.

```
+-----------------+           +-------------------+
|   > |           |   >   |
|    IChannel     |           |   ISubscriber     |
+-----------------+           +-------------------+
| +subscribe()    |           | +update()         |
| +unsubscribe()  |           +-------------------+
| +notify()       |
+-----------------+

          ^                             ^
          |                             |
+---------------------+       +---------------------+
| ConcreteChannel     |       | ConcreteSubscriber   |
+---------------------+       +---------------------+
| -subscribers: list  |       | -channel: reference |
| -latestVideo: string|       | -name: string       |
+---------------------+       +---------------------+
| +subscribe()        |       | +update()            |
| +unsubscribe()      |       +---------------------+
| +notify()           |
| +uploadVideo()      |
| +getLatestVideo()   |
+---------------------+
```

---

## 5. **Summary**

- **Observer Pattern** enables **automatic notification** of dependent objects.
- Avoids **polling** by using a **push** mechanism.
- Supports **dynamic subscription** and **unsubscription**.
- Widely used in **event-driven systems**, **notification services**, **UI event handling**.
