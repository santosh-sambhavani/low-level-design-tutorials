# 🧠 Command Design Pattern – Notes & Revision Guide

## ✅ **Definition**

The **Command Pattern** is a behavioral design pattern in which an object encapsulates all the information needed to perform an action or trigger an event at a later time. It decouples the object that invokes the operation from the one that knows how to perform it.

> **Intent**: Encapsulate a request as an object, thereby allowing parameterization of clients with different requests, queuing of requests, and support for undoable operations.

---

## 🔁 **How Command Pattern Supports Undo/Redo**

| Concept                         | Description                                                                                      |
| ------------------------------- | ------------------------------------------------------------------------------------------------ |
| **Encapsulation of Actions**    | Each command (like `LightOnCommand`) encapsulates logic inside `execute()` and `undo()` methods. |
| **Invoker Delegates Execution** | The invoker (e.g., remote control) only triggers the `execute()` method of the command.          |
| **Undo Operation**              | The command knows how to reverse its action via `undo()`.                                        |
| **Command History**             | A stack (LIFO) tracks executed commands for supporting multi-level undo/redo.                    |
| **Loose Coupling**              | The invoker doesn’t need to know about receiver logic — it's handled within command objects.     |

---

## ⚙️ **Example Flow**

1. User presses a button on the remote.
2. The invoker (remote) calls `execute()` on the `LightOnCommand`.
3. `LightOnCommand` calls `light.on()` on the receiver.
4. The command is pushed to a history stack for undo support.
5. User presses undo.
6. The invoker pops the last command and calls `undo()` on it.
7. `LightOnCommand` calls `light.off()` to reverse the action.

---

## 🧩 **UML Diagram (Simplified)**

```
+----------------+       +----------------+       +----------------+
|    Invoker     |       |    Command     |       |    Receiver    |
|----------------|       |----------------|       |----------------|
| -commands[]    |<>---->| +execute()     | <-----| +on()          |
| +pressButton() |       | +undo()        |       | +off()         |
+----------------+       +----------------+       +----------------+
                                ^                        ^
                                |                        |
                        +----------------+       +-----------------+
                        | ConcreteCommand|       | ConcreteReceiver|
                        | (e.g. LightCmd)|       | (e.g. Light)    |
                        +----------------+       +----------------+
```

---

## 🧑‍💻 **Refactored Code Example (in Markdown Code Block)**

```java
// Receiver
class Light {
    public void on() {
        System.out.println("Light is ON");
    }

    public void off() {
        System.out.println("Light is OFF");
    }
}

// Command Interface
interface Command {
    void execute();
    void undo();
}

// Concrete Command
class LightOnCommand implements Command {
    private Light light;

    public LightOnCommand(Light light) {
        this.light = light;
    }

    public void execute() {
        light.on();
    }

    public void undo() {
        light.off();
    }
}

// Invoker
class RemoteControl {
    private Command command;
    private Stack<Command> history = new Stack<>();

    public void setCommand(Command command) {
        this.command = command;
    }

    public void pressButton() {
        command.execute();
        history.push(command);
    }

    public void pressUndo() {
        if (!history.isEmpty()) {
            history.pop().undo();
        }
    }
}

// Client
public class Main {
    public static void main(String[] args) {
        Light livingRoomLight = new Light();
        Command lightOn = new LightOnCommand(livingRoomLight);

        RemoteControl remote = new RemoteControl();
        remote.setCommand(lightOn);

        remote.pressButton();  // Output: Light is ON
        remote.pressUndo();    // Output: Light is OFF
    }
}
```

---

## 🧠 **Key Takeaways**

* Commands encapsulate request logic.
* Enables flexible, extensible command assignment (e.g., macros).
* Supports undo/redo, logging, and queuing of commands.
* Promotes loose coupling between invoker and receiver.

---

Let me know if you'd like the same structure for other patterns!
