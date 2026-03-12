import { Router, Request, Response, NextFunction } from 'express';
import { briefingStore } from '../lib/store.js';
import { transformJanusPayload, type JanusPayload } from '../lib/transform.js';

const router = Router();

// ─── Auth middleware ─────────────────────────────────────────────────────────

function apiAuth(req: Request, res: Response, next: NextFunction): void {
  const secret = process.env.JANUS_SECRET;
  if (!secret) {
    // Dev mode — no secret set, skip auth
    next();
    return;
  }
  if (req.headers['x-janus-secret'] !== secret) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  next();
}

// ─── POST /relay/briefings ────────────────────────────────────────────────────

router.post('/', apiAuth, (req: Request, res: Response): void => {
  const payload = req.body as JanusPayload;

  // Validate required fields
  if (!payload.briefing_id || !payload.account?.name || !payload.briefing?.location_id) {
    res.status(400).json({
      error: 'Missing required fields: briefing_id, account.name, briefing.location_id',
    });
    return;
  }

  if (typeof payload.revision !== 'number') {
    res.status(400).json({ error: 'Missing required field: revision (number)' });
    return;
  }

  // Transform — may throw on unknown location
  let transformed;
  try {
    transformed = transformJanusPayload(payload);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(422).json({ error: message });
    return;
  }

  const existing = briefingStore.get(payload.briefing_id);

  // 409 if stored revision is already at or ahead of incoming
  if (existing && existing.revision >= payload.revision) {
    res.status(409).json({
      error: `Conflict: stored revision ${existing.revision} >= incoming revision ${payload.revision}`,
    });
    return;
  }

  briefingStore.set(payload.briefing_id, {
    briefing_id: payload.briefing_id,
    revision: payload.revision,
    record: transformed.record,
    participants: transformed.participants,
  });

  res.status(200).json({ ok: true, briefing_id: payload.briefing_id });
});

// ─── GET /relay/briefings ─────────────────────────────────────────────────────

router.get('/', apiAuth, (_req: Request, res: Response): void => {
  const records = [];
  const participants = [];

  for (const entry of briefingStore.values()) {
    records.push(entry.record);
    participants.push(...entry.participants);
  }

  res.json({ records, participants });
});

// ─── GET /relay/briefings/:id ─────────────────────────────────────────────────

router.get('/:id', apiAuth, (req: Request, res: Response): void => {
  const entry = briefingStore.get(req.params.id);
  if (!entry) {
    res.status(404).json({ error: `Briefing not found: ${req.params.id}` });
    return;
  }
  res.json(entry);
});

export default router;
