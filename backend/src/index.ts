import express, {} from 'express';
import morgan from "morgan"
import debug from 'debug';
import cors from 'cors'

import connectDB from './configs/db.js';
import accessLogStream from './middlewares/loggerMiddleware.js';
import corsOptions from './middlewares/corsOptionsMiddleware.js';
import authRoutes from './routes/auth.routes.js';
import profileRoutes from './routes/profile.routes.js';
import medicineRoutes from './routes/medicine.routes.js';
import homeRoutes from './routes/home.routes.js';
import orderRoutes from './routes/order.routes.js';
import pharmacyAuthRoutes from './routes/pharmacy.auth.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import adminRoutes from './routes/admin.routes.js';

const appDebug = debug('app:startup');
const app = express();
const PORT = process.env.PORT || 3000;

connectDB()

app.use('/uploads', express.static('uploads'));
app.use(express.json())
app.use(morgan("combined",{stream:accessLogStream}))
app.use(cors(corsOptions))

app.use("/api",authRoutes)
app.use('/api/profile', profileRoutes);
app.use('/api/pharmacies/nearby', homeRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/pharmacy', pharmacyAuthRoutes);
app.use('/api/notifications', notificationRoutes);
app.use("/api/admin", adminRoutes)

app.listen(PORT, () => {
  appDebug(`Server is running on http://localhost:${PORT}`);
}
);
export default app;