import express, { Router } from "express";
import { createProducts, getProductCost } from "../../controllers/products";

const router: Router = express.Router();

router.post("/create-products", createProducts);

router.get("/get-product-cost", getProductCost);

export default router;
