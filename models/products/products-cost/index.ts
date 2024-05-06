import { Column, DataType, Index, Model, PrimaryKey, Table } from "sequelize-typescript";

@Table
export class ProductsCost extends Model {
    @PrimaryKey
    @Column({ type: DataType.UUID, allowNull: false, defaultValue: DataType.UUIDV4 })
    id!: string;

    @Index
    @Column({ type: DataType.STRING, allowNull: false })
    date!: string;

    @Index
    @Column({ type: DataType.STRING, allowNull: false })
    product_id!: string;

    @Column({ type: DataType.FLOAT, allowNull: false, defaultValue: 0 })
    cost!: number;
}
