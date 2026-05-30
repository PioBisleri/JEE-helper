import { storage } from './storage';

const REVIEW_INTERVALS = [1, 3, 7, 14];

export function getDueReviews() {
  const concepts = storage.getConceptsLearned();
  const now = new Date();
  return concepts.filter(c => new Date(c.nextReview) <= now);
}

export function markReviewed(concept, wasCorrect) {
  const concepts = storage.getConceptsLearned();
  const idx = concepts.findIndex(c => c.concept === concept);
  if (idx === -1) return;

  const current = concepts[idx];
  const currentInterval = current.reviewStage || 0;
  const nextStage = wasCorrect ? Math.min(currentInterval + 1, REVIEW_INTERVALS.length - 1) : 0;
  const daysUntilNext = REVIEW_INTERVALS[nextStage];

  concepts[idx] = {
    ...current,
    reviewStage: nextStage,
    nextReview: new Date(Date.now() + daysUntilNext * 86400000).toISOString(),
    lastReviewed: new Date().toISOString()
  };

  localStorage.setItem('jeeforge_concepts', JSON.stringify(concepts));
  
  // Log attempt details to historical reviews
  storage.addConceptReview(concept, wasCorrect, nextStage);
}

export function getConceptReviewStatus(conceptObj) {
  const now = new Date();
  const nextReview = new Date(conceptObj.nextReview);
  const diffTime = nextReview.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    const overdueDays = Math.abs(diffDays);
    if (overdueDays >= 3) {
      return {
        status: 'overdue_critical',
        label: `Overdue by ${overdueDays} days`,
        badgeColor: 'var(--danger)',
        badgeDimColor: 'var(--danger-dim)'
      };
    }
    return {
      status: 'due',
      label: 'Review due today',
      badgeColor: 'var(--warning)',
      badgeDimColor: 'var(--warning-dim)'
    };
  }

  return {
    status: 'learned',
    label: `Review in ${diffDays} day${diffDays > 1 ? 's' : ''}`,
    badgeColor: 'var(--success)',
    badgeDimColor: 'var(--success-dim)'
  };
}
