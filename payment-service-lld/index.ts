class PaymentUser {
    constructor(private username: string) {}

    getDetails() {
        return {
            username: this.username
        };
    }
}

enum GATEWAY_TYPE {
    GPAY = "GPay",
    PAYTM = "Paytm",
}

class IDGenerator {
    static generate() {
        return Math.random().toString(36).substr(2, 9);
    }
}

interface IPaymentReq {
    id: string;
    sender: PaymentUser;
    receiver: PaymentUser;
    amount: number;
    gatewayType: GATEWAY_TYPE;
    message?: string;
}

class PaymentReq {
    private id: string;
    constructor(
        private sender: PaymentUser,
        private receiver: PaymentUser,
        private amount: number,
        private gatewayType: GATEWAY_TYPE,
        private message?: string
    ) {
        const id = IDGenerator.generate();
        this.id = id;
    }

    get getDetails(): IPaymentReq {
        return {
            id: this.id,
            sender: this.sender,
            receiver: this.receiver,
            amount: this.amount,
            gatewayType: this.gatewayType,
            message: this.message
        };
    }
}

class PaymentReqController {
    private static instance: PaymentReqController
    private PaymentReqs: Map<string, PaymentReq> = new Map();

    getInstance(): PaymentReqController {
        if (!PaymentReqController.instance) {
            PaymentReqController.instance = new PaymentReqController();
        }
        return PaymentReqController.instance;
    }

    create(
        sender: PaymentUser,
        receiver: PaymentUser,
        amount: number,
        gatewayType: GATEWAY_TYPE,
        message?: string
    ) {
        const newPaymentReq = new PaymentReq(
            sender,
            receiver,
            amount,
            gatewayType,
            message
        );

        this.PaymentReqs.set(newPaymentReq.getDetails.id, newPaymentReq);

        return newPaymentReq;
    }

    list(): PaymentReq[] {
        return Array.from(this.PaymentReqs.values());
    }
}

interface IResponse {
    data: object
    statusCode: number
}

abstract class IPaymentGateway {
    abstract validate(paymentReq: PaymentReq): boolean;
    abstract process(paymentReq: PaymentReq): void;
    abstract confirm(paymentReq: PaymentReq): IResponse;

    processPayment(paymentReq: PaymentReq) {
        try {
            this.validate(paymentReq);
            this.process(paymentReq);
            this.confirm(paymentReq);
        } catch (error) {
            throw error;
        }
    }
}

class PaytmGateway extends IPaymentGateway {
    validate(paymentReq: PaymentReq) {
        console.log(`PAYTM gateway :: validation :: ${paymentReq.getDetails.id}`)
        return true
    }

    process(paymentReq: PaymentReq) {
        console.log(`PAYTM gateway :: process :: ${paymentReq.getDetails.id}`)
    }

    confirm(paymentReq: PaymentReq): IResponse {
        console.log(`PAYTM gateway :: confirm :: ${paymentReq.getDetails.id}`)
        return { data: {}, statusCode: 200 }
    }
}


class GPayGateway extends IPaymentGateway {
    validate(paymentReq: PaymentReq) {
        console.log(`GPAY gateway :: confirm :: ${paymentReq.getDetails.id}`)
        return true
    }

    process(paymentReq: PaymentReq) {
        console.log(`GPAY gateway :: confirm :: ${paymentReq.getDetails.id}`)
    }

    confirm(paymentReq: PaymentReq): IResponse {
        console.log(`GPAY gateway :: confirm :: ${paymentReq.getDetails.id}`)
        return { data: {}, statusCode: 200 }
    }
}

class PaymentGatewayFactory {
    static createGateway(gatewayType: GATEWAY_TYPE): IPaymentGateway {
        switch (gatewayType) {
            case GATEWAY_TYPE.GPAY:
                return new GPayGateway();
            case GATEWAY_TYPE.PAYTM:
                return new PaytmGateway();
            default:
                throw new Error("Invalid gateway type");
        }
    }
}

/**
 * In this design proxy introduces because requirements was to add retries.
 * but in real if we are calling gateway apis using axios than we can
 * use axiosRetry. so the main purpose if proxy class is to handle
 * custom logic which is not responsibility of original gateway classes.
 */
class PaymentGatewayProxy extends IPaymentGateway {
    private realGateway: IPaymentGateway;
    constructor(gateWayType: GATEWAY_TYPE) {
        super();
        this.realGateway = PaymentGatewayFactory.createGateway(gateWayType);
    }

    validate(paymentReq: PaymentReq) {
        console.log(`\nPaymentGatewayProxy :: validate :: STARTS ${paymentReq.getDetails.id}`)
        const res = this.realGateway.validate(paymentReq);
        console.log(`PaymentGatewayProxy :: validate :: ENDS ${paymentReq.getDetails.id}`)
        return res
    }

    process(paymentReq: PaymentReq) {
        const retryCount = 3;
        let attempts = 0;
        while (attempts < retryCount) {
            try {
                console.log(`\nPaymentGatewayProxy :: process :: STARTS ${paymentReq.getDetails.id}`)

                /** uncomment to check retry */
                // if (attempts < 2) throw new Error("First request will fail");

                this.realGateway.process(paymentReq);
                console.log(`PaymentGatewayProxy :: process :: ENDS ${paymentReq.getDetails.id}`)
                break;
            } catch (error) {
                if (attempts < retryCount) {
                    console.error(`Process failed. Retrying... (Attempt ${attempts + 1} of ${retryCount})`);
                    attempts++;
                } else { 
                    throw error
                }
            }
        }
    }

    confirm(paymentReq: PaymentReq): IResponse {
        console.log(`\nPaymentGatewayProxy :: confirm :: STARTS ${paymentReq.getDetails.id}`)
        const response = this.realGateway.confirm(paymentReq);
        console.log(`PaymentGatewayProxy :: confirm :: ENDS ${paymentReq.getDetails.id}`)
        return response;
    }
}

class PaymentService {
    private proxy: PaymentGatewayProxy;
    constructor(gatewayType: GATEWAY_TYPE) {
        this.proxy = new PaymentGatewayProxy(gatewayType);
    }

    processPayment(paymentReq: PaymentReq) {
        this.proxy.processPayment(paymentReq)
    }
}

interface ISchedulerJobDetails {
    fromUserId: string;
    toUserId: string;
    startDate: Date;
    endDate: Date;
    gatewayType: GATEWAY_TYPE;
    frequencyInSeconds: number;
    nextBillingDate: Date;
}

class ISchedulerJob {
    private nextBillingDate: Date;
    constructor(
        private fromUserId: string,
        private toUserId: string,
        private startDate: Date,
        private endDate: Date,
        private gatewayType: GATEWAY_TYPE,
        private frequencyInSeconds: number, // this would be in days
    ) {
        this.nextBillingDate = this.startDate;
    }

    scheduleNextBilling() {
        const now = new Date();
        if (now >= this.endDate) {
            console.log("Scheduler Job ends for this user.")
            return;
        }
        // here we will use dayjs.add functionality instead of this
        this.nextBillingDate = new Date(now.getTime() + this.frequencyInSeconds * 1000);
        console.log(`Next billing scheduled for ${this.nextBillingDate.toLocaleString()}`);
    }

    public getDetails(): ISchedulerJobDetails {
        return {
            fromUserId: this.fromUserId,
            toUserId: this.toUserId,
            startDate: this.startDate,
            endDate: this.endDate,
            gatewayType: this.gatewayType,
            frequencyInSeconds: this.frequencyInSeconds,
            nextBillingDate: this.nextBillingDate,
        }   
    }
}

class SchedulerController {
    private schedulerJobs: Map<string, ISchedulerJob> = new Map();
    private static instance: SchedulerController;
    constructor() {}
    static getInstance(): SchedulerController {
        if (!SchedulerController.instance) {
            SchedulerController.instance = new SchedulerController();
        }
        return SchedulerController.instance;
    }

    createSchedulerJob(
        fromUserId: string,
        toUserId: string,
        startDate: Date,
        endDate: Date,
        gatewayType: GATEWAY_TYPE,
        frequencyInSeconds: number
    ) {
        const jobId = IDGenerator.generate();
        const newSchedulerJob = new ISchedulerJob(
            fromUserId,
            toUserId,
            startDate,
            endDate,
            gatewayType,
            frequencyInSeconds
        );
        
        this.schedulerJobs.set(jobId, newSchedulerJob);
        console.log(`Scheduler job created with ID: ${jobId}`);
        return jobId;
    }

    getSchedulerJobs(): ISchedulerJob[] {
        return Array.from(this.schedulerJobs.values());
    }
}

/** In real instead of this class we would be using original cron service like aws cloudwatch scheduler 
 * And scheduler job controller will be creating cron in that service. And scheduler job record will also be created
 * at the same time but it would be to store data in DB. so that user can fetch info
*/
class SchedulerJobCron {
    private static instance: SchedulerJobCron;
    private intervalId: number | null = null;
    
    constructor() {}
    
    static getInstance(): SchedulerJobCron {
        if (!SchedulerJobCron.instance) {
            SchedulerJobCron.instance = new SchedulerJobCron();
        }
        return SchedulerJobCron.instance;
    }
    
    start() {
        if (this.intervalId) {
            console.log("Scheduler cron is already running");
            return;
        }
        
        console.log("Starting scheduler cron job...");
        this.intervalId = setInterval(() => {
            this.processScheduledJobs();
        }, 1000); // Check every second
    }
    
    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            console.log("Scheduler cron job stopped");
        }
    }
    
    private processScheduledJobs() {
        const schedulerController = SchedulerController.getInstance();
        const jobs = schedulerController.getSchedulerJobs();
        const now = new Date();
        
        jobs.forEach(job => {
            const jobDetails = job.getDetails();
            if (now >= jobDetails.nextBillingDate && now <= jobDetails.endDate) {
                console.log(`\n ========> Processing scheduled payment for job: ${jobDetails.fromUserId} -> ${jobDetails.toUserId}`);
                
                // Create users for the scheduled payment
                const fromUser = new PaymentUser(jobDetails.fromUserId);
                const toUser = new PaymentUser(jobDetails.toUserId);
                
                // Create payment request
                const paymentReqController = new PaymentReqController().getInstance();
                const latestPaymentReq = paymentReqController.create(fromUser, toUser, 100, jobDetails.gatewayType, "Scheduled payment");
                
                // Process the payment
                const paymentService = new PaymentService(jobDetails.gatewayType);
                paymentService.processPayment(latestPaymentReq);
                
                // Schedule next billing
                job.scheduleNextBilling();

                console.log(`\n ========> DONE : ${jobDetails.fromUserId} -> ${jobDetails.toUserId}`);
            }
        });
    }
}

/** // NORMAL USAGE *
// const john = new PaymentUser('John Doe');
// const jane = new PaymentUser('Jane Smith');

// console.log("=========> Creating payment request...")
// const paymentReqController = new PaymentReqController().getInstance();
// paymentReqController.create(john, jane, 100, GATEWAY_TYPE.PAYTM, "Gift");

// console.log("=========> Listing all payment requests...")
// const paymentReqs = paymentReqController.list();
// console.log(paymentReqs);

// console.log("=========> Processing a payment request...")
// let paymentReq = paymentReqs[0];
// let paymentService = new PaymentService(GATEWAY_TYPE.PAYTM);
// paymentService.processPayment(paymentReq);

// console.log("\n=========> Processing a payment request...")
// paymentReq = paymentReqs[0];
// paymentService = new PaymentService(GATEWAY_TYPE.GPAY);
// paymentService.processPayment(paymentReq);

/** Scheduler Job Usage */
console.log("=========> Creating scheduler job...")
const schedulerController = SchedulerController.getInstance();
const startDate = new Date();
const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
const frequencyInSeconds = 10; // Every 10 seconds for demo

const jobId = schedulerController.createSchedulerJob(
    'user123',
    'user456', 
    startDate,
    endDate,
    GATEWAY_TYPE.PAYTM,
    frequencyInSeconds
);

console.log("=========> Starting scheduler cron...")
const schedulerCron = SchedulerJobCron.getInstance();
schedulerCron.start();

// Let it run for a while to see scheduled payments
setTimeout(() => {
    console.log("=========> Stopping scheduler cron...")
    schedulerCron.stop();
}, 25000); // Stop after 25 seconds