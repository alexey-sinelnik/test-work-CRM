import { Column, DataType, HasMany, Index, Model, PrimaryKey, Table } from "sequelize-typescript";
import { ProductOfIncomingInvoice } from "../product-of-incoming-invoice";
import { ProductsOfOutgoingInvoice } from "../products-of-expense-invoice";

@Table
export class Products extends Model {
    @PrimaryKey
    @Index
    @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
    id!: string;

    @Index
    @Column({ type: DataType.STRING })
    name!: string;

    @Column({ type: DataType.INTEGER })
    quantity!: number;

    @HasMany(() => ProductOfIncomingInvoice)
    incomingProducts!: ProductOfIncomingInvoice[];

    @HasMany(() => ProductsOfOutgoingInvoice)
    expenseOrderProducts!: ProductsOfOutgoingInvoice[];
}
