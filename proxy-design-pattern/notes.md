## ✅ Proxy Design Pattern – Quick Revision

---

### 📌 Definition

> **Proxy Pattern** provides a **surrogate or placeholder** for another object to **control access** to it.

It is a **structural design pattern** that lets you **intervene** when the real object is expensive to create, needs protection, or resides remotely.

---

### ❗ Problem It Solves

#### 🔸 Without Proxy:

* Direct interaction with the **real object** could be:

  * **Resource-intensive** (e.g., large image file or DB object)
  * **Insecure** (unauthorized access)
  * **Slow or remote** (networked objects)

#### 🔸 With Proxy:

* Proxy acts as a **gatekeeper or representative** to control access.
* Delays object creation, adds validation, or handles communication.
* **Client code remains unchanged** — interacts with proxy just like the real object.

---

### 🔧 Types of Proxy

#### 1. 🛰️ **Remote Proxy**

* Acts as a local representative for an object in a **different address space** (e.g., network, another JVM, microservice).
* Common in RMI, gRPC, REST clients.

#### 2. 🧠 **Virtual Proxy**

* Delays the creation of an **expensive object** until it is actually needed (**lazy loading**).
* Example: Loading large images only when displayed.

#### 3. 🔐 **Protection Proxy**

* Controls access to the real object by **authorization rules**.
* Often used in **role-based access control (RBAC)** systems.

---

### 🧩 UML Diagram

```
+------------------+
|     Subject      | <<interface>>
+------------------+
| + display()      |
+------------------+
        ▲
        |
  -----------------------
  |                     |
+--------+        +------------------+
| Real   |        |     Proxy        |
| Object |        +------------------+
+--------+        | - realObj        |
| +display()|     | + display()      |
+--------+        +------------------+
                      |
      -----------------------------------------
      |                  |                    |
VirtualProxy     RemoteProxy       ProtectionProxy
```

---

### 🧑‍💻 Sample Code (Virtual Proxy in Java-like pseudocode)

```java
interface Image {
    void display();
}

class RealImage implements Image {
    private String filename;

    public RealImage(String filename) {
        this.filename = filename;
        loadFromDisk(); // expensive operation
    }

    private void loadFromDisk() {
        System.out.println("Loading " + filename);
    }

    public void display() {
        System.out.println("Displaying " + filename);
    }
}

class ProxyImage implements Image {
    private RealImage realImage;
    private String filename;

    public ProxyImage(String filename) {
        this.filename = filename;
    }

    public void display() {
        if (realImage == null) {
            realImage = new RealImage(filename); // lazy load
        }
        realImage.display();
    }
}
```

---

### 🎯 Key Points

* Proxy **implements the same interface** as the real object.
* Proxy can:

  * Delay creation (`Virtual`)
  * Add security (`Protection`)
  * Act as a local stand-in (`Remote`)
* Client doesn't know whether it’s using real or proxy object.

---

### ✅ Benefits

* Supports **lazy initialization**
* Adds **security** layers transparently
* Handles **remote access** gracefully
* Reduces **resource usage**

---

### 📚 Use Cases

* **Virtual Proxy**: Image viewer apps, ORM lazy loading
* **Protection Proxy**: Admin vs user permissions
* **Remote Proxy**: APIs, distributed systems, RMI

---

### 📌 Standard Definition

> The Proxy Pattern provides a **surrogate or placeholder** for another object to **control access** to it.
