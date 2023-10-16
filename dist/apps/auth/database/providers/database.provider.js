"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.databaseProviders = void 0;
const mongoose = require("mongoose");
exports.databaseProviders = [
    {
        provide: 'AUTH_DB_CONNECTION',
        useFactory: () => mongoose.connect(process.env.AUTH_DB_URL),
    },
];
//# sourceMappingURL=database.provider.js.map