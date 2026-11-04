# Persist Product Reviews and Avoid Unnecessary AI Reanalysis

- **Status:** Proposed
- **Date:** 2026-11-04

## Context

Currently, the `/api/integrations/shopify/product` endpoint retrieves product data from Shopify and generates an AI review using Claude on every request.

This means that reopening a product triggers another AI analysis, even when the product data has not changed.

This behavior introduces:

- Unnecessary Anthropic API costs.
- Increased response times.
- Repeated generation of identical or similar AI reviews.

At the current MVP stage, introducing review persistence is not a priority. However, as the number of merchants and products grows, repeated AI analysis should be avoided.

## Decision

Introduce a dedicated `ProductReview` database model to persist the latest AI review associated with each product.

The `/api/integrations/shopify/product` endpoint will be updated to:

1. Retrieve the latest product data from Shopify.
2. Retrieve the previously persisted AI review from the database.
3. Compare the product's current `updatedAt` value with the product update timestamp stored alongside the review.
4. If the product has not changed, return the previously persisted AI review without calling Claude.
5. If the product has changed or no previous review exists, generate a new AI review using Claude and persist the result.

Only the latest AI review per product will be stored initially. Review history is outside the scope of this change.

## Data Model Considerations

The `ProductReview` model should contain:

- Product relationship.
- AI review result.
- Analysis timestamp (`analyzedAt`).
- Product update timestamp at the time of analysis (`productUpdatedAt`).

A product should have at most one current persisted review.

## Consequences

### Positive

- Reduces unnecessary Anthropic API calls.
- Reduces AI-related operational costs.
- Improves product page response times when a valid review exists.
- Preserves the latest AI review between requests.

### Negative

- Introduces additional database storage.
- Requires review freshness validation.
- Adds persistence and invalidation logic to the product retrieval flow.
- Requires handling failures during AI generation and database persistence.

## Future Considerations

- Review history and versioning.
- Explicit review regeneration by the merchant.
- Handling changes to AI prompts or model versions.
- Reanalysis when the review schema or analysis logic changes.
- Handling concurrent analysis requests for the same product.
as
## Implementation Trigger

Revisit this decision when:

- Recallio has active merchants.
- Repeated AI analysis becomes a measurable API cost.
- Product retrieval performance needs improvement.
- Persistent AI review results become necessary for the product experience.
