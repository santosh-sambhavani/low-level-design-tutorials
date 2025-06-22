## ✅ Template Method Pattern – Quick Revision

---

### 📌 Definition

The **Template Method Pattern** defines the **skeleton of an algorithm** in a method (called the *template method*) and allows subclasses to **override specific steps** without changing the overall structure of the algorithm.

---

### ❗ Problem It Solves

#### 🔸 Without Template Method:

* You have **several classes** that perform a process in **multiple steps**, but each class **duplicates the order of steps**.
* Risk of **mistakes** like missing a step or changing the execution order.
* Difficult to **enforce consistency** across different implementations.

#### 🔸 What Template Method Fixes:

* Defines the **fixed order** once in a base class.
* Allows subclasses to **customize individual steps**, without touching the flow.
* Ensures **consistent behavior**, **reduces duplication**, and **prevents misuse**.

---

### 🧠 Real-World Analogy: ML Model Training

Every model trainer (e.g., Decision Tree, Neural Network) follows this pipeline:

1. Load data
2. Preprocess
3. Train
4. Evaluate
5. Save

Different models do these steps **differently**, but the **sequence** remains the same.
That’s what the **Template Method Pattern** ensures.

---

### 🧩 UML Diagram

```
+---------------------+
|   ModelTrainer      | <<abstract class>>
+---------------------+
| + trainPipeline()   |  <<template method>>
| + loadData()        |  <<abstract>>
| + preprocess()      |  <<abstract>>
| + trainModel()      |  <<abstract>>
| + evaluate()        |  <<abstract>>
| + saveModel()       |  <<concrete>>
+---------------------+
          ▲
          |
  --------------------------
  |                        |
+------------------+   +----------------------+
| DecisionTree     |   | NeuralNetworkTrainer |
+------------------+   +----------------------+
| + trainModel()   |   | + trainModel()       |
| + evaluate()     |   | + evaluate()         |
+------------------+   +----------------------+
```

---

### 🧑‍💻 Sample Code (Pseudocode)

```java
abstract class ModelTrainer {
    public final void trainPipeline() {
        loadData();
        preprocess();
        trainModel();
        evaluate();
        saveModel();  // optional shared logic
    }

    abstract void loadData();
    abstract void preprocess();
    abstract void trainModel();
    abstract void evaluate();

    void saveModel() {
        System.out.println("Saving model to disk...");
    }
}

class NeuralNetworkTrainer extends ModelTrainer {
    void loadData() { ... }
    void preprocess() { ... }
    void trainModel() { ... }
    void evaluate() { ... }
}

class DecisionTreeTrainer extends ModelTrainer {
    void loadData() { ... }
    void preprocess() { ... }
    void trainModel() { ... }
    void evaluate() { ... }
}
```

---

### 🎯 Key Points

* `trainPipeline()` is the **template method** — fixed and final.
* Subclasses **override steps**, but not the sequence.
* Promotes **code reuse** and **enforces consistency**.

---

### ✅ Benefits

* Avoids code duplication across similar classes.
* Protects the algorithm structure from being altered.
* Lets subclasses handle the parts they specialize in.
* Encourages consistent workflows in systems like pipelines, protocols, or multi-step processes.

---

### 📚 Use Cases

* Data processing pipelines (ETL, ML training)
* Document rendering (e.g., PDF vs HTML)
* Game development (e.g., game loop setup)
* Web request lifecycles (e.g., pre/post-processing)

---

### 📌 Standard Definition

> **Template Method Pattern** defines the skeleton of an algorithm in a base class, allowing subclasses to redefine specific steps without changing the algorithm's structure.

