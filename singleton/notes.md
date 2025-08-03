## 🔒 Singleton Design Pattern – Simple Notes

### ✅ What is Singleton Design Pattern?

> The Singleton Pattern ensures that a **class has only one instance** in the entire application, and it provides a **global access point** to that instance.

---

### 🎯 Why use it?

* To avoid creating multiple instances of a class that should behave like a **single shared resource**
* Ensures **controlled access** to a resource (e.g., configuration, logging, cache)

---

### 💡 Real-Life Example: Logger

Imagine you have a `Logger` class used across your entire app.
If every file creates a new `Logger` instance, your logs could go to different places or get duplicated.
Instead, you make `Logger` a **singleton** — only one shared instance handles all logs.

---

### 🧪 Basic Structure

```ts
class Logger {
  private static instance: Logger;

  private constructor() {}  // private constructor prevents direct creation

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  log(message: string) {
    console.log(`[LOG]: ${message}`);
  }
}
```

Usage:

```ts
const logger1 = Logger.getInstance();
const logger2 = Logger.getInstance();

logger1.log("Hello!");
console.log(logger1 === logger2);  // true → same instance
```

---

### 🧱 Key Characteristics

| Feature                 | Meaning                               |
| ----------------------- | ------------------------------------- |
| **Private constructor** | Prevents creating objects using `new` |
| **Static instance**     | Holds the single object               |
| **Static accessor**     | Returns the shared instance           |
