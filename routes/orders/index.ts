import express, { Router } from "express";
import { createExpenseOrders, createIncomingOrders } from "../../controllers/orders";

const router: Router = express.Router();

router.post("/create-arrival", createIncomingOrders);

router.post("/create-order", createExpenseOrders);

export default router;
