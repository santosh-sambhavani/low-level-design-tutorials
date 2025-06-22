/**
 * ATM Cash Dispenser using Chain of Responsibility Pattern
 */

/** 
 * @interface IDispenseResponse
 * @property {boolean} success - Indicates if the dispense operation was successful.
 * @property {Object} notesDispensed - A map where keys are note values and values are the counts of those notes dispensed.
 * @example
 * const response: IDispenseResponse = {
 *     success: true,
 *     notesDispensed: {
 *         100: 2,
 *         50: 1,
 *         20: 3
 *     }
 * };
 */
interface IDispenseResponse {
    success: boolean;
    notesDispensed: {
        [noteValue: number]: number;
    }
}

class MainHandler {
    constructor(private readonly nextHandler: INoteHandler) {}

    public dispense(amount: number): IDispenseResponse {
        console.log(`Disbursing ${amount} from MainHandler`);

        if (amount <= 0 || amount < 100) {
            return { success: false, notesDispensed: {} };
        }

        const response = this.nextHandler.dispense(amount);
        
        return response.success ? response : { success: false, notesDispensed: {} };
    }

    public remainingNotes(): void {
        this.nextHandler.getNoteCount();
    }
}

abstract class INoteHandler {
    private nextHandler: INoteHandler | null = null;
    constructor(
        private readonly noteValue: number = 0,
        private noteCount: number = 0
    ) {}

    public setNext(handler: INoteHandler): void {
        this.nextHandler = handler;
    }

    public dispense(amount: number): IDispenseResponse {
        let remainingAmount = amount;
        const requiredNotes = Math.floor(amount / this.noteValue);
        const response: IDispenseResponse = {
            success: false,
            notesDispensed: {}
        };

        if (requiredNotes < this.noteCount) {
            response.notesDispensed[this.noteValue] = requiredNotes;
            this.noteCount -= requiredNotes;
            remainingAmount -= (this.noteValue * requiredNotes);
        } else if (requiredNotes > this.noteCount && this.nextHandler) {
            response.notesDispensed[this.noteValue] = this.noteCount;
            remainingAmount -= (this.noteValue * this.noteCount);
            this.noteCount = 0;
        }

        if (remainingAmount === 0) {
            response.success = true;
        } else if ((remainingAmount > 0) && this.nextHandler) {
            const nextResponse = this.nextHandler.dispense(remainingAmount);
            if (nextResponse.success) {
                response.notesDispensed = {
                    ...response.notesDispensed,
                    ...nextResponse.notesDispensed
                };
                response.success = true;
            }
        }

        if (!response.success) {
            this.noteCount += (response.notesDispensed[this.noteValue] || 0);
        }

        return response;
    }

    public getNoteCount(): void {
        console.log(`Remaining notes of ${this.noteValue}: ${this.noteCount}`);
        this.nextHandler?.getNoteCount();
    }
}

class ThousandWorthHandler extends INoteHandler {
    constructor(noteCount: number) {
        super(1000, noteCount);
    }
}

class FiveHundredWorthHandler extends INoteHandler {
    constructor(noteCount: number) {
        super(500, noteCount);
    }
}

class HundredWorthHandler extends INoteHandler {
    constructor(noteCount: number) {
        super(100, noteCount);
    }
}

// Example usage
const thousandHandler = new ThousandWorthHandler(10);
const fiveHundredHandler = new FiveHundredWorthHandler(10);
const hundredHandler = new HundredWorthHandler(10);

const mainHandler = new MainHandler(thousandHandler);
thousandHandler.setNext(fiveHundredHandler);
fiveHundredHandler.setNext(hundredHandler);

let amountToDispense; // Example amount to dispense
let dispenseResponse;

console.log("\n================ Dispensing 2700: ================");
amountToDispense = 2700; // Example amount to dispense
dispenseResponse = mainHandler.dispense(amountToDispense);
console.log(`Dispense Response: ${JSON.stringify(dispenseResponse, null, 2)}`);

console.log("\n================ remaining: ================");
mainHandler.remainingNotes();

console.log("\n================ Dispensing 7000: ================");
amountToDispense = 7000; // Example amount to dispense
dispenseResponse = mainHandler.dispense(amountToDispense);
console.log(`Dispense Response: ${JSON.stringify(dispenseResponse, null, 2)}`);

console.log("\n================ remaining: ================");
mainHandler.remainingNotes();

console.log("\n================ Dispensing 10000: ================");
amountToDispense = 10000; // Example amount to dispense
dispenseResponse = mainHandler.dispense(amountToDispense);
console.log(`Dispense Response: ${JSON.stringify(dispenseResponse, null, 2)}`);

console.log("\n================ remaining: ================");
mainHandler.remainingNotes();

console.log("\n================ Dispensing 5000: ================");
amountToDispense = 5000; // Example amount to dispense
dispenseResponse = mainHandler.dispense(amountToDispense);
console.log(`Dispense Response: ${JSON.stringify(dispenseResponse, null, 2)}`);

console.log("\n================ remaining: ================");
mainHandler.remainingNotes();

console.log("\n================ Dispensing 1000: ================");
amountToDispense = 1000; // Example amount to dispense
dispenseResponse = mainHandler.dispense(amountToDispense);
console.log(`Dispense Response: ${JSON.stringify(dispenseResponse, null, 2)}`);

console.log("\n================ remaining: ================");
mainHandler.remainingNotes();