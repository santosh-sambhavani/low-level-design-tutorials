## ✅ Composite Design Pattern – Quick Revision

---

### 📌 Definition

The **Composite Design Pattern** is used to treat individual objects (leaf nodes) and groups of objects (composite nodes) uniformly through a **common interface**.
It’s ideal for **tree-like hierarchies** (e.g., file systems, UI components, menus).

---

### 🌳 Real-World Example: File System

* **File** → Leaf node (no children)
* **Folder** → Composite node (can contain files/folders recursively)
* Both implement a common interface `FileSystemItem`.
* The main benefit is we can follow open / closed principle easily.
* Because we don't have to add conditions in code.

---

### 🧩 UML Diagram

```
+-------------------+
| FileSystemItem    |<<interface>>
|-------------------|
| + ls()            |
| + getName()       |
+-------------------+
        ▲
        |
  -----------------
  |               |
+------+       +--------+
| File |       | Folder |
+------+       +--------+
| name |       | name   |
| size |       | items: List<FileSystemItem> |
+------+       +--------+
| +ls()        | +ls()  |
+------------- +--------+
```

---

### 🧑‍💻 Sample Code (in Java-like pseudocode)

```java
interface FileSystemItem {
    void ls();  // list contents
    String getName();
}

class File implements FileSystemItem {
    String name;
    public void ls() { System.out.println(name); }
    public String getName() { return name; }
}

class Folder implements FileSystemItem {
    String name;
    List<FileSystemItem> children = new ArrayList<>();
    
    public void add(FileSystemItem item) { children.add(item); }
    
    public void ls() {
        System.out.println("Folder: " + name);
        for (FileSystemItem item : children) {
            item.ls();  // recursive call
        }
    }

    public String getName() { return name; }
}
```

---

### 🎯 Key Points

* Treat **leaf and composite** through **common interface**.
* Avoids type-checking (`instanceof`) in client code. So every time we need to add new file type we don't have to add new condition instead simply need to add new class for the new type
* For example we need to add new file type like zipFile, we will simply create new child class of IFileSystems with it's required methods like extract. (add that method as optional in IFileSystems too). this way we don't have to make changes everywhere in logic.
* Naturally supports **recursion**.
* Makes it easy to add new component types.

---

### 📚 Use Cases

* File systems
* GUI components (Container → Button/TextBox)
* Menus with submenus
* Organization structures
