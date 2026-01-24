import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

import aiRoutes from './routes/ai.routes';
import contentStudioRoutes from './routes/content-studio.routes';

app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/ai/studio', contentStudioRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'Express AI Service is running' });
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'express-ai' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
