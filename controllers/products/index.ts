import { Request, Response } from "express";
import { createProduct, getCostByProduct } from "../../services/products";
import { Products } from "../../models/products/products";
import { ProductsCost } from "../../models/products/products-cost";

const createProducts = async (req: Request, res: Response): Promise<void> => {
    try {
        const product: Products = await createProduct(req.body);
        res.status(201).json(product);
    } catch (error) {
        res.status(500).json(error);
    }
};

const getProductCost = async (req: Request, res: Response): Promise<void> => {
    try {
        const { productId, from, to } = req.query;
        const cost: ProductsCost[] = await getCostByProduct(
            productId as string,
            from as string,
            to as string
        );
        res.status(201).json(cost);
    } catch (error) {
        console.log(error);
    }
};

export { createProducts, getProductCost };
