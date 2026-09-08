import { Router, Request, Response } from 'express';
import { PracticeService } from '../services/PracticeService.js';
import { StructuredDesignPayload } from '../domain/entities/StructuredDesignPayload.js';

export function createApiRouter(service: PracticeService): Router {
  const router = Router();

  // 1. Problem Catalog
  router.get('/problems', async (_req: Request, res: Response) => {
    try {
      const problems = await service.getProblems();
      res.json(problems);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  router.get('/problems/:id', async (req: Request, res: Response) => {
    try {
      const problem = await service.getProblemById(req.params.id);
      res.json(problem);
    } catch (err: any) {
      res.status(404).json({ error: err.message });
    }
  });

  // 2. Attempts Management
  router.post('/problems/:id/attempts', async (req: Request, res: Response) => {
    try {
      const learnerId = (req.body.learnerId as string) || 'learner-default';
      const attempt = await service.startAttempt({
        problemId: req.params.id,
        learnerId
      });
      res.status(201).json(attempt);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  router.get('/attempts/:id', async (req: Request, res: Response) => {
    try {
      const attempt = await service.getAttempt(req.params.id);
      res.json(attempt);
    } catch (err: any) {
      res.status(404).json({ error: err.message });
    }
  });

  // 3. Solution Submission (Stateful & Asynchronous)
  router.post('/attempts/:id/submit', async (req: Request, res: Response) => {
    try {
      const rawPayload = req.body.payload;
      if (!rawPayload) {
        return res.status(400).json({ error: 'Missing submission payload in request body.' });
      }

      // Reconstruct payload object based on format
      const payload = new StructuredDesignPayload(
        rawPayload.entities || [],
        rawPayload.interfaces || [],
        rawPayload.designPatterns || [],
        rawPayload.tradeOffsAndAssumptions || '',
        rawPayload.codeSnippetOrPseudocode || ''
      );

      const attempt = await service.submitSolution({
        attemptId: req.params.id,
        payload
      });

      // 202 Accepted: Submission saved, evaluation running
      res.status(202).json({
        message: 'Submission accepted for evaluation.',
        attempt
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // 4. Retry Failed Evaluation
  router.post('/attempts/:id/retry', async (req: Request, res: Response) => {
    try {
      const attempt = await service.retryEvaluation(req.params.id);
      res.json({ message: 'Evaluation re-triggered.', attempt });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // 5. Attempt History & Iteration Comparison
  router.get('/problems/:id/history', async (req: Request, res: Response) => {
    try {
      const learnerId = (req.query.learnerId as string) || 'learner-default';
      const history = await service.getAttemptHistory(req.params.id, learnerId);
      res.json(history);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
}
