# Security Spec

## Data Invariants
1. A message cannot exist without a valid userId that matches the authenticated user.
2. A message cannot be created without a server timestamp (`request.time`).
3. Messages cannot be updated or deleted by anyone once created.
4. All messages must be associated with a channel (`channelId`).
5. `text` must be constrained to 1000 characters.

## The "Dirty Dozen" Payloads
1. Create message with missing channelId. (Deny)
2. Create message with missing text. (Deny)
3. Create message with missing sender. (Deny)
4. Create message with missing userId. (Deny)
5. Create message with missing createdAt. (Deny)
6. Create message with spoofed userId (not matching request.auth.uid). (Deny)
7. Create message with spoofed createdAt (client timestamp instead of request.time). (Deny)
8. Create message with text exceeding 1000 characters. (Deny)
9. Create message with extra properties (e.g., `isAdmin: true`). (Deny)
10. Update an existing message. (Deny - messages are append-only/immutable)
11. Delete an existing message. (Deny - append-only)
12. Read a message without being signed in. (Deny)
