import {
    Column,
    DataType,
    ForeignKey,
    Index,
    Model,
    PrimaryKey,
    Table
} from "sequelize-typescript";
import { IncomingInvoice } from "../../orders/incoming-orders";
import { Products } from "../products";

@Table
export class ProductOfIncomingInvoice extends Model {
    @PrimaryKey
    @Index
    @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
    id!: string;

    @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
    price!: number;

    @Column({ type: DataType.INTEGER })
    quantity!: number;

    @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
    stockBalance!: number;

    @ForeignKey(() => IncomingInvoice)
    document_id!: string;

    @ForeignKey(() => Products)
    product_id!: string;
}
