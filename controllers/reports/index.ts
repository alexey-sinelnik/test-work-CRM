import { createReport } from "../../services/reports";
import { Request, Response } from "express";
import { Report } from "../../common/types/reports";

const createReports = async (req: Request, res: Response): Promise<void> => {
    const { from, to } = req.query;
    const report: Report[] = await createReport(from as string, to as string);
    res.status(201).json(report);
};

export { createReports };
