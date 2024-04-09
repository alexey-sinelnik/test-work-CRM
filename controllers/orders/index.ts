import { Request, Response } from "express";
import { createOutgoingInvoice, createIncomingInvoice } from "../../services/orders";
import { IncomingInvoice } from "../../models/orders/incoming-orders";
import { OutgoingInvoice } from "../../models/orders/outgoing-invoice";

const createIncomingOrders = async (req: Request, res: Response): Promise<void> => {
    const incomingOrder: IncomingInvoice | undefined = await createIncomingInvoice(req.body);
    res.status(201).json(incomingOrder);
};

const createExpenseOrders = async (req: Request, res: Response): Promise<void> => {
    const expenseOrder: Error | OutgoingInvoice | undefined = await createOutgoingInvoice(req.body);
    res.status(201).json(expenseOrder);
};

export { createIncomingOrders, createExpenseOrders };
