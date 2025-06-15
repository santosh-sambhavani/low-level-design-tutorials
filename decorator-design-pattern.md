# Decorator Pattern Notes with Problem & Solution Example

### Problem Without Decorator Pattern

- Suppose you have a base object (e.g., a **Mario character** in a game).
- Mario can have multiple **power-ups**: height increase, gun ability, star power, flying, etc.
- If you use **inheritance** to add these powers, you must create a new subclass for every combination:
  - `MarioWithHeightUp`
  - `MarioWithGun`
  - `MarioWithStarPower`
  - `MarioWithHeightUpAndGun`
  - `MarioWithGunAndStarPower`
  - `MarioWithHeightUpGunStarPower`
  - ... and so on.
- This leads to **class explosion**: exponential growth in subclasses for every combination of features.
- Managing and maintaining this hierarchy becomes **complex and unscalable**.
- Also, inheritance fixes behavior at compile time; you cannot change Mario’s abilities dynamically at runtime.

---

### How Decorator Pattern Solves This

<img width="1159" alt="Screenshot 2025-06-15 at 9 33 14 PM" src="https://github.com/user-attachments/assets/f65a57b1-a009-4de1-b769-cf6c299f70a1" />

- Instead of subclassing, use **composition**: wrap the base object with decorator objects that add features.
- Each decorator:
  - Implements the same interface as the base object.
  - Holds a reference to a component (base object or another decorator).
  - Adds its own functionality before/after delegating to the wrapped object.
- You can **dynamically stack decorators at runtime** in any order and combination.
- This avoids class explosion and allows flexible, dynamic behavior extension.

---

### Summary of Benefits

- **Dynamic behavior extension at runtime** without subclassing.
- **Avoids class explosion** by combining decorators instead of subclasses.
- **Favors composition over inheritance** for flexibility.
- Supports **recursive wrapping** for stacking multiple features.
- Easy to maintain and extend.

---

### Standard Definition

> Decorator Pattern attaches additional responsibilities to an object dynamically. It provides a flexible alternative to subclassing for extending functionality.
