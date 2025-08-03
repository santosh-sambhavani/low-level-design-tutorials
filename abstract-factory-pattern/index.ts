// 1. Product Interfaces (Abstract Products)
// These define the common interface for a family of products (e.g., buttons, text boxes).
interface IButton {
    press(): void;
}

interface ITextBox {
    showText(): void;
}

// 2. Concrete Products
// These are the specific implementations for each product interface, per family (e.g., Mac, Windows).
class MacButton implements IButton {
    press(): void {
        console.log("Mac Button Pressed");
    }
}

class WindowsButton implements IButton {
    press(): void {
        console.log("Windows Button Pressed");
    }
}

class MacTextBox implements ITextBox {
    showText(): void {
        console.log("Showing Mac Text Box");
    }
}

class WindowsTextBox implements ITextBox {
    showText(): void {
        console.log("Showing Windows Text Box");
    }
}

// 3. Abstract Factory Interface
// This declares methods for creating each abstract product.
interface IFactory {
    createButton(): IButton;
    createTextBox(): ITextBox;
}

// 4. Concrete Factories
// These implement the abstract factory interface to create concrete products for a specific family.
class MacFactory implements IFactory {
    createButton(): IButton {
        return new MacButton();
    }

    createTextBox(): ITextBox {
        return new MacTextBox();
    }
}

class WindowsFactory implements IFactory {
    createButton(): IButton {
        return new WindowsButton();
    }

    createTextBox(): ITextBox {
        return new WindowsTextBox();
    }
}

// 5. Abstract Factory Creator (GUIAbstractFactory)
// This class is responsible for creating the concrete factory based on the OS type.
class GUIAbstractFactory {
    static createFactory(osType: string): IFactory {
        if (osType === "Windows") {
            return new WindowsFactory();
        } else if (osType === "Mac") {
            return new MacFactory();
        }
        // Default to MacFactory if OS type is not recognized
        return new MacFactory();
    }
}

// 6. Client Code Example
// The client interacts with the abstract factory to get a concrete factory,
// then uses that factory to create products without knowing their concrete types.
function createGUIFactory(osType: string): void {
    console.log(`\nMachine OS: ${osType}`);

    // The GUIAbstractFactory creates the appropriate concrete factory (Mac or Windows)
    const factory: IFactory = GUIAbstractFactory.createFactory(osType);

    // The client uses the factory to create products
    const button: IButton = factory.createButton();
    const textBox: ITextBox = factory.createTextBox();

    // The client uses the products
    button.press();
    textBox.showText();
}

// Running the client code for different OS types
createGUIFactory("Mac");
createGUIFactory("Windows");
createGUIFactory("Linux"); // This will default to Mac as per the example
