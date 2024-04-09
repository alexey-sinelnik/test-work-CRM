import { Column, DataType, HasMany, Index, Model, PrimaryKey, Table } from "sequelize-typescript";
import { ProductsOfOutgoingInvoice } from "../../products/products-of-expense-invoice";

@Table
export class OutgoingInvoice extends Model {
    @PrimaryKey
    @Index
    @Column({ type: DataType.UUID, allowNull: false, defaultValue: DataType.UUIDV4 })
    id!: string;

    @Column({ type: DataType.DATE, allowNull: false, defaultValue: new Date().getDate() })
    date!: Date;

    @HasMany(() => ProductsOfOutgoingInvoice)
    products!: ProductsOfOutgoingInvoice[];
}
