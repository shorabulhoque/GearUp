import { ErrorRequestHandler } from "express";
import httpStatus from "http-status";
import config from "../config";


const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {

    let statusCode = err.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
    let message = err.message || "Something went wrong!";

    res.status(statusCode).json({
        success: false,
        message,
        errorDetails: err,
        stack: config.env === "development" ? err.stack : undefined,
    });
};


export default globalErrorHandler;