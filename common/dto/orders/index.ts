import { IProduct } from "../../types/products";

export interface ICreateIncomingInvoiceDto {
    date: Date;
    products: IProduct[];
}

export interface ICreateOutgoingInvoiceDto {
    date: Date;
    products: IProduct[];
}

export interface IFindOutgoingInvoiceDto {
    productId: string;
    from?: number | Date;
    to?: number | Date;
}

export interface IFindProductCostByDateDto {
    from?: number | Date;
    to?: number | Date;
    productId: string;
}
