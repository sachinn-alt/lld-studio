import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { InMemoryProblemRepository } from './infrastructure/repositories/InMemoryProblemRepository.js';
import { InMemoryAttemptRepository } from './infrastructure/repositories/InMemoryAttemptRepository.js';
import { DeterministicRuleEvaluator } from './evaluators/DeterministicRuleEvaluator.js';
import { SemanticRubricEvaluator } from './evaluators/SemanticRubricEvaluator.js';
import { CompositeEvaluator } from './evaluators/CompositeEvaluator.js';
import { PracticeService } from './services/PracticeService.js';
import { createApiRouter } from './api/routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '5mb' }));

// 1. Instantiate Repositories
const problemRepo = new InMemoryProblemRepository();
const attemptRepo = new InMemoryAttemptRepository();

// 2. Instantiate Evaluator Strategy Pipeline (Composite Pattern)
const deterministicEvaluator = new DeterministicRuleEvaluator();
const semanticEvaluator = new SemanticRubricEvaluator();
const compositeEvaluator = new CompositeEvaluator([
  deterministicEvaluator,
  semanticEvaluator
]);

// 3. Instantiate Domain Application Service
const practiceService = new PracticeService(problemRepo, attemptRepo, compositeEvaluator);

// 4. Register API Routes
app.use('/api', createApiRouter(practiceService));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({
    status: 'UP',
    platform: 'LLD Practice Platform API',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`[LLD Practice Platform] Server running on http://localhost:${PORT}`);
});

export { app, practiceService };
